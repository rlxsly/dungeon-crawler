// High-fidelity procedural sprite renderer for Heroes, Enemies, Bosses, and Pets.
import { HeroClass, Enemy, Pet } from '../types/game';

interface SpriteRenderOptions {
  facingRight?: boolean;
  isMoving?: boolean;
  animTime?: number;
  isHit?: boolean;
  scale?: number;
  alpha?: number;
}

/**
 * Draws a pixelated/geometric Soul Knight hero with distinct armor, accessories, and characteristics.
 */
export function drawHeroSprite(
  ctx: CanvasRenderingContext2D,
  heroId: HeroClass,
  x: number,
  y: number,
  radius: number = 18,
  options: SpriteRenderOptions = {}
) {
  const { facingRight = true, animTime = 0, isHit = false, scale = 1, alpha = 1 } = options;
  const t = animTime || Date.now() / 1000;
  const bob = Math.sin(t * 8) * 1.5;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale * (facingRight ? 1 : -1), scale);
  ctx.globalAlpha = alpha;

  if (isHit) {
    ctx.filter = 'brightness(2) contrast(1.5)';
  }

  // Common Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, radius + 4 - bob, radius * 0.9, radius * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (heroId) {
    case 'knight': {
      // THE VANGUARD: Royal Blue Cloak, Steel Knight Helm with T-visor, Gold Crest
      // Cape
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-18 + Math.sin(t * 6) * 3, 16);
      ctx.lineTo(-6, 16);
      ctx.lineTo(-4, -2);
      ctx.fill();

      // Body Armor (Steel Blue)
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-10, -8, 20, 18);
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(-8, -4, 16, 12);

      // Gold Belt & Buckle
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-10, 6, 20, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-3, 5, 6, 6);

      // Steel Helmet
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-11, -22, 22, 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-9, -20, 18, 5); // Helm highlight

      // Golden Winged Feather Crest
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-4, -22);
      ctx.lineTo(0, -30);
      ctx.lineTo(4, -22);
      ctx.closePath();
      ctx.fill();

      // T-Visor with glowing blue slit
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, -14, 16, 4);
      ctx.fillRect(-2, -14, 4, 8);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(facingRight ? 1 : -7, -13, 6, 2);

      // Shoulder Pauldrons
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-14, -8, 5, 8);
      ctx.fillRect(9, -8, 5, 8);
      break;
    }

    case 'rogue': {
      // THE SHADOW RUNNER: Crimson Ninja Cowl, Long Flowing Scarf, Sleek Dark Garb
      // Flowing Long Crimson Scarf
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(-24 + Math.sin(t * 8) * 4, -8 + Math.cos(t * 8) * 2);
      ctx.lineTo(-28 + Math.sin(t * 8) * 5, 6);
      ctx.lineTo(-8, 2);
      ctx.closePath();
      ctx.fill();

      // Dark Assassin Robe
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-9, -8, 18, 18);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-7, -4, 14, 12);

      // Utility Straps
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(8, 6);
      ctx.stroke();

      // Crimson Hood / Cowl
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-10, -22, 20, 16);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-10, -24, 16, 4); // Hood peak

      // Shadowed Mask Face
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-8, -15, 16, 8);

      // Piercing Focused Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(facingRight ? 0 : -6, -14, 5, 2);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(facingRight ? 2 : -4, -14, 2, 2);
      break;
    }

    case 'wizard': {
      // ARCANE SORCERESS: Pointed Wizard Hat with Gold Star, Floating Arcane Orbs, Violet Robes
      // Robes (Deep Arcane Violet)
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.lineTo(-14, 14);
      ctx.lineTo(14, 14);
      ctx.lineTo(10, -6);
      ctx.closePath();
      ctx.fill();

      // Gold Trim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-12, 11, 24, 3);
      ctx.fillRect(-2, -6, 4, 17);

      // Wizard Head
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-9, -16, 18, 12);

      // Mystic Glowing Eyes
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(facingRight ? 0 : -6, -13, 6, 3);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(facingRight ? 2 : -4, -13, 3, 3);

      // Pointed Wizard Hat
      ctx.fillStyle = '#7e22ce';
      // Hat Brim
      ctx.fillRect(-15, -17, 30, 4);
      // Hat Cone
      ctx.beginPath();
      ctx.moveTo(-11, -17);
      ctx.lineTo(6 + Math.sin(t * 3) * 2, -34);
      ctx.lineTo(11, -17);
      ctx.closePath();
      ctx.fill();

      // Star Buckle on Hat
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-2, -20, 5, 5);

      // Floating Arcane Rune Orbs
      const orbAngle = t * 4;
      const orbX = Math.cos(orbAngle) * 18;
      const orbY = Math.sin(orbAngle) * 8 - 10;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(orbX, orbY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'assassin': {
      // SILENT EDGE: Cyber-Emerald Ninja Visor, Dark Plate, Twin Back Blades
      // Twin Katana Sheaths on back
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-16, -20);
      ctx.lineTo(-4, 12);
      ctx.moveTo(-12, -22);
      ctx.lineTo(0, 10);
      ctx.stroke();

      // Body (Carbon Mesh)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(-10, -8, 20, 18);
      ctx.fillStyle = '#047857';
      ctx.fillRect(-7, -5, 14, 12);

      // Emerald Cyber Head
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10, -22, 20, 16);

      // Glowing Neon Visor
      ctx.fillStyle = '#10b981';
      ctx.fillRect(facingRight ? -2 : -8, -15, 10, 3);
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(facingRight ? 1 : -5, -15, 4, 3);

      // Headband Ribbons
      ctx.fillStyle = '#34d399';
      ctx.fillRect(-14 + Math.sin(t * 6) * 3, -18, 6, 3);
      break;
    }

    case 'alchemist': {
      // TOXIC BREWMASTER: Plague Mask with Brass Goggles, Acid Beaker Flasks, Leather Apron
      // Leather Apron & Shirt
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(-10, -8, 20, 18);
      ctx.fillStyle = '#713f12';
      ctx.fillRect(-7, -4, 14, 14);

      // Toxic Flask on belt
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(-8, 5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#bef264';
      ctx.fillRect(-9, -1, 2, 3);

      // Plague Doctor Hat & Mask
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-14, -18, 28, 4); // Hat brim
      ctx.fillRect(-10, -24, 20, 8); // Hat top

      // White Plague Beak
      ctx.fillStyle = '#f5f5f4';
      ctx.beginPath();
      ctx.moveTo(facingRight ? 4 : -4, -16);
      ctx.lineTo(facingRight ? 16 : -16, -10);
      ctx.lineTo(facingRight ? 4 : -4, -8);
      ctx.closePath();
      ctx.fill();

      // Brass Round Goggles
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(facingRight ? 3 : -3, -13, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e'; // Green lens reflection
      ctx.beginPath();
      ctx.arc(facingRight ? 3 : -3, -13, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'paladin': {
      // SACRED BASTION: Radiant Crusader Helm, Floating Halo, White & Gold Lion Tabard
      // Floating Halo
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -30 + Math.sin(t * 4) * 2, 9, 3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Heavy Gold Body & Tabard
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-11, -8, 22, 18);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-6, -6, 12, 16); // White tabard

      // Golden Holy Cross on Chest
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-4, -2, 8, 3);
      ctx.fillRect(-2, -4, 4, 8);

      // Heavy Gold Crusader Helm
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-11, -22, 22, 16);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-9, -20, 18, 4);

      // Cross Visor Slit
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -14, 16, 3);
      ctx.fillRect(-1, -17, 3, 9);
      ctx.fillStyle = '#38bdf8'; // Holy eye glow
      ctx.fillRect(facingRight ? 1 : -6, -14, 5, 2);

      // Heavy Lion Pauldrons
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-15, -8, 5, 9);
      ctx.fillRect(10, -8, 5, 9);
      break;
    }

    case 'gojo': {
      // SATORU GOJO (THE HONORED ONE - JUJUTSU SHENANIGANS):
      // Spiky Snow-White Hair, Iconic Black Blindfold, Navy Jujutsu High High-Collar Uniform, Infinity Aura

      // Limitless Cyan Aura Pulsing Ring
      const auraPulse = Math.sin(t * 5) * 3;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -5, radius + 5 + auraPulse, 0, Math.PI * 2);
      ctx.stroke();

      // Cursed Energy Flow particles
      ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
      for (let i = 0; i < 3; i++) {
        const ang = t * 3 + (i * Math.PI * 2) / 3;
        const orbitR = radius + 6;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * orbitR, -5 + Math.sin(ang) * orbitR, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dark Navy Jujutsu High Uniform Body
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-9, -8, 18, 18);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-7, -4, 14, 12);

      // Gold Uniform Button
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(facingRight ? 2 : -2, -2, 2, 0, Math.PI * 2);
      ctx.fill();

      // High Collar
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-10, -12, 20, 6);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -12, 16, 2);

      // Head Base (Pale Skin Tone)
      ctx.fillStyle = '#fce7f3';
      ctx.fillRect(-8, -22, 16, 12);

      // Iconic Black Blindfold
      ctx.fillStyle = '#020617';
      ctx.fillRect(-9, -19, 18, 7);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-9, -19, 18, 2); // Blindfold seam highlight

      // Glowing Six Eyes Azure glint through blindfold
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(facingRight ? 1 : -6, -17, 4, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(facingRight ? 2 : -5, -16, 2, 1);

      // Spiky Snow-White Hair (Gojo iconic locks)
      ctx.fillStyle = '#f8fafc';
      // Main hair crown
      ctx.fillRect(-9, -24, 18, 4);
      // Spikes pointing up and back
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.lineTo(-14, -28);
      ctx.lineTo(-8, -25);
      ctx.lineTo(-4, -31);
      ctx.lineTo(0, -26);
      ctx.lineTo(5, -31);
      ctx.lineTo(9, -25);
      ctx.lineTo(13, -28);
      ctx.lineTo(9, -22);
      ctx.closePath();
      ctx.fill();

      // Hair shading
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-8, -25, 4, 2);
      ctx.fillRect(2, -25, 4, 2);

      // Infinity Cursed Energy hands
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(facingRight ? 10 : -10, 2, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws distinct enemy sprites with individual weapons, silhouettes, and features.
 */
export function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  options: SpriteRenderOptions = {}
) {
  const { facingRight = enemy.facingRight, animTime = 0, isHit = false, scale = 1, alpha = 1 } = options;
  const t = animTime || Date.now() / 1000;
  const bob = Math.sin(t * 6 + enemy.x) * 1.5;

  ctx.save();
  ctx.translate(enemy.x, enemy.y + bob);
  ctx.scale(scale * (facingRight ? 1 : -1), scale);
  ctx.globalAlpha = alpha;

  if (isHit) {
    ctx.filter = 'brightness(2) contrast(1.5)';
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, enemy.radius + 3 - bob, enemy.radius * 0.9, enemy.radius * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (enemy.type) {
    case 'goblin_gunner': {
      // Green skin body
      ctx.fillStyle = enemy.color || '#22c55e';
      ctx.fillRect(-9, -8, 18, 16);

      // Leather Vest
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-9, -5, 18, 10);

      // Head
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-9, -20, 18, 13);

      // Red Bandana
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-10, -22, 20, 5);
      ctx.fillRect(-14 + Math.sin(t * 7) * 2, -19, 5, 4);

      // Long Goblin Ears
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(-9, -15);
      ctx.lineTo(-17, -20);
      ctx.lineTo(-9, -10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(9, -15);
      ctx.lineTo(17, -20);
      ctx.lineTo(9, -10);
      ctx.fill();

      // Gold Earring
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-17, -18, 3, 3);

      // Glowing Eyes & Sharp Tooth
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(facingRight ? 0 : -6, -14, 5, 3);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(facingRight ? 2 : -4, -14, 2, 3);
      // Sharp Fang
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(facingRight ? 4 : -6, -8, 2, 3);

      // Blunderbuss gun in hand
      ctx.fillStyle = '#475569';
      ctx.fillRect(6, -4, 12, 5);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(16, -6, 4, 9); // Flared barrel
      break;
    }

    case 'skeleton_archer': {
      // Bleached Ribcage & Spine
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-6, -6, 12, 14);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, -4, 8, 2);
      ctx.fillRect(-4, 0, 8, 2);
      ctx.fillRect(-4, 4, 8, 2);

      // Skull
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-9, -20, 18, 14);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-6, -8, 12, 4); // Jaw

      // Glowing Sockets
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-6, -16, 5, 5);
      ctx.fillRect(2, -16, 5, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(facingRight ? 4 : -4, -14, 2, 2);

      // Wooden Bow & Quiver
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(10, 0, 12, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();

      // Quiver arrows on back
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-10, -18, 3, 10);
      break;
    }

    case 'boar_charger': {
      // Chunky Bristled Body
      ctx.fillStyle = enemy.color || '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, -2, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spiky Back Bristles
      ctx.fillStyle = '#78350f';
      for (let i = -14; i <= 6; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, -12);
        ctx.lineTo(i + 3, -19);
        ctx.lineTo(i + 6, -12);
        ctx.fill();
      }

      // Snout & Nostril
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(facingRight ? 10 : -18, -6, 9, 8);
      ctx.fillStyle = '#431407';
      ctx.fillRect(facingRight ? 15 : -17, -4, 3, 3);

      // Sharp Ivory Tusks
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(facingRight ? 11 : -11, -2);
      ctx.lineTo(facingRight ? 17 : -17, -10);
      ctx.lineTo(facingRight ? 8 : -8, -4);
      ctx.fill();

      // Furious Red Eye
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(facingRight ? 4 : -8, -9, 4, 3);
      break;
    }

    case 'alien_laser': {
      // Floating Biomechanical Eyeball & Cyber Tentacles
      const tentacleWave = Math.sin(t * 5) * 4;

      // Cybernetic Tentacles
      ctx.strokeStyle = '#6b21a8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-8, 6);
      ctx.quadraticCurveTo(-14 + tentacleWave, 16, -10, 24);
      ctx.moveTo(0, 8);
      ctx.quadraticCurveTo(tentacleWave, 18, 2, 26);
      ctx.moveTo(8, 6);
      ctx.quadraticCurveTo(14 - tentacleWave, 16, 12, 24);
      ctx.stroke();

      // Purple Metallic Orb
      ctx.fillStyle = enemy.color || '#a855f7';
      ctx.beginPath();
      ctx.arc(0, -4, 15, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Ring Frame
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Giant Central Laser Pupil Lens
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(facingRight ? 3 : -3, -4, 8, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Cyan Laser Aperture
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(facingRight ? 4 : -4, -4, 4 + Math.sin(t * 10) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'slime': {
      // Wobbly Jelly Droplet
      const wobbleX = 1 + Math.sin(t * 8) * 0.15;
      const wobbleY = 1 - Math.sin(t * 8) * 0.15;

      ctx.fillStyle = enemy.color || '#10b981';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15 * wobbleX, 13 * wobbleY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner Floating Gem Nucleus
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(0, -1, 5, 0, Math.PI * 2);
      ctx.fill();

      // Big Cute Sparkly Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(facingRight ? 4 : -4, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(facingRight ? 5 : -3, -4, 1.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'shaman': {
      // Tribal Horned Skull Mask & Robe
      ctx.fillStyle = enemy.color || '#ea580c';
      ctx.fillRect(-10, -6, 20, 16);

      // Bone Skull Mask
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-9, -20, 18, 14);

      // Curved Ram Horns
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(-8, -18);
      ctx.quadraticCurveTo(-18, -28, -12, -34);
      ctx.quadraticCurveTo(-14, -22, -6, -18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, -18);
      ctx.quadraticCurveTo(18, -28, 12, -34);
      ctx.quadraticCurveTo(14, -22, 6, -18);
      ctx.fill();

      // Glowing Mystical Sockets
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(facingRight ? 1 : -6, -15, 5, 4);

      // Shaman Staff with Crystal Orb
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(12, -24);
      ctx.lineTo(12, 12);
      ctx.stroke();

      // Glowing Staff Orb
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(12, -24, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // --- BOSSES ---
    case 'boss_sukuna': {
      // Ryomen Sukuna - King of Curses
      drawBossSukuna(ctx, enemy, t, facingRight);
      break;
    }

    case 'boss_grand_knight': {
      // Colossal Royal Boss Knight
      drawBossGrandKnight(ctx, enemy, t, facingRight);
      break;
    }

    case 'boss_devil_snare': {
      // Primordial Carnivorous Plant Boss
      drawBossDevilSnare(ctx, enemy, t);
      break;
    }

    case 'boss_void_emperor': {
      // Cosmic Dark Void Overlord
      drawBossVoidEmperor(ctx, enemy, t, facingRight);
      break;
    }
  }

  ctx.restore();
}

/**
 * BOSS: Ryomen Sukuna (King of Curses)
 */
export function drawBossSukuna(
  ctx: CanvasRenderingContext2D,
  boss: Enemy | { radius: number; color?: string; maxHp?: number; hp?: number },
  t: number = Date.now() / 1000,
  facingRight: boolean = true
) {
  // Malevolent Shrine Crimson Slashing Domain Aura
  const slashPulse = Math.sin(t * 8) * 4;
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 36 + slashPulse, 0, Math.PI * 2);
  ctx.stroke();

  // Floating Cursed Slash Marks (Dismantle blades orbiting)
  for (let i = 0; i < 4; i++) {
    const ang = t * 4 + (i * Math.PI) / 2;
    const orbitR = 40;
    const sx = Math.cos(ang) * orbitR;
    const sy = Math.sin(ang) * orbitR;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, sy, 8, ang - 0.6, ang + 0.6);
    ctx.stroke();
  }

  // Dark Kimono Robe
  ctx.fillStyle = '#18181b';
  ctx.fillRect(-18, -12, 36, 38);
  ctx.fillStyle = '#27272a';
  ctx.fillRect(-14, -8, 28, 32);

  // Black Obi Sash Belt
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-18, 12, 36, 6);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(-4, 10, 8, 10); // Red knot

  // Exposed Muscular Chest with Iconic Black Curse Markings
  ctx.fillStyle = '#fce7f3';
  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.lineTo(10, -12);
  ctx.lineTo(0, 8);
  ctx.closePath();
  ctx.fill();

  // Black Curse Tattoo lines on chest
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-6, -8, 12, 2);
  ctx.fillRect(-4, -4, 8, 2);
  ctx.fillRect(-2, 0, 4, 3);

  // Broad Shoulders & Curse Markings
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-20, -14, 5, 14);
  ctx.fillRect(15, -14, 5, 14);

  // Sukuna Head Base (Pale skin)
  ctx.fillStyle = '#fce7f3';
  ctx.fillRect(-12, -32, 24, 20);

  // Iconic Facial Curse Tattoos (Forehead band, eye rings, cheek stripes)
  ctx.fillStyle = '#09090b';
  // Forehead band tattoo
  ctx.fillRect(-10, -31, 20, 3);
  ctx.fillRect(-2, -28, 4, 3);
  // Cheek claw markings
  ctx.fillRect(-11, -22, 4, 6);
  ctx.fillRect(7, -22, 4, 6);

  // Four Glowing Crimson Eyes (Two primary + two sub-eye slits)
  ctx.fillStyle = '#dc2626';
  // Primary eyes
  ctx.fillRect(facingRight ? 1 : -9, -24, 7, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(facingRight ? 3 : -7, -23, 2, 2);
  // Secondary eyes beneath
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(facingRight ? 0 : -8, -20, 5, 2);

  // Menacing Smirk / Mouth
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-4, -15, 8, 2);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(facingRight ? 1 : -3, -15, 3, 2);

  // Wild Spiky Pinkish-Black Hair
  ctx.fillStyle = '#f472b6';
  // Base hair layer
  ctx.fillRect(-13, -35, 26, 6);
  // Wild Hair Spikes
  ctx.beginPath();
  ctx.moveTo(-14, -30);
  ctx.lineTo(-20, -42);
  ctx.lineTo(-12, -36);
  ctx.lineTo(-6, -46);
  ctx.lineTo(0, -38);
  ctx.lineTo(7, -46);
  ctx.lineTo(13, -36);
  ctx.lineTo(20, -42);
  ctx.lineTo(14, -30);
  ctx.closePath();
  ctx.fill();

  // Dark hair shadow tips
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-18, -41, 4, 4);
  ctx.fillRect(-5, -45, 3, 4);
  ctx.fillRect(8, -45, 3, 4);
  ctx.fillRect(16, -41, 4, 4);

  // Cursed Flame Arrow on right hand
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(facingRight ? 20 : -20, 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(facingRight ? 20 : -20, 2, 3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * BOSS 1: Grand Knight
 */
export function drawBossGrandKnight(
  ctx: CanvasRenderingContext2D,
  boss: Enemy | { radius: number; color?: string; maxHp?: number; hp?: number },
  t: number = Date.now() / 1000,
  facingRight: boolean = true
) {
  // Heavy Royal Blue Cape
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.moveTo(-20, -10);
  ctx.lineTo(-38 + Math.sin(t * 4) * 6, 32);
  ctx.lineTo(-10, 32);
  ctx.lineTo(-6, -4);
  ctx.fill();

  // Colossal Steel Plate Armor
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(-22, -16, 44, 36);
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(-18, -10, 36, 26);

  // Gold Royal Trim & Crest
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-24, 10, 48, 6);
  ctx.fillRect(-5, -14, 10, 20); // Gold cross

  // Great Helm
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-20, -42, 40, 28);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-18, -40, 36, 8);

  // Towering Fiery Red Crest Plume
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-10, -42);
  ctx.quadraticCurveTo(0, -64 + Math.sin(t * 6) * 4, 18, -42);
  ctx.fill();

  // Glowing Visor Eyes
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-16, -28, 32, 6);
  ctx.fillStyle = '#ef4444'; // Menacing red eye slit
  ctx.fillRect(facingRight ? 2 : -12, -27, 10, 4);

  // Massive Pauldrons
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-30, -18, 10, 18);
  ctx.fillRect(20, -18, 10, 18);

  // Tower Shield
  ctx.fillStyle = '#1e40af';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.fillRect(-32, -6, 16, 32);
  ctx.strokeRect(-32, -6, 16, 32);

  // Grand Claymore Sword
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(18, -36, 7, 56);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(14, 12, 15, 6); // Crossguard
}

