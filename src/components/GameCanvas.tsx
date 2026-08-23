import React, { useRef, useEffect } from 'react';
import { GameEngineState } from '../systems/gameEngine';
import { Weapon } from '../types/game';
import { drawHeroSprite, drawEnemySprite, drawPetSprite } from '../utils/spriteRenderer';

interface GameCanvasProps {
  state: GameEngineState;
  onAim: (worldPos: { x: number; y: number }) => void;
  onInteract?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ state, onAim, onInteract }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef({ x: state.player.x, y: state.player.y, shake: 0 });

  // Handle canvas mouse move to convert screen coordinates to world coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldX = screenX - canvas.width / 2 + cameraRef.current.x;
    const worldY = screenY - canvas.height / 2 + cameraRef.current.y;

    onAim({ x: worldX, y: worldY });
  };

  const handleTouchAim = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const screenX = touch.clientX - rect.left;
    const screenY = touch.clientY - rect.top;

    const worldX = screenX - canvas.width / 2 + cameraRef.current.x;
    const worldY = screenY - canvas.height / 2 + cameraRef.current.y;

    onAim({ x: worldX, y: worldY });
  };

  const handleClickOrTap = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX = 0;
    let clientY = 0;

    if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const worldX = screenX - canvas.width / 2 + cameraRef.current.x;
    const worldY = screenY - canvas.height / 2 + cameraRef.current.y;

    // Check if clicked close to player or any interactable
    const distToPlayer = Math.hypot(worldX - state.player.x, worldY - state.player.y);
    if (distToPlayer < 120) {
      onInteract?.();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Camera lerp towards player
      const targetCamX = state.player.x;
      const targetCamY = state.player.y;
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.12;

      ctx.save();
      // Center camera
      ctx.translate(width / 2 - cameraRef.current.x, height / 2 - cameraRef.current.y);

      // 1. RENDER DUNGEON ROOMS & TILES
      renderDungeonFloor(ctx, state);

      // 2. RENDER ROOM OBSTACLES (Walls, Crates, Barrels, Statues, Chests, Portals)
      renderObstacles(ctx, state);

      // 3. RENDER DROPS (Coins, Energy, Potions, Weapons)
      renderDrops(ctx, state);

      // 4. RENDER PET COMPANION
      renderPet(ctx, state);

      // 5. RENDER ENEMIES & BOSSES
      renderEnemies(ctx, state);

      // 6. RENDER PLAYER HERO
      renderPlayer(ctx, state);

      // 7. RENDER SLASHES & BULLETS
      renderSlashes(ctx, state);
      renderBullets(ctx, state);

      // 8. RENDER PARTICLES & FLOATING DAMAGE TEXTS
      renderParticles(ctx, state);
      renderFloatingTexts(ctx, state);

      // 9. RENDER PROXIMITY INTERACTION PROMPTS
      renderInteractionPrompts(ctx, state);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950 select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchAim}
        onTouchMove={handleTouchAim}
        onClick={handleClickOrTap}
        className="w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
};

// --- RENDER HELPERS ---