/**
 * BOSS 2: Devil's Snare
 */
export function drawBossDevilSnare(
  ctx: CanvasRenderingContext2D,
  boss: Enemy | { radius: number; color?: string; maxHp?: number; hp?: number },
  t: number = Date.now() / 1000
) {
  // Thorny Vine Tentacles
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 5;
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const wave = Math.sin(t * 4 + i) * 12;
    const vx = Math.cos(ang) * 44 + wave;
    const vy = Math.sin(ang) * 44 + wave;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(vx * 0.6, vy * 0.6 - 15, vx, vy);
    ctx.stroke();

    // Spore Bulb on tips
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(vx, vy, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Giant Carnivorous Bulb & Petals
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();

  // Toxic Core Petals
  ctx.fillStyle = '#15803d';
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + t * 0.5;
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * 20, Math.sin(ang) * 20, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Snapping Jaws
  ctx.fillStyle = '#450a0a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 12 + Math.sin(t * 5) * 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sharp Yellow Thorns/Teeth
  ctx.fillStyle = '#fef08a';
  for (let i = -10; i <= 10; i += 5) {
    ctx.fillRect(i, -6, 2, 4);
    ctx.fillRect(i, 2, 2, 4);
  }

  // Evil Eye Pods
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(-10, -12, 4, 0, Math.PI * 2);
  ctx.arc(10, -12, 4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * BOSS 3: Void Emperor
 */
export function drawBossVoidEmperor(
  ctx: CanvasRenderingContext2D,
  boss: Enemy | { radius: number; color?: string; maxHp?: number; hp?: number },
  t: number = Date.now() / 1000,
  facingRight: boolean = true
) {
  // Cosmic Starry Aura Wings
  const wingSpread = Math.sin(t * 3) * 6;
  ctx.fillStyle = 'rgba(88, 28, 135, 0.4)';
  ctx.beginPath();
  ctx.moveTo(-45 - wingSpread, -30);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-40 - wingSpread, 30);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(45 + wingSpread, -30);
  ctx.lineTo(10, 0);
  ctx.lineTo(40 + wingSpread, 30);
  ctx.closePath();
  ctx.fill();

  // Dark Void Mantle
  ctx.fillStyle = '#0f0728';
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Obsidian Crown Horns
  ctx.fillStyle = '#581c87';
  ctx.beginPath();
  ctx.moveTo(-20, -26);
  ctx.lineTo(-32, -54);
  ctx.lineTo(-12, -34);
  ctx.lineTo(0, -58);
  ctx.lineTo(12, -34);
  ctx.lineTo(32, -54);
  ctx.lineTo(20, -26);
  ctx.closePath();
  ctx.fill();

  // Orbiting Void Crystals
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + t * 2;
    const cx = Math.cos(ang) * 44;
    const cy = Math.sin(ang) * 22;
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx + 4, cy);
    ctx.lineTo(cx, cy + 6);
    ctx.lineTo(cx - 4, cy);
    ctx.closePath();
    ctx.fill();
  }

  // Glowing Void Core Eye
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(0, -6, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(facingRight ? 2 : -2, -6, 5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws Pet Companion sprites.
 */
export function drawPetSprite(
  ctx: CanvasRenderingContext2D,
  pet: Pet,
  x: number,
  y: number,
  options: SpriteRenderOptions = {}
) {
  const { facingRight = true, animTime = 0, scale = 1, alpha = 1 } = options;
  const t = animTime || Date.now() / 1000;
  const bob = Math.sin(t * 8) * 1.5;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale * (facingRight ? 1 : -1), scale);
  ctx.globalAlpha = alpha;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 10 - bob, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (pet.type) {
    case 'cat': {
      // Ginger Tabby Cat
      ctx.fillStyle = pet.color || '#fb923c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(facingRight ? 4 : -4, -6, 7, 0, Math.PI * 2);
      ctx.fill();

      // Pointy Ears
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(facingRight ? 2 : -2, -12);
      ctx.lineTo(facingRight ? 5 : -5, -17);
      ctx.lineTo(facingRight ? 8 : -8, -12);
      ctx.fill();

      // Swishing Tail
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(facingRight ? -8 : 8, 0);
      ctx.quadraticCurveTo(facingRight ? -14 : 14, -8 + Math.sin(t * 10) * 4, facingRight ? -12 : 12, -12);
      ctx.stroke();

      // Bell Collar
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(facingRight ? 3 : -5, -1, 3, 3);
      break;
    }

    case 'dog': {
      // Golden Shiba Pup with Red Bandana
      ctx.fillStyle = pet.color || '#eab308';
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head & Snout
      ctx.beginPath();
      ctx.arc(facingRight ? 5 : -5, -6, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(facingRight ? 8 : -11, -6, 4, 4);

      // Red Bandana
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(facingRight ? 3 : -6, -2, 5, 4);

      // Wagging Tail
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(facingRight ? -9 : 9, 0);
      ctx.lineTo(facingRight ? -14 : 14, -6 + Math.sin(t * 14) * 5);
      ctx.stroke();
      break;
    }

    case 'bat': {
      // Mechanical Cyber Bat
      ctx.fillStyle = pet.color || '#8b5cf6';
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Flapping Cyber Wings
      const wingFlap = Math.sin(t * 14) * 6;
      ctx.fillStyle = '#6d28d9';
      ctx.beginPath();
      ctx.moveTo(-5, -2);
      ctx.lineTo(-16, -10 + wingFlap);
      ctx.lineTo(-12, 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(5, -2);
      ctx.lineTo(16, -10 + wingFlap);
      ctx.lineTo(12, 4);
      ctx.closePath();
      ctx.fill();

      // Glowing Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(facingRight ? 1 : -4, -4, 3, 2);
      break;
    }

    case 'slime': {
      // Cute Bouncy Slime
      const squish = 1 + Math.sin(t * 8) * 0.15;
      ctx.fillStyle = pet.color || '#10b981';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10 * squish, 8 / squish, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sparkly eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(facingRight ? 3 : -3, -2, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}