function renderDungeonFloor(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  const { rooms, corridors, biome } = state.dungeon;

  let floorColor = '#1e293b'; // Ancient ruins
  let gridLineColor = 'rgba(255, 255, 255, 0.04)';
  let corridorColor = '#172033';

  if (biome === 'magma_forge') {
    floorColor = '#1c1917';
    gridLineColor = 'rgba(239, 68, 68, 0.08)';
    corridorColor = '#141110';
  } else if (biome === 'alien_core') {
    floorColor = '#09090b';
    gridLineColor = 'rgba(168, 85, 247, 0.08)';
    corridorColor = '#060608';
  }

  // 1. Render Corridors (Hallways) connecting rooms
  if (corridors && corridors.length > 0) {
    corridors.forEach((corr) => {
      ctx.fillStyle = corridorColor;
      ctx.fillRect(corr.x, corr.y, corr.width, corr.height);

      // Subtle corridor floor pattern
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1;
      const step = 40;
      if (corr.direction === 'horizontal') {
        for (let x = corr.x; x <= corr.x + corr.width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, corr.y);
          ctx.lineTo(x, corr.y + corr.height);
          ctx.stroke();
        }
      } else {
        for (let y = corr.y; y <= corr.y + corr.height; y += step) {
          ctx.beginPath();
          ctx.moveTo(corr.x, y);
          ctx.lineTo(corr.x + corr.width, y);
          ctx.stroke();
        }
      }
    });
  }

  // 2. Render Rooms
  rooms.forEach((room) => {
    // Room backdrop
    ctx.fillStyle = floorColor;
    ctx.fillRect(room.worldX, room.worldY, room.width, room.height);

    // Floor tile grid pattern
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1;
    const tileSize = 50;

    for (let x = room.worldX; x <= room.worldX + room.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, room.worldY);
      ctx.lineTo(x, room.worldY + room.height);
      ctx.stroke();
    }
    for (let y = room.worldY; y <= room.worldY + room.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(room.worldX, y);
      ctx.lineTo(room.worldX + room.width, y);
      ctx.stroke();
    }

    // Special floor emblem for Start, Shop, Boss, or Chest rooms
    const cx = room.worldX + room.width / 2;
    const cy = room.worldY + room.height / 2;

    if (room.type === 'start') {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.stroke();
    } else if (room.type === 'shop') {
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.stroke();
    } else if (room.type === 'boss') {
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.3)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function renderObstacles(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  const { currentRoom, isRoomLocked, dungeon } = state;
  const obstaclesToRender = dungeon.allObstacles && dungeon.allObstacles.length > 0 
    ? dungeon.allObstacles 
    : currentRoom.obstacles;

  obstaclesToRender.forEach((obs) => {
    switch (obs.type) {
      case 'wall': {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Wall 3D top edge highlight
        ctx.fillStyle = '#334155';
        ctx.fillRect(obs.x, obs.y, obs.width, Math.min(obs.height, 8));

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        break;
      }
      case 'crate': {
        // Wooden Crate
        ctx.fillStyle = '#78350f';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Wood trim
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);

        // Diagonal planks
        ctx.beginPath();
        ctx.moveTo(obs.x + 4, obs.y + 4);
        ctx.lineTo(obs.x + obs.width - 4, obs.y + obs.height - 4);
        ctx.moveTo(obs.x + obs.width - 4, obs.y + 4);
        ctx.lineTo(obs.x + 4, obs.y + obs.height - 4);
        ctx.stroke();
        break;
      }
      case 'barrel_explosive': {
        // Red Explosive TNT Barrel
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
        ctx.fill();

        // Yellow warning stripes
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(obs.x + 4, obs.y + obs.height / 2 - 4, obs.width - 8, 8);

        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      }
      case 'chest': {
        // Golden / Steel Treasure Chest
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;

        ctx.fillStyle = obs.opened ? '#475569' : '#d97706';
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
        ctx.fill();

        // Chest trim & latch
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 5, cy - 4, 10, 8);

        if (!obs.opened) {
          // Golden sparkle glow
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 28, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
      case 'shop_item': {
        // Pedestal
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Render Weapon or Potion icon on pedestal
        const item = obs.data;
        if (item && !item.bought) {
          const cx = obs.x + obs.width / 2;
          const cy = obs.y + obs.height / 2 - 8;

          if (item.weapon) {
            renderWeaponIconCanvas(ctx, item.weapon, cx, cy);
            // Weapon name & cost
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${item.cost} G`, cx, obs.y + obs.height + 16);
            ctx.fillStyle = item.weapon.color;
            ctx.fillText(item.weapon.name, cx, obs.y - 8);
          } else if (item.potionType === 'hp') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${item.cost} G`, cx, obs.y + obs.height + 16);
            ctx.fillStyle = '#f87171';
            ctx.fillText('Life Potion', cx, obs.y - 8);
          } else if (item.potionType === 'energy') {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${item.cost} G`, cx, obs.y + obs.height + 16);
            ctx.fillStyle = '#7dd3fc';
            ctx.fillText('Energy Potion', cx, obs.y - 8);
          }
        }
        break;
      }
      case 'upgrade_anvil': {
        // Blacksmith Forge Anvil
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;
        const forge = obs.data || currentRoom.upgradeForge || { cost: 25, upgraded: false };

        // Stone forge base
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y + 12, obs.width, obs.height - 12, 6);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Iron Anvil Body
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy + 4);
        ctx.lineTo(cx + 16, cy + 4);
        ctx.lineTo(cx + 10, cy - 8);
        ctx.lineTo(cx - 18, cy - 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Forge Embers / Glow
        if (!forge.upgraded) {
          const glow = (Math.sin(Date.now() / 200) + 1) * 0.5;
          ctx.strokeStyle = `rgba(249, 115, 22, ${0.4 + glow * 0.4})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 26, 0, Math.PI * 2);
          ctx.stroke();

          // Cost & Label
          ctx.fillStyle = '#f97316';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FORGE ANVIL', cx, obs.y - 10);
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(`${forge.cost} G (Upgrade +1)`, cx, obs.y + obs.height + 16);
        } else {
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FORGED', cx, obs.y - 10);
        }
        break;
      }
      case 'magic_spring': {
        // Rejuvenation Spring Fountain
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;
        const spring = obs.data || currentRoom.magicSpring || { cost: 15, used: false };
        const time = Date.now() / 300;

        // Stone Basin Outer Rim
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(cx, cy, obs.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Water Pool
        ctx.fillStyle = spring.used ? '#1e293b' : '#0284c7';
        ctx.beginPath();
        ctx.arc(cx, cy, obs.width / 2 - 5, 0, Math.PI * 2);
        ctx.fill();

        if (!spring.used) {
          // Rippling water highlights
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, (obs.width / 4) + Math.sin(time) * 4, 0, Math.PI * 2);
          ctx.stroke();

          // Radiance mist
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.beginPath();
          ctx.arc(cx, cy, obs.width / 2 + 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('MAGIC SPRING', cx, obs.y - 10);
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(`${spring.cost} G (Full Heal & +1 Shield)`, cx, obs.y + obs.height + 16);
        } else {
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DRIED SPRING', cx, obs.y - 10);
        }
        break;
      }
      case 'weapon_pedestal': {
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;
        const item = obs.data;

        // Pedestal Column
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (item && !item.bought && item.weapon) {
          renderWeaponIconCanvas(ctx, item.weapon, cx, cy - 8);
          ctx.fillStyle = item.weapon.color;
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(item.weapon.name, cx, obs.y - 8);
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(`${item.cost} G`, cx, obs.y + obs.height + 16);
        }
        break;
      }
      case 'statue': {
        // Ancient Guardian Shrine
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;

        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
        ctx.fill();

        // Guardian glowing rune
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(cx, cy - 14, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Guardian title & price
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentRoom.statueBlessing?.name || 'Guardian Shrine', cx, obs.y - 12);
        if (currentRoom.statueBlessing && !currentRoom.statueBlessing.prayed) {
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText(`${currentRoom.statueBlessing.cost} G (Pray)`, cx, obs.y + obs.height + 16);
        }
        break;
      }
      case 'portal': {
        // Next Floor Portal Vortex
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;
        const time = Date.now() / 250;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time);

        // Swirling Portal Spiral
        const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 32);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.4, '#a855f7');
        gradient.addColorStop(0.8, '#3b82f6');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NEXT FLOOR [SPACE / ENTER]', cx, obs.y + obs.height + 18);
        break;
      }
    }
  });

  // Render combat lock barrier on doors if room is currently locked in combat
  if (isRoomLocked) {
    const rx = currentRoom.worldX;
    const ry = currentRoom.worldY;
    const rw = currentRoom.width;
    const rh = currentRoom.height;
    const pulse = (Math.sin(Date.now() / 150) + 1) * 0.5;

    ctx.strokeStyle = `rgba(239, 68, 68, ${0.7 + pulse * 0.3})`;
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);

    if (currentRoom.doors.top) {
      ctx.beginPath();
      ctx.moveTo(rx + rw / 2 - 38, ry + 18);
      ctx.lineTo(rx + rw / 2 + 38, ry + 18);
      ctx.stroke();
    }
    if (currentRoom.doors.bottom) {
      ctx.beginPath();
      ctx.moveTo(rx + rw / 2 - 38, ry + rh - 18);
      ctx.lineTo(rx + rw / 2 + 38, ry + rh - 18);
      ctx.stroke();
    }
    if (currentRoom.doors.left) {
      ctx.beginPath();
      ctx.moveTo(rx + 18, ry + rh / 2 - 38);
      ctx.lineTo(rx + 18, ry + rh / 2 + 38);
      ctx.stroke();
    }
    if (currentRoom.doors.right) {
      ctx.beginPath();
      ctx.moveTo(rx + rw - 18, ry + rh / 2 - 38);
      ctx.lineTo(rx + rw - 18, ry + rh / 2 + 38);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}

function renderPlayer(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  const { player } = state;
  const { x, y, radius, facingRight, aimAngle, isRolling, isPaladinBarrier, hero } = player;

  ctx.save();

  // Paladin Holy Barrier Glow
  if (isPaladinBarrier) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, radius + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Gojo Limitless Infinity Barrier & Six Eyes Aura
  if (player.isLimitlessBarrier || hero.id === 'gojo') {
    const pulse = Math.sin(Date.now() / 180) * 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.beginPath();
    ctx.arc(x, y, radius + 20 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Orbital Infinity Runes
    for (let i = 0; i < 3; i++) {
      const orbAng = Date.now() / 400 + (i * Math.PI * 2) / 3;
      const orbX = x + Math.cos(orbAng) * (radius + 22);
      const orbY = y + Math.sin(orbAng) * (radius + 22);
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(orbX, orbY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Roll Rotation / After-image
  if (isRolling) {
    ctx.translate(x, y);
    ctx.rotate((Date.now() / 50) % (Math.PI * 2));
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Draw Unique Hero Sprite
  drawHeroSprite(ctx, hero.id, x, y, radius, {
    facingRight,
    animTime: Date.now() / 1000,
    isHit: Date.now() - player.lastDamageTime < 180,
  });

  ctx.restore();

  // Render Equipped Weapon pointing toward Aim Angle
  const activeWeapon = state.activeWeaponIndex === 0 ? state.primaryWeapon : state.secondaryWeapon || state.primaryWeapon;
  renderEquippedWeapon(ctx, activeWeapon, x, y, aimAngle, facingRight, player.isDualWielding);
}

function renderEquippedWeapon(
  ctx: CanvasRenderingContext2D,
  weapon: Weapon,
  px: number,
  py: number,
  angle: number,
  facingRight: boolean,
  isDual: boolean
) {
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(angle);

  // Weapon Sprite
  const gunLength = weapon.type === 'melee' ? 32 : weapon.type === 'bow' ? 24 : 20;
  const gunWidth = weapon.type === 'launcher' ? 8 : 5;

  ctx.fillStyle = weapon.color;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;

  if (weapon.type === 'melee') {
    // Sword blade
    ctx.beginPath();
    ctx.moveTo(10, -4);
    ctx.lineTo(10 + gunLength, 0);
    ctx.lineTo(10, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hilt
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(8, -6, 4, 12);
  } else if (weapon.type === 'bow') {
    // Arc Bow
    ctx.strokeStyle = weapon.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(14, 0, 14, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  } else {
    // Gun Barrel
    ctx.beginPath();
    ctx.roundRect(8, -gunWidth / 2, gunLength, gunWidth, 2);
    ctx.fill();
    ctx.stroke();
  }

  // Dual Wield second weapon
  if (isDual) {
    ctx.beginPath();
    ctx.roundRect(8, gunWidth / 2 + 3, gunLength, gunWidth, 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function renderPet(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  const { petState, player } = state;
  const pet = player.pet;
  const facingRight = petState.vx >= 0;

  drawPetSprite(ctx, pet, petState.x, petState.y, {
    facingRight,
    animTime: Date.now() / 1000,
  });
}

function renderEnemies(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  state.enemies.forEach((enemy) => {
    // Draw Unique Enemy Sprite
    drawEnemySprite(ctx, enemy, {
      facingRight: enemy.facingRight,
      animTime: Date.now() / 1000,
      scale: enemy.isElite ? 1.25 : 1,
    });

    // Health Bar & Name above monster
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const barW = enemy.radius * 2.2;
    const barH = 5;
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(-barW / 2, -enemy.radius - 14, barW, barH);
    ctx.fillStyle = enemy.isBoss ? '#ef4444' : enemy.isElite ? '#f59e0b' : '#22c55e';
    ctx.fillRect(-barW / 2, -enemy.radius - 14, barW * hpRatio, barH);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW / 2, -enemy.radius - 14, barW, barH);

    // Status condition icons above health bar
    if (enemy.statuses.length > 0) {
      let iconX = -barW / 2;
      enemy.statuses.forEach((st) => {
        ctx.fillStyle = st.type === 'burn' ? '#ea580c' : st.type === 'poison' ? '#84cc16' : st.type === 'freeze' ? '#38bdf8' : '#eab308';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(st.type.substring(0, 3).toUpperCase(), iconX, -enemy.radius - 17);
        iconX += 16;
      });
    }

    ctx.restore();
  });
}

function renderBullets(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  state.bullets.forEach((bullet) => {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);

    // Bullet Glow & Core
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(0, 0, bullet.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  });
}

function renderSlashes(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  state.slashes.forEach((slash) => {
    ctx.save();
    ctx.translate(slash.x, slash.y);
    ctx.rotate(slash.angle);

    // Crescent slash wave
    ctx.fillStyle = slash.color;
    ctx.beginPath();
    ctx.arc(0, 0, slash.radius, -slash.arc / 2, slash.arc / 2);
    ctx.arc(0, 0, slash.radius * 0.6, slash.arc / 2, -slash.arc / 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });
}

function renderDrops(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  state.drops.forEach((drop) => {
    ctx.save();
    ctx.translate(drop.x, drop.y);

    // Bobbing bounce
    const bob = Math.sin((Date.now() + drop.x) / 180) * 3;

    if (drop.type === 'coin') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, bob, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (drop.type === 'energy') {
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, bob, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (drop.type === 'hp_potion') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, bob, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (drop.type === 'weapon' && drop.weapon) {
      renderWeaponIconCanvas(ctx, drop.weapon, 0, bob);
      ctx.fillStyle = drop.weapon.color;
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(drop.weapon.name, 0, bob + 16);
    }

    ctx.restore();
  });
}

function renderParticles(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  state.particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function renderFloatingTexts(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  state.floatingTexts.forEach((ft) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.fillStyle = ft.color;
    ctx.font = ft.isCrit ? 'bold 15px system-ui, sans-serif' : 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 1;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}

function renderWeaponIconCanvas(ctx: CanvasRenderingContext2D, weapon: Weapon, x: number, y: number) {
  ctx.fillStyle = weapon.color;
  ctx.beginPath();
  ctx.roundRect(x - 12, y - 6, 24, 12, 3);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function renderInteractionPrompts(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  const { player, currentRoom } = state;
  let promptText = '';
  let promptX = player.x;
  let promptY = player.y - 48;
  let promptColor = '#fbbf24';

  // Check closest dropped weapon
  for (const drop of state.drops) {
    if (drop.type === 'weapon' && drop.weapon) {
      const d = Math.hypot(player.x - drop.x, player.y - drop.y);
      if (d < 75) {
        promptText = `[USE / E] Equip ${drop.weapon.name}`;
        promptX = drop.x;
        promptY = drop.y - 28;
        promptColor = drop.weapon.color;
        break;
      }
    }
  }

  // Check closest room obstacle
  if (!promptText) {
    for (const obs of currentRoom.obstacles) {
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      const d = Math.hypot(player.x - cx, player.y - cy);
      if (d < 80) {
        if (obs.type === 'chest' && !obs.opened) {
          promptText = '[USE / E] Open Chest';
          promptX = cx;
          promptY = obs.y - 22;
          promptColor = '#fbbf24';
          break;
        } else if (obs.type === 'shop_item' && obs.data && !obs.data.bought) {
          const item = obs.data;
          promptText = `[USE / E] Buy (${item.cost} G)`;
          promptX = cx;
          promptY = obs.y - 22;
          promptColor = '#38bdf8';
          break;
        } else if (obs.type === 'upgrade_anvil') {
          const forge = obs.data || currentRoom.upgradeForge || { cost: 25, upgraded: false };
          if (!forge.upgraded) {
            promptText = `[USE / E] Upgrade Weapon (${forge.cost} G)`;
            promptX = cx;
            promptY = obs.y - 24;
            promptColor = '#f97316';
            break;
          }
        } else if (obs.type === 'magic_spring') {
          const spring = obs.data || currentRoom.magicSpring || { cost: 15, used: false };
          if (!spring.used) {
            promptText = `[USE / E] Drink Spring (${spring.cost} G)`;
            promptX = cx;
            promptY = obs.y - 24;
            promptColor = '#38bdf8';
            break;
          }
        } else if (obs.type === 'statue' && currentRoom.statueBlessing && !currentRoom.statueBlessing.prayed) {
          promptText = `[USE / E] Pray to ${currentRoom.statueBlessing.name} (${currentRoom.statueBlessing.cost} G)`;
          promptX = cx;
          promptY = obs.y - 24;
          promptColor = '#38bdf8';
          break;
        } else if (obs.type === 'portal') {
          promptText = '[USE / E] Enter Portal';
          promptX = cx;
          promptY = obs.y - 24;
          promptColor = '#c084fc';
          break;
        }
      }
    }
  }

  if (promptText) {
    ctx.save();
    ctx.font = 'bold 12px system-ui, sans-serif';
    const textW = ctx.measureText(promptText).width;
    const padX = 10;
    const padY = 5;

    // Dark glass pill background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(promptX - textW / 2 - padX, promptY - 14 - padY, textW + padX * 2, 24, 6);
    ctx.fill();

    ctx.strokeStyle = promptColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(promptText, promptX, promptY - 2);
    ctx.restore();
  }
}

