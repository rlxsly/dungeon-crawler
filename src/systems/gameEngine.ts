import {
  DungeonLevel,
  Room,
  Enemy,
  Bullet,
  SlashEffect,
  Particle,
  DropItem,
  FloatingText,
  PlayerStats,
  Weapon,
  Hero,
  Pet,
  Obstacle,
  Vector2D,
} from '../types/game';
import { STAGE_ENEMIES, BOSS_TEMPLATES } from '../data/enemies';
import { generateDungeonLevel } from './dungeonGenerator';
import { sound } from '../utils/audio';

export interface GameEngineState {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    facingRight: boolean;
    aimAngle: number;
    isRolling: boolean;
    rollTimer: number;
    isDualWielding: boolean;
    dualWieldTimer: number;
    isPaladinBarrier: boolean;
    paladinBarrierTimer: number;
    isLimitlessBarrier: boolean;
    limitlessBarrierTimer: number;
    gojoSkillStep: number;
    nextShotIsCrit: boolean;
    chargeAmount: number; // for bows / charged weapons
    isCharging: boolean;
    lastDamageTime: number;
    skillCooldownRemaining: number;
    stats: PlayerStats;
    hero: Hero;
    pet: Pet;
  };
  petState: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    targetEnemyId: string | null;
    attackCooldownTimer: number;
  };
  primaryWeapon: Weapon;
  secondaryWeapon: Weapon | null;
  activeWeaponIndex: 0 | 1;
  dungeon: DungeonLevel;
  currentRoom: Room;
  enemies: Enemy[];
  bullets: Bullet[];
  slashes: SlashEffect[];
  particles: Particle[];
  drops: DropItem[];
  floatingTexts: FloatingText[];
  fireCooldown: number;
  coins: number;
  gemsEarned: number;
  score: number;
  monstersKilled: number;
  damageDealt: number;
  isGameOver: boolean;
  isVictory: boolean;
  isRoomLocked: boolean;
  portalTriggered: boolean;
  statueModalOpen: { name: string; cost: number; type: string } | null;
  activeBuffs: string[];
  bossBattleTriggered?: Enemy | null;
}

export function createInitialGameState(
  hero: Hero,
  pet: Pet,
  startingWeapon: Weapon,
  stage: number = 1,
  floor: number = 1,
  dungeonLevel?: DungeonLevel
): GameEngineState {
  const currentDungeon = dungeonLevel || generateDungeonLevel(stage, floor);
  const startRoom = currentDungeon.rooms.find((r) => r.type === 'start') || currentDungeon.rooms[0];
  const startX = startRoom.worldX + startRoom.width / 2;
  const startY = startRoom.worldY + startRoom.height / 2;

  const playerStats: PlayerStats = {
    maxHp: hero.maxHp,
    hp: hero.maxHp,
    maxShield: hero.maxShield,
    shield: hero.maxShield,
    maxEnergy: hero.maxEnergy,
    energy: hero.maxEnergy,
    speed: hero.speed,
    critRate: hero.critRate,
    meleeReflect: hero.id === 'assassin',
    bulletBounce: false,
    fireImmune: hero.id === 'alchemist',
    poisonImmune: hero.id === 'alchemist',
    potionBonus: false,
    laserBuff: false,
    cooldownReduction: 0,
    accuracy: 1.0,
    petDamageMult: 1.0,
  };

  return {
    player: {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      radius: 18,
      facingRight: true,
      aimAngle: 0,
      isRolling: false,
      rollTimer: 0,
      isDualWielding: false,
      dualWieldTimer: 0,
      isPaladinBarrier: false,
      paladinBarrierTimer: 0,
      isLimitlessBarrier: false,
      limitlessBarrierTimer: 0,
      gojoSkillStep: 0,
      nextShotIsCrit: false,
      chargeAmount: 0,
      isCharging: false,
      lastDamageTime: 0,
      skillCooldownRemaining: 0,
      stats: playerStats,
      hero,
      pet,
    },
    petState: {
      x: startX - 30,
      y: startY + 20,
      vx: 0,
      vy: 0,
      targetEnemyId: null,
      attackCooldownTimer: 0,
    },
    primaryWeapon: startingWeapon,
    secondaryWeapon: null,
    activeWeaponIndex: 0,
    dungeon: currentDungeon,
    currentRoom: startRoom,
    enemies: [],
    bullets: [],
    slashes: [],
    particles: [],
    drops: [],
    floatingTexts: [],
    fireCooldown: 0,
    coins: 20,
    gemsEarned: 0,
    score: 0,
    monstersKilled: 0,
    damageDealt: 0,
    isGameOver: false,
    isVictory: false,
    isRoomLocked: false,
    portalTriggered: false,
    statueModalOpen: null,
    activeBuffs: [],
  };
}

export function updateGameState(
  state: GameEngineState,
  dt: number,
  input: {
    moveVector: Vector2D;
    aimPos: Vector2D;
    isFiring: boolean;
    useAutoAim: boolean;
  }
): void {
  if (state.isGameOver || state.isVictory) return;

  const { player } = state;
  const now = Date.now();

  // 1. Cooldowns & Timers
  if (player.skillCooldownRemaining > 0) {
    player.skillCooldownRemaining = Math.max(0, player.skillCooldownRemaining - dt);
  }
  if (state.fireCooldown > 0) {
    state.fireCooldown = Math.max(0, state.fireCooldown - dt);
  }

  // Roll Timer
  if (player.isRolling) {
    player.rollTimer -= dt;
    if (player.rollTimer <= 0) {
      player.isRolling = false;
    }
  }

  // Dual Wield Timer
  if (player.isDualWielding) {
    player.dualWieldTimer -= dt;
    if (player.dualWieldTimer <= 0) {
      player.isDualWielding = false;
    }
  }

  // Paladin Barrier Timer
  if (player.isPaladinBarrier) {
    player.paladinBarrierTimer -= dt;
    if (player.paladinBarrierTimer <= 0) {
      player.isPaladinBarrier = false;
    }
  }

  // Gojo Limitless Barrier Timer
  if (player.isLimitlessBarrier) {
    player.limitlessBarrierTimer -= dt;
    if (player.limitlessBarrierTimer <= 0) {
      player.isLimitlessBarrier = false;
    }
  }

  // Shield Regeneration: If not damaged for 2.2 seconds, regenerate shield at 3.0 pts/sec
  if (now - player.lastDamageTime > 2200 && player.stats.shield < player.stats.maxShield) {
    const prevShield = player.stats.shield;
    player.stats.shield = Math.min(player.stats.maxShield, player.stats.shield + 3.0 * dt);
    if (Math.floor(player.stats.shield) > Math.floor(prevShield)) {
      sound.playShieldRestore();
    }
  }

  // 2. Player Movement
  const moveSpeed = player.isRolling ? player.stats.speed * 1.6 : player.stats.speed;
  if (input.moveVector.x !== 0 || input.moveVector.y !== 0) {
    const len = Math.hypot(input.moveVector.x, input.moveVector.y);
    const nx = (input.moveVector.x / len) * moveSpeed;
    const ny = (input.moveVector.y / len) * moveSpeed;
    player.vx = nx;
    player.vy = ny;
  } else {
    player.vx *= 0.8;
    player.vy *= 0.8;
  }

  // Next player position with obstacle collision
  const targetX = player.x + player.vx * dt;
  const targetY = player.y + player.vy * dt;

  // Check collision against all nearby obstacles (room walls, crates, hallway walls)
  const nearbyObstacles = getNearbyObstacles(state, player.x, player.y, 650);
  const resolvedPos = resolveCircleBoxCollisions(
    player.x,
    player.y,
    targetX,
    targetY,
    player.radius,
    nearbyObstacles,
    state.isRoomLocked,
    state.currentRoom,
    state.dungeon.bounds
  );

  player.x = resolvedPos.x;
  player.y = resolvedPos.y;

  // Determine current room from player world coordinates
  const newRoom = state.dungeon.rooms.find(
    (r) =>
      player.x >= r.worldX &&
      player.x <= r.worldX + r.width &&
      player.y >= r.worldY &&
      player.y <= r.worldY + r.height
  );

  if (newRoom && newRoom !== state.currentRoom) {
    state.currentRoom = newRoom;
    newRoom.visited = true;

    // Trigger room combat if uncleared combat room or boss room
    if (!newRoom.cleared && (newRoom.type === 'combat' || newRoom.type === 'boss')) {
      spawnRoomEnemies(state, newRoom);
      state.isRoomLocked = true;
      if (newRoom.type === 'boss') {
        sound.playBossWarning();
        sound.playMusic('boss');
      }
    }
  }

  // 3. Aiming & Facing
  let aimAngle = Math.atan2(input.aimPos.y - player.y, input.aimPos.x - player.x);

  // Auto-aim assist logic if enabled or on touch
  if (input.useAutoAim && state.enemies.length > 0) {
    let closestDist = Infinity;
    let closestEnemy: Enemy | null = null;
    state.enemies.forEach((enemy) => {
      const d = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (d < closestDist && d < 480) {
        closestDist = d;
        closestEnemy = enemy;
      }
    });
    if (closestEnemy) {
      aimAngle = Math.atan2((closestEnemy as Enemy).y - player.y, (closestEnemy as Enemy).x - player.x);
    }
  }

  player.aimAngle = aimAngle;
  player.facingRight = Math.cos(aimAngle) >= 0;

  // 4. Weapon Firing Logic
  const activeWeapon = state.activeWeaponIndex === 0 ? state.primaryWeapon : state.secondaryWeapon || state.primaryWeapon;

  if (input.isFiring && state.fireCooldown <= 0) {
    fireActiveWeapon(state, activeWeapon);
  }

  // 5. Update Pet AI
  updatePet(state, dt);

  // 6. Update Enemies AI & Attacks
  updateEnemies(state, dt);

  // 7. Update Bullets (Physics, Wall Collisions, Entity Collisions)
  updateBullets(state, dt);

  // 8. Update Slashes (Melee sweeps and bullet deflections)
  updateSlashes(state, dt);

  // 9. Update Drops (Pickup magnet logic)
  updateDrops(state, dt);

  // 10. Update Particles & Floating Text
  updateParticles(state, dt);
}

function fireActiveWeapon(state: GameEngineState, weapon: Weapon) {
  const { player } = state;

  // Check Energy
  if (weapon.energyCost > 0 && player.stats.energy < weapon.energyCost) {
    // Energy insufficient - sound click
    sound.playShoot('pistol');
    createFloatingText(state, player.x, player.y - 24, 'NO ENERGY!', '#ef4444');
    state.fireCooldown = 0.3;
    return;
  }

  // Consume energy
  if (weapon.energyCost > 0) {
    player.stats.energy = Math.max(0, player.stats.energy - weapon.energyCost);
  }

  // Set fire rate cooldown
  const rateMultiplier = player.isDualWielding ? 2.0 : 1.0;
  state.fireCooldown = (1.0 / weapon.fireRate) / rateMultiplier;

  // Sound effect
  sound.playShoot(weapon.soundType);

  const isCrit = Math.random() < player.stats.critRate + weapon.critChance || player.nextShotIsCrit;
  player.nextShotIsCrit = false;

  const baseAngle = player.aimAngle;
  const spreadMultiplier = player.stats.accuracy;

  // Helper to spawn projectile
  const spawnBulletAtAngle = (angle: number, offsetDistance: number = 22) => {
    const bx = player.x + Math.cos(angle) * offsetDistance;
    const by = player.y + Math.sin(angle) * offsetDistance;
    const speed = weapon.bulletSpeed;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const bullet: Bullet = {
      id: `bullet_${Date.now()}_${Math.random()}`,
      x: bx,
      y: by,
      vx,
      vy,
      radius: weapon.type === 'launcher' ? 7 : weapon.type === 'laser' ? 5 : isCrit ? 6 : 4,
      damage: Math.round(weapon.damage * (isCrit ? 1.8 : 1.0)),
      isEnemy: false,
      isCrit,
      color: weapon.color,
      trailColor: weapon.color,
      life: 0,
      maxLife: weapon.range ? weapon.range / speed : 1.8,
      bounces: player.stats.bulletBounce ? 1 : 0,
      pierces: weapon.specialEffect === 'pierce' ? 99 : 0,
      effect: weapon.specialEffect === 'freeze' ? 'freeze' : weapon.specialEffect === 'burn' ? 'burn' : weapon.specialEffect === 'poison' ? 'poison' : weapon.specialEffect === 'explosive' ? 'explosive' : weapon.specialEffect === 'homing' ? 'homing' : undefined,
    };

    state.bullets.push(bullet);
  };

  if (weapon.type === 'melee') {
    // Melee swing arc
    const slashRange = weapon.range || 55;
    state.slashes.push({
      id: `slash_${Date.now()}`,
      x: player.x,
      y: player.y,
      angle: baseAngle,
      radius: slashRange,
      arc: Math.PI * 0.8,
      duration: 0,
      maxDuration: 0.16,
      color: weapon.color,
      damage: Math.round(weapon.damage * (isCrit ? 2.0 : 1.0)),
      isCrit,
    });

    if (weapon.specialEffect === 'shockwave') {
      // Holy shockwave projectile
      spawnBulletAtAngle(baseAngle, 30);
    }
  } else if (weapon.bulletCount && weapon.bulletCount > 1) {
    // Shotgun / Multi-bullet spread
    const count = weapon.bulletCount;
    const spreadTotal = ((weapon.spreadAngle || 30) * Math.PI) / 180 * spreadMultiplier;
    const startAngle = baseAngle - spreadTotal / 2;
    const step = spreadTotal / (count - 1);

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * step + (Math.random() - 0.5) * 0.05;
      spawnBulletAtAngle(angle);
    }
  } else {
    // Single projectile
    const jitter = ((weapon.spreadAngle || 4) * (Math.random() - 0.5) * Math.PI) / 180 * spreadMultiplier;
    spawnBulletAtAngle(baseAngle + jitter);

    if (player.isDualWielding) {
      // Twin bullet on dual wield
      spawnBulletAtAngle(baseAngle + 0.15, 24);
    }
  }
}

export function activateHeroSkill(state: GameEngineState) {
  const { player } = state;
  if (player.skillCooldownRemaining > 0 || state.isGameOver) return;

  const heroId = player.hero.id;
  const cooldown = player.hero.skillCooldown * (1 - player.stats.cooldownReduction);
  player.skillCooldownRemaining = cooldown;

  sound.playSkill(heroId);

  switch (heroId) {
    case 'knight': {
      // Dual Wield for 5 seconds
      player.isDualWielding = true;
      player.dualWieldTimer = 5.0;
      createFloatingText(state, player.x, player.y - 28, 'DUAL WIELD!', '#3b82f6');
      createRadialParticles(state, player.x, player.y, '#3b82f6', 16);
      break;
    }
    case 'rogue': {
      // Invulnerable Dodge Roll with burst speed
      player.isRolling = true;
      player.rollTimer = 0.55;
      player.nextShotIsCrit = true;
      createFloatingText(state, player.x, player.y - 28, 'DODGE!', '#ef4444');
      createRadialParticles(state, player.x, player.y, '#ef4444', 12);
      break;
    }
    case 'wizard': {
      // Chain Lightning on up to 5 nearby monsters
      const nearby = [...state.enemies]
        .map((e) => ({ enemy: e, dist: Math.hypot(e.x - player.x, e.y - player.y) }))
        .filter((item) => item.dist < 380)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 5);

      if (nearby.length > 0) {
        nearby.forEach(({ enemy }) => {
          const dmg = 24;
          enemy.hp -= dmg;
          state.damageDealt += dmg;
          enemy.statuses.push({ type: 'stun', duration: 1.5, tickTimer: 0 });
          createFloatingText(state, enemy.x, enemy.y - 20, `${dmg} ZAP!`, '#a855f7', true);
          createRadialParticles(state, enemy.x, enemy.y, '#c084fc', 10);
        });
      }
      createFloatingText(state, player.x, player.y - 28, 'LIGHTNING CHAIN!', '#a855f7');
      createRadialParticles(state, player.x, player.y, '#a855f7', 20);
      break;
    }
    case 'assassin': {
      // Dark Blade Dash
      const dashDist = 180;
      const dx = Math.cos(player.aimAngle) * dashDist;
      const dy = Math.sin(player.aimAngle) * dashDist;

      // Slice enemies along line
      let scoredKill = false;
      state.enemies.forEach((enemy) => {
        const d = distToSegment({ x: player.x, y: player.y }, { x: player.x + dx, y: player.y + dy }, { x: enemy.x, y: enemy.y });
        if (d < enemy.radius + 24) {
          const dmg = 35;
          enemy.hp -= dmg;
          state.damageDealt += dmg;
          createFloatingText(state, enemy.x, enemy.y - 20, `${dmg}`, '#10b981', true);
          createRadialParticles(state, enemy.x, enemy.y, '#10b981', 12);
          if (enemy.hp <= 0) {
            scoredKill = true;
          }
        }
      });

      player.x += dx;
      player.y += dy;

      if (scoredKill) {
        player.skillCooldownRemaining = 0; // Reset cooldown!
        createFloatingText(state, player.x, player.y - 28, 'KILL RESET!', '#10b981');
      } else {
        createFloatingText(state, player.x, player.y - 28, 'SHADOW DASH!', '#10b981');
      }
      break;
    }
    case 'alchemist': {
      // Throw 3 poison flasks
      const angles = [player.aimAngle - 0.3, player.aimAngle, player.aimAngle + 0.3];
      angles.forEach((ang) => {
        const vx = Math.cos(ang) * 350;
        const vy = Math.sin(ang) * 350;
        state.bullets.push({
          id: `flask_${Date.now()}_${Math.random()}`,
          x: player.x,
          y: player.y,
          vx,
          vy,
          radius: 7,
          damage: 10,
          isEnemy: false,
          isCrit: false,
          color: '#84cc16',
          life: 0,
          maxLife: 0.5,
          bounces: 0,
          pierces: 0,
          effect: 'poison',
        });
      });
      createFloatingText(state, player.x, player.y - 28, 'TOXIC FLASKS!', '#84cc16');
      break;
    }
    case 'paladin': {
      // Holy Barrier absorbing all damage for 4s
      player.isPaladinBarrier = true;
      player.paladinBarrierTimer = 4.0;
      createFloatingText(state, player.x, player.y - 28, 'HOLY AEGIS!', '#f59e0b');
      createRadialParticles(state, player.x, player.y, '#f59e0b', 24);
      break;
    }
    case 'gojo': {
      // SATORU GOJO (JUJUTSU SHENANIGANS MOVESET)
      // Cycles: [Lapse: Blue] Suction Vortex -> [Reversal: Red] Repulsive Cannon -> [Hollow: Purple] Total Annihilation!
      const currentStep = player.gojoSkillStep || 0;
      player.isLimitlessBarrier = true;
      player.limitlessBarrierTimer = 3.5;

      if (currentStep === 0) {
        // --- 1. LAPSE: BLUE (順転「蒼」) ---
        // Sucks all enemies within 360px violently into center, dealing heavy damage and stun!
        player.gojoSkillStep = 1;
        const targetPullX = player.x + Math.cos(player.aimAngle) * 160;
        const targetPullY = player.y + Math.sin(player.aimAngle) * 160;

        state.enemies.forEach((enemy) => {
          const d = Math.hypot(enemy.x - targetPullX, enemy.y - targetPullY);
          if (d < 360) {
            const pullAng = Math.atan2(targetPullY - enemy.y, targetPullX - enemy.x);
            enemy.x += Math.cos(pullAng) * Math.min(d, 200);
            enemy.y += Math.sin(pullAng) * Math.min(d, 200);
            const dmg = 36;
            enemy.hp -= dmg;
            state.damageDealt += dmg;
            enemy.statuses.push({ type: 'stun', duration: 1.6, tickTimer: 0 });
            createFloatingText(state, enemy.x, enemy.y - 20, `${dmg} LAPSE: BLUE!`, '#38bdf8', true);
            createRadialParticles(state, enemy.x, enemy.y, '#38bdf8', 8);
          }
        });

        createFloatingText(state, player.x, player.y - 30, 'LAPSE: BLUE [蒼]!', '#0284c7', true);
        createRadialParticles(state, targetPullX, targetPullY, '#0284c7', 28);
        sound.playSkill('gojo');
      } else if (currentStep === 1) {
        // --- 2. REVERSAL: RED (反転「赫」) ---
        // High-velocity repulsive beam blast knocking enemies violently backwards with massive force!
        player.gojoSkillStep = 2;
        const redVx = Math.cos(player.aimAngle) * 780;
        const redVy = Math.sin(player.aimAngle) * 780;

        state.bullets.push({
          id: `gojo_red_${Date.now()}`,
          x: player.x + Math.cos(player.aimAngle) * 20,
          y: player.y + Math.sin(player.aimAngle) * 20,
          vx: redVx,
          vy: redVy,
          radius: 18,
          damage: 70,
          isEnemy: false,
          isCrit: true,
          color: '#ef4444',
          life: 0,
          maxLife: 0.8,
          bounces: 0,
          pierces: 12,
          effect: 'burn',
        });

        // Knockback nearby enemies
        state.enemies.forEach((enemy) => {
          const d = Math.hypot(enemy.x - player.x, enemy.y - player.y);
          if (d < 220) {
            enemy.x += Math.cos(player.aimAngle) * 140;
            enemy.y += Math.sin(player.aimAngle) * 140;
          }
        });

        createFloatingText(state, player.x, player.y - 30, 'REVERSAL: RED [赫]!', '#dc2626', true);
        createRadialParticles(state, player.x, player.y, '#ef4444', 24);
        sound.playHit(true);
      } else {
        // --- 3. HOLLOW: PURPLE (虚式「茈」) ---
        // Merges Blue & Red to fire a giant unstoppable 26px erasure orb destroying all bullets & obstacles!
        player.gojoSkillStep = 0;
        const purpleVx = Math.cos(player.aimAngle) * 620;
        const purpleVy = Math.sin(player.aimAngle) * 620;

        state.bullets.push({
          id: `gojo_purple_${Date.now()}`,
          x: player.x + Math.cos(player.aimAngle) * 24,
          y: player.y + Math.sin(player.aimAngle) * 24,
          vx: purpleVx,
          vy: purpleVy,
          radius: 28,
          damage: 135,
          isEnemy: false,
          isCrit: true,
          color: '#a855f7',
          life: 0,
          maxLife: 1.5,
          bounces: 0,
          pierces: 999,
          effect: 'shockwave',
        });

        // Wipe all enemy bullets currently on screen
        state.bullets = state.bullets.filter((b) => !b.isEnemy);

        createFloatingText(state, player.x, player.y - 32, 'HOLLOW: PURPLE [茈]!', '#a855f7', true);
        createRadialParticles(state, player.x, player.y, '#c084fc', 40);
        sound.playExplosion();
      }
      break;
    }
  }
}

export function getNearbyObstacles(
  state: GameEngineState,
  x: number,
  y: number,
  radius: number = 600
): Obstacle[] {
  if (state.dungeon && state.dungeon.allObstacles && state.dungeon.allObstacles.length > 0) {
    return state.dungeon.allObstacles.filter((obs) => {
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      return Math.hypot(cx - x, cy - y) < radius;
    });
  }
  return state.currentRoom ? state.currentRoom.obstacles : [];
}

export function upgradeActiveWeapon(state: GameEngineState): boolean {
  const activeWeapon = state.activeWeaponIndex === 0 ? state.primaryWeapon : state.secondaryWeapon || state.primaryWeapon;
  if (!activeWeapon) return false;

  // Balanced Upgrade: +1 or +2 damage, +5% Crit, slight fire rate boost
  const dmgBonus = activeWeapon.damage >= 7 ? 2 : 1;
  activeWeapon.damage += dmgBonus;
  activeWeapon.critChance = Math.min(0.5, activeWeapon.critChance + 0.05);
  activeWeapon.fireRate = Math.round(activeWeapon.fireRate * 1.08 * 10) / 10;
  
  if (!activeWeapon.name.includes('+')) {
    activeWeapon.name = `${activeWeapon.name} +1`;
  } else {
    const match = activeWeapon.name.match(/\+(\d+)/);
    const lvl = match ? parseInt(match[1], 10) + 1 : 2;
    activeWeapon.name = activeWeapon.name.replace(/\+\d+/, `+${lvl}`);
  }

  sound.playReflect();
  createRadialParticles(state, state.player.x, state.player.y, '#fbbf24', 24);
  createFloatingText(state, state.player.x, state.player.y - 30, `FORGED: ${activeWeapon.name}!`, '#fbbf24', true);
  return true;
}

export function drinkMagicSpring(state: GameEngineState): boolean {
  const { player } = state;
  player.stats.hp = player.stats.maxHp;
  player.stats.energy = player.stats.maxEnergy;
  player.stats.shield = player.stats.maxShield;

  sound.playLevelClear();
  createRadialParticles(state, player.x, player.y, '#38bdf8', 24);
  createFloatingText(state, player.x, player.y - 30, 'SPRING REJUVENATION! RESTORED', '#38bdf8', true);
  return true;
}

export function switchWeapon(state: GameEngineState) {
  if (!state.secondaryWeapon) return;
  state.activeWeaponIndex = state.activeWeaponIndex === 0 ? 1 : 0;
  sound.playShoot('sword');
}

export function pickupWeapon(state: GameEngineState, newWeapon: Weapon) {
  if (!state.secondaryWeapon) {
    state.secondaryWeapon = newWeapon;
    state.activeWeaponIndex = 1;
  } else {
    // Drop old active weapon and equip new one
    const oldWeapon = state.activeWeaponIndex === 0 ? state.primaryWeapon : state.secondaryWeapon;
    spawnDrop(state, state.player.x, state.player.y, 'weapon', 1, oldWeapon);

    if (state.activeWeaponIndex === 0) {
      state.primaryWeapon = newWeapon;
    } else {
      state.secondaryWeapon = newWeapon;
    }
  }
  sound.playCoin();
}

function spawnRoomEnemies(state: GameEngineState, room: Room) {
  state.enemies = [];
  const { stage, floor } = state.dungeon;

  if (room.type === 'boss') {
    const template = BOSS_TEMPLATES[stage as 1 | 2 | 3] || BOSS_TEMPLATES[1];
    const bx = room.worldX + room.width / 2;
    const by = room.worldY + room.height / 2;

    const bossEnemy: Enemy = {
      id: `boss_${Date.now()}`,
      name: template.name,
      x: bx,
      y: by,
      radius: template.radius,
      hp: template.hp,
      maxHp: template.hp,
      speed: template.speed,
      color: template.color,
      type: template.type,
      isBoss: true,
      attackCooldown: template.attackCooldown,
      attackTimer: 1.0,
      shootPattern: template.shootPattern,
      phase: 1,
      statuses: [],
      facingRight: false,
    };
    state.enemies.push(bossEnemy);
    state.bossBattleTriggered = bossEnemy;
    return;
  }

  // Standard Combat Room Enemy Spawning (strictly 5 to 7 enemies per request)
  const templates = STAGE_ENEMIES[stage] || STAGE_ENEMIES[1];
  const count = 5 + Math.floor(Math.random() * 3); // exactly 5, 6, or 7 enemies

  for (let i = 0; i < count; i++) {
    const t = templates[Math.floor(Math.random() * templates.length)];
    const isElite = Math.random() < 0.2;
    const ex = room.worldX + 90 + Math.random() * (room.width - 180);
    const ey = room.worldY + 90 + Math.random() * (room.height - 180);

    state.enemies.push({
      id: `enemy_${Date.now()}_${i}`,
      name: isElite ? `Elite ${t.name}` : t.name,
      x: ex,
      y: ey,
      radius: isElite ? t.radius * 1.25 : t.radius,
      hp: isElite ? Math.round(t.hp * 1.8) : t.hp,
      maxHp: isElite ? Math.round(t.hp * 1.8) : t.hp,
      speed: isElite ? t.speed * 1.15 : t.speed,
      color: isElite ? '#e11d48' : t.color,
      type: t.type,
      isElite,
      attackCooldown: t.attackCooldown * (isElite ? 0.8 : 1.0),
      attackTimer: 0.5 + Math.random() * 1.2,
      shootPattern: t.shootPattern,
      statuses: [],
      facingRight: Math.random() < 0.5,
    });
  }
}

function updatePet(state: GameEngineState, dt: number) {
  const { player, petState } = state;
  const pet = player.pet;

  // Move towards player or current enemy
  const distToPlayer = Math.hypot(player.x - petState.x, player.y - petState.y);

  if (petState.attackCooldownTimer > 0) {
    petState.attackCooldownTimer -= dt;
  }

  // Find target enemy
  let nearestEnemy: Enemy | null = null;
  let nearestDist = 280;

  state.enemies.forEach((e) => {
    const d = Math.hypot(e.x - petState.x, e.y - petState.y);
    if (d < nearestDist) {
      nearestDist = d;
      nearestEnemy = e;
    }
  });

  if (nearestEnemy && distToPlayer < 450) {
    const target = nearestEnemy as Enemy;
    const ang = Math.atan2(target.y - petState.y, target.x - petState.x);
    petState.vx = Math.cos(ang) * pet.speed;
    petState.vy = Math.sin(ang) * pet.speed;

    // Pet attack
    if (nearestDist < target.radius + 18 && petState.attackCooldownTimer <= 0) {
      petState.attackCooldownTimer = pet.attackCooldown;
      const dmg = Math.round(pet.damage * player.stats.petDamageMult);
      target.hp -= dmg;
      state.damageDealt += dmg;
      sound.playHit(false);
      createFloatingText(state, target.x, target.y - 18, `${dmg}`, pet.color);
      createRadialParticles(state, target.x, target.y, pet.color, 6);
    }
  } else {
    // Follow player
    if (distToPlayer > 50) {
      const ang = Math.atan2(player.y - petState.y, player.x - petState.x);
      petState.vx = Math.cos(ang) * pet.speed;
      petState.vy = Math.sin(ang) * pet.speed;
    } else {
      petState.vx *= 0.8;
      petState.vy *= 0.8;
    }
  }

  petState.x += petState.vx * dt;
  petState.y += petState.vy * dt;
}

function updateEnemies(state: GameEngineState, dt: number) {
  const { player } = state;

  state.enemies.forEach((enemy) => {
    // Status effects (burn, poison, freeze, stun)
    let isFrozen = false;
    let isStunned = false;

    enemy.statuses = enemy.statuses.filter((st) => {
      st.duration -= dt;
      st.tickTimer += dt;
      if (st.type === 'freeze') isFrozen = true;
      if (st.type === 'stun') isStunned = true;

      if (st.tickTimer >= 0.5) {
        st.tickTimer = 0;
        if (st.type === 'burn' || st.type === 'poison') {
          const tickDmg = 4;
          enemy.hp -= tickDmg;
          state.damageDealt += tickDmg;
          createFloatingText(state, enemy.x, enemy.y - 14, `${tickDmg}`, st.type === 'burn' ? '#f97316' : '#84cc16');
        }
      }
      return st.duration > 0;
    });

    if (isFrozen || isStunned) return;

    // Movement AI
    const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.facingRight = Math.cos(angleToPlayer) >= 0;

    // Charging Boar logic
    if (enemy.isCharging && enemy.chargeVelocity) {
      enemy.x += enemy.chargeVelocity.x * dt;
      enemy.y += enemy.chargeVelocity.y * dt;

      // Check collision with player
      if (distToPlayer < enemy.radius + player.radius) {
        damagePlayer(state, 2);
        enemy.isCharging = false;
      }
    } else {
      // Standard AI movement
      if (distToPlayer > 120) {
        enemy.x += Math.cos(angleToPlayer) * enemy.speed * dt;
        enemy.y += Math.sin(angleToPlayer) * enemy.speed * dt;
      } else if (distToPlayer < 70) {
        // Back off slightly
        enemy.x -= Math.cos(angleToPlayer) * (enemy.speed * 0.6) * dt;
        enemy.y -= Math.sin(angleToPlayer) * (enemy.speed * 0.6) * dt;
      }
    }

    // Obstacle collisions for enemies
    const resolved = resolveCircleBoxCollisions(enemy.x, enemy.y, enemy.x, enemy.y, enemy.radius, state.currentRoom.obstacles, state.isRoomLocked, state.currentRoom);
    enemy.x = resolved.x;
    enemy.y = resolved.y;

    // Enemy Attack AI
    enemy.attackTimer -= dt;
    if (enemy.attackTimer <= 0) {
      enemy.attackTimer = enemy.attackCooldown;
      executeEnemyAttack(state, enemy, angleToPlayer);
    }
  });

  // Handle dead enemies & room clear
  const deadEnemies = state.enemies.filter((e) => e.hp <= 0);
  deadEnemies.forEach((e) => {
    state.monstersKilled++;
    state.score += e.isBoss ? 500 : e.isElite ? 80 : 30;
    createRadialParticles(state, e.x, e.y, e.color, e.isBoss ? 30 : 12);
    sound.playHit(true);

    // Drop coins / energy / potions
    const coinCount = e.isBoss ? 15 : e.isElite ? 4 : Math.random() < 0.6 ? 2 : 1;
    for (let i = 0; i < coinCount; i++) {
      spawnDrop(state, e.x + (Math.random() - 0.5) * 20, e.y + (Math.random() - 0.5) * 20, 'coin', 1);
    }

    // Energy orbs
    spawnDrop(state, e.x, e.y, 'energy', e.isBoss ? 50 : 15);

    // Chance for HP Potion or Weapon
    if (Math.random() < 0.12 || e.isBoss) {
      spawnDrop(state, e.x, e.y, 'hp_potion', 2);
    }
    if (e.isBoss) {
      state.gemsEarned += 25;
      sound.playLevelClear();
    }
  });

  state.enemies = state.enemies.filter((e) => e.hp > 0);

  // Check if room cleared
  if (state.isRoomLocked && state.enemies.length === 0) {
    state.isRoomLocked = false;
    state.currentRoom.cleared = true;
    sound.playLevelClear();
    createFloatingText(state, player.x, player.y - 40, 'ROOM CLEARED!', '#22c55e', true);

    // If boss room was cleared or end room was cleared, trigger portal
    if (state.currentRoom.type === 'boss' || state.currentRoom.isEndRoom) {
      state.currentRoom.bossDefeated = true;
      state.portalTriggered = true;

      const rx = state.currentRoom.worldX + state.currentRoom.width / 2;
      const ry = state.currentRoom.worldY + state.currentRoom.height / 2;
      if (!state.currentRoom.obstacles.some((o) => o.type === 'portal')) {
        state.currentRoom.obstacles.push({
          id: `portal_${Date.now()}`,
          x: rx - 24,
          y: ry - 24,
          width: 48,
          height: 48,
          type: 'portal',
        });
      }
    }
  }
}

function executeEnemyAttack(state: GameEngineState, enemy: Enemy, angleToPlayer: number) {
  // Sukuna Boss moveset
  if (enemy.type === 'boss_sukuna') {
    const moveIndex = Math.floor(Math.random() * 4);
    if (moveIndex === 0) {
      // 1. DISMANTLE: 5 razor sharp crimson slashes
      for (let i = -2; i <= 2; i++) {
        spawnEnemyBullet(state, enemy.x, enemy.y, angleToPlayer + i * 0.18, 380, 1, '#ef4444');
      }
      createFloatingText(state, enemy.x, enemy.y - 35, 'DISMANTLE (解)!', '#ef4444', true);
      sound.playShoot('sword');
    } else if (moveIndex === 1) {
      // 2. CLEAVE: 8 radial slicing shockwaves
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        spawnEnemyBullet(state, enemy.x, enemy.y, ang, 280, 1, '#991b1b');
      }
      createFloatingText(state, enemy.x, enemy.y - 35, 'CLEAVE (捌)!', '#dc2626', true);
      sound.playShoot('sword');
    } else if (moveIndex === 2) {
      // 3. FUGA: FIRE ARROW
      spawnEnemyBullet(state, enemy.x, enemy.y, angleToPlayer, 480, 2, '#ea580c');
      createFloatingText(state, enemy.x, enemy.y - 35, 'FUGA: FIRE ARROW (開)!', '#f97316', true);
      createRadialParticles(state, enemy.x, enemy.y, '#ea580c', 16);
      sound.playExplosion();
    } else {
      // 4. MALEVOLENT SHRINE: Domain Slashing Torrent
      const count = 12;
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.2;
        spawnEnemyBullet(state, enemy.x, enemy.y, ang, 260, 1, '#b91c1c');
      }
      createFloatingText(state, enemy.x, enemy.y - 35, 'MALEVOLENT SHRINE (伏魔御廚子)!', '#dc2626', true);
      createRadialParticles(state, enemy.x, enemy.y, '#991b1b', 24);
      sound.playBossWarning();
    }
    return;
  }

  const pattern = enemy.shootPattern;

  switch (pattern) {
    case 'single': {
      spawnEnemyBullet(state, enemy.x, enemy.y, angleToPlayer, 300, 1, '#ef4444');
      break;
    }
    case 'sniper': {
      // Faster, high velocity bullet
      spawnEnemyBullet(state, enemy.x, enemy.y, angleToPlayer, 480, 2, '#f97316');
      break;
    }
    case 'shotgun': {
      for (let i = -1; i <= 1; i++) {
        spawnEnemyBullet(state, enemy.x, enemy.y, angleToPlayer + i * 0.18, 300, 1, '#ef4444');
      }
      break;
    }
    case 'charge': {
      // Boar winds up, charges
      enemy.isCharging = true;
      enemy.chargeVelocity = {
        x: Math.cos(angleToPlayer) * 230,
        y: Math.sin(angleToPlayer) * 230,
      };
      setTimeout(() => {
        enemy.isCharging = false;
      }, 800);
      break;
    }
    case 'radial': {
      // 6 or 12 bullets in full circle
      const count = enemy.isBoss ? 12 : 6;
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        spawnEnemyBullet(state, enemy.x, enemy.y, ang, enemy.isBoss ? 240 : 200, 1, '#ec4899');
      }
      break;
    }
    case 'spiral': {
      // Spiral bullets
      const count = 8;
      const offset = (Date.now() / 350) % (Math.PI * 2);
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + offset;
        spawnEnemyBullet(state, enemy.x, enemy.y, ang, 230, 1, '#a855f7');
      }
      break;
    }
    case 'laser': {
      // Focused energy projectile
      spawnEnemyBullet(state, enemy.x, enemy.y, angleToPlayer, 500, 2, '#06b6d4');
      break;
    }
  }
}

function spawnEnemyBullet(
  state: GameEngineState,
  x: number,
  y: number,
  angle: number,
  speed: number,
  damage: number,
  color: string
) {
  state.bullets.push({
    id: `ebullet_${Date.now()}_${Math.random()}`,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 5,
    damage,
    isEnemy: true,
    isCrit: false,
    color,
    life: 0,
    maxLife: 3.5,
    bounces: 0,
    pierces: 0,
    canReflect: true,
  });
}

function updateBullets(state: GameEngineState, dt: number) {
  const { player } = state;

  state.bullets.forEach((bullet) => {
    bullet.life += dt;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;

    // Homing effect for player missiles
    if (bullet.effect === 'homing' && !bullet.isEnemy && state.enemies.length > 0) {
      let closest: Enemy | null = null;
      let minD = 320;
      state.enemies.forEach((e) => {
        const d = Math.hypot(e.x - bullet.x, e.y - bullet.y);
        if (d < minD) {
          minD = d;
          closest = e;
        }
      });
      if (closest) {
        const ang = Math.atan2((closest as Enemy).y - bullet.y, (closest as Enemy).x - bullet.x);
        const currentAng = Math.atan2(bullet.vy, bullet.vx);
        const newAng = currentAng + (ang - currentAng) * 0.1;
        const spd = Math.hypot(bullet.vx, bullet.vy);
        bullet.vx = Math.cos(newAng) * spd;
        bullet.vy = Math.sin(newAng) * spd;
      }
    }

    // Gojo's Neutral Infinity Barrier: decelerates and repels hostile bullets
    if (bullet.isEnemy) {
      const isGojo = player.hero.id === 'gojo';
      const hasInfinity = isGojo || player.isLimitlessBarrier;
      if (hasInfinity && !player.isRolling) {
        const distToPlayer = Math.hypot(player.x - bullet.x, player.y - bullet.y);
        if (distToPlayer < 75) {
          // Repel / Deflect away with azure Infinity spark
          const awayAng = Math.atan2(bullet.y - player.y, bullet.x - player.x);
          const spd = Math.hypot(bullet.vx, bullet.vy) || 350;
          bullet.vx = Math.cos(awayAng) * spd * 1.1;
          bullet.vy = Math.sin(awayAng) * spd * 1.1;
          bullet.isEnemy = false; // Deflect back towards monsters!
          bullet.color = '#38bdf8';
          bullet.damage = Math.max(bullet.damage, 14);
          sound.playReflect();
          createRadialParticles(state, bullet.x, bullet.y, '#38bdf8', 4);
          createFloatingText(state, bullet.x, bullet.y - 12, 'INFINITY', '#38bdf8');
        }
      }
    }

    // 1. Bullet vs Wall / Obstacle collision
    const nearbyObs = getNearbyObstacles(state, bullet.x, bullet.y, 140);
    nearbyObs.forEach((obs) => {
      if (
        bullet.x >= obs.x &&
        bullet.x <= obs.x + obs.width &&
        bullet.y >= obs.y &&
        bullet.y <= obs.y + obs.height
      ) {
        // Destructible crates / explosive barrels
        if (obs.isDestructible && obs.hp !== undefined) {
          obs.hp -= bullet.damage;
          if (obs.hp <= 0) {
            destroyObstacle(state, obs);
          }
        }

        if (bullet.bounces > 0) {
          bullet.bounces--;
          bullet.vx = -bullet.vx;
          bullet.vy = -bullet.vy;
          sound.playHit(false);
        } else {
          bullet.life = bullet.maxLife; // destroy bullet
          createRadialParticles(state, bullet.x, bullet.y, bullet.color, 4);
        }
      }
    });

    // Enforce solid perimeter boundary for locked rooms
    if (state.isRoomLocked) {
      const { worldX, worldY, width, height } = state.currentRoom;
      if (
        bullet.x <= worldX + 10 ||
        bullet.x >= worldX + width - 10 ||
        bullet.y <= worldY + 10 ||
        bullet.y >= worldY + height - 10
      ) {
        bullet.life = bullet.maxLife;
        createRadialParticles(state, bullet.x, bullet.y, bullet.color, 3);
      }
    }

    // 2. Player Bullet vs Enemy collision
    if (!bullet.isEnemy) {
      state.enemies.forEach((enemy) => {
        const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);
        if (dist < enemy.radius + bullet.radius) {
          enemy.hp -= bullet.damage;
          state.damageDealt += bullet.damage;
          sound.playHit(bullet.isCrit);

          // Status effects
          if (bullet.effect === 'freeze') {
            enemy.statuses.push({ type: 'freeze', duration: 1.6, tickTimer: 0 });
          } else if (bullet.effect === 'burn') {
            enemy.statuses.push({ type: 'burn', duration: 3.0, tickTimer: 0 });
          } else if (bullet.effect === 'poison') {
            enemy.statuses.push({ type: 'poison', duration: 4.0, tickTimer: 0 });
          }

          createFloatingText(state, enemy.x, enemy.y - 18, `${bullet.damage}`, bullet.isCrit ? '#f59e0b' : '#ffffff', bullet.isCrit);
          createRadialParticles(state, bullet.x, bullet.y, bullet.color, 6);

          if (bullet.pierces <= 0) {
            bullet.life = bullet.maxLife;
          } else {
            bullet.pierces--;
          }
        }
      });
    }

    // 3. Enemy Bullet vs Player collision
    if (bullet.isEnemy) {
      const dist = Math.hypot(player.x - bullet.x, player.y - bullet.y);
      if (dist < player.radius + bullet.radius) {
        if (player.isRolling) {
          // Dodged!
          createFloatingText(state, player.x, player.y - 20, 'MISS', '#94a3b8');
        } else if (player.isPaladinBarrier) {
          // Absorbed by Holy Aegis! Convert to Energy
          player.stats.energy = Math.min(player.stats.maxEnergy, player.stats.energy + 8);
          sound.playReflect();
          createFloatingText(state, player.x, player.y - 20, '+8 ENERGY', '#fbbf24');
          bullet.life = bullet.maxLife;
        } else {
          damagePlayer(state, bullet.damage);
          bullet.life = bullet.maxLife;
        }
      }
    }
  });

  state.bullets = state.bullets.filter((b) => b.life < b.maxLife);
}

function updateSlashes(state: GameEngineState, dt: number) {
  state.slashes.forEach((slash) => {
    slash.duration += dt;

    // Melee vs Enemies
    state.enemies.forEach((enemy) => {
      const dist = Math.hypot(enemy.x - slash.x, enemy.y - slash.y);
      if (dist < slash.radius + enemy.radius) {
        const ang = Math.atan2(enemy.y - slash.y, enemy.x - slash.x);
        let angleDiff = Math.abs(ang - slash.angle);
        while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        if (angleDiff < slash.arc / 2) {
          enemy.hp -= slash.damage * dt * 8;
          state.damageDealt += slash.damage;
          createRadialParticles(state, enemy.x, enemy.y, slash.color, 4);
        }
      }
    });

    // Melee vs Enemy Bullets (DEFLECTION / BULLET CHOPPING)
    state.bullets.forEach((bullet) => {
      if (bullet.isEnemy && bullet.canReflect) {
        const dist = Math.hypot(bullet.x - slash.x, bullet.y - slash.y);
        if (dist < slash.radius + 15) {
          sound.playReflect();
          bullet.isEnemy = false;
          bullet.color = '#38bdf8';
          bullet.damage *= 1.5;
          bullet.vx = -bullet.vx * 1.3;
          bullet.vy = -bullet.vy * 1.3;
          createRadialParticles(state, bullet.x, bullet.y, '#38bdf8', 6);
        }
      }
    });
  });

  state.slashes = state.slashes.filter((s) => s.duration < s.maxDuration);
}

export function damagePlayer(state: GameEngineState, damage: number) {
  const { player } = state;
  player.lastDamageTime = Date.now();

  sound.playPlayerHurt();

  if (player.stats.shield > 0) {
    if (player.stats.shield >= damage) {
      player.stats.shield -= damage;
    } else {
      const leftover = damage - player.stats.shield;
      player.stats.shield = 0;
      player.stats.hp = Math.max(0, player.stats.hp - leftover);
      sound.playShieldBreak();
    }
  } else {
    player.stats.hp = Math.max(0, player.stats.hp - damage);
  }

  createFloatingText(state, player.x, player.y - 24, `-${damage}`, '#ef4444');
  createRadialParticles(state, player.x, player.y, '#ef4444', 10);

  if (player.stats.hp <= 0) {
    state.isGameOver = true;
    sound.playExplosion();
  }
}

function destroyObstacle(state: GameEngineState, obs: Obstacle) {
  obs.hp = 0;
  createRadialParticles(state, obs.x + obs.width / 2, obs.y + obs.height / 2, '#78350f', 12);
  sound.playExplosion();

  if (obs.type === 'barrel_explosive') {
    // Huge explosion damaging all nearby entities
    const ex = obs.x + obs.width / 2;
    const ey = obs.y + obs.height / 2;
    const blastRadius = 120;

    state.enemies.forEach((enemy) => {
      const d = Math.hypot(enemy.x - ex, enemy.y - ey);
      if (d < blastRadius) {
        const dmg = 35;
        enemy.hp -= dmg;
        state.damageDealt += dmg;
        createFloatingText(state, enemy.x, enemy.y - 20, `${dmg} BOOM!`, '#ea580c', true);
      }
    });

    const distToPlayer = Math.hypot(state.player.x - ex, state.player.y - ey);
    if (distToPlayer < blastRadius && !state.player.stats.fireImmune) {
      damagePlayer(state, 3);
    }
  } else {
    // Drop coin or energy from crate
    if (Math.random() < 0.7) {
      spawnDrop(state, obs.x + obs.width / 2, obs.y + obs.height / 2, 'coin', 1);
    }
    if (Math.random() < 0.4) {
      spawnDrop(state, obs.x + obs.width / 2, obs.y + obs.height / 2, 'energy', 10);
    }
  }

  // Remove obstacle
  state.currentRoom.obstacles = state.currentRoom.obstacles.filter((o) => o !== obs);
}

function spawnDrop(
  state: GameEngineState,
  x: number,
  y: number,
  type: DropItem['type'],
  amount: number = 1,
  weapon?: Weapon
) {
  state.drops.push({
    id: `drop_${Date.now()}_${Math.random()}`,
    x,
    y,
    vx: (Math.random() - 0.5) * 80,
    vy: (Math.random() - 0.5) * 80,
    type,
    amount,
    weapon,
    life: 0,
  });
}

function updateDrops(state: GameEngineState, dt: number) {
  const { player } = state;

  state.drops.forEach((drop) => {
    drop.life += dt;
    drop.x += drop.vx * dt;
    drop.y += drop.vy * dt;
    drop.vx *= 0.92;
    drop.vy *= 0.92;

    // Magnet towards player if close
    const dist = Math.hypot(player.x - drop.x, player.y - drop.y);
    if (dist < 160 && drop.type !== 'weapon') {
      const ang = Math.atan2(player.y - drop.y, player.x - drop.x);
      drop.vx += Math.cos(ang) * 450 * dt;
      drop.vy += Math.sin(ang) * 450 * dt;
    }

    // Pickup collision
    if (dist < player.radius + 14) {
      if (drop.type === 'coin') {
        state.coins += drop.amount || 1;
        sound.playCoin();
        createFloatingText(state, player.x, player.y - 18, `+${drop.amount} Gold`, '#fbbf24');
        drop.life = 999;
      } else if (drop.type === 'energy') {
        player.stats.energy = Math.min(player.stats.maxEnergy, player.stats.energy + (drop.amount || 10));
        sound.playCoin();
        createFloatingText(state, player.x, player.y - 18, `+${drop.amount} Energy`, '#38bdf8');
        drop.life = 999;
      } else if (drop.type === 'hp_potion') {
        const healAmt = player.stats.potionBonus ? (drop.amount || 2) * 2 : drop.amount || 2;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + healAmt);
        sound.playCoin();
        createFloatingText(state, player.x, player.y - 18, `+${healAmt} HP`, '#22c55e');
        drop.life = 999;
      }
    }
  });

  state.drops = state.drops.filter((d) => d.life < 45);
}

function updateParticles(state: GameEngineState, dt: number) {
  state.particles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= p.decay * dt;
  });
  state.particles = state.particles.filter((p) => p.alpha > 0);

  state.floatingTexts.forEach((ft) => {
    ft.y += ft.vy * dt;
    ft.alpha -= 0.8 * dt;
  });
  state.floatingTexts = state.floatingTexts.filter((ft) => ft.alpha > 0);
}

export function createParticle(
  state: GameEngineState,
  x: number,
  y: number,
  color: string,
  radius: number,
  decay: number,
  shape: Particle['shape'] = 'circle'
) {
  state.particles.push({
    id: `p_${Date.now()}_${Math.random()}`,
    x,
    y,
    vx: (Math.random() - 0.5) * 80,
    vy: (Math.random() - 0.5) * 80,
    radius,
    color,
    alpha: 1.0,
    decay,
    shape,
  });
}

export function createRadialParticles(
  state: GameEngineState,
  x: number,
  y: number,
  color: string,
  count: number = 8
) {
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2;
    const spd = 60 + Math.random() * 80;
    state.particles.push({
      id: `rp_${Date.now()}_${i}`,
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      radius: 3 + Math.random() * 2,
      color,
      alpha: 1.0,
      decay: 1.8,
      shape: 'spark',
    });
  }
}

export function createFloatingText(
  state: GameEngineState,
  x: number,
  y: number,
  text: string,
  color: string,
  isCrit?: boolean
) {
  state.floatingTexts.push({
    id: `ft_${Date.now()}_${Math.random()}`,
    x,
    y,
    text,
    color,
    alpha: 1.0,
    vy: -45,
    life: 0,
    isCrit,
  });
}

function resolveCircleBoxCollisions(
  cx: number,
  cy: number,
  tx: number,
  ty: number,
  radius: number,
  obstacles: Obstacle[],
  isLocked: boolean,
  currentRoom?: Room,
  bounds?: { minX: number; minY: number; maxX: number; maxY: number }
): Vector2D {
  let px = tx;
  let py = ty;

  obstacles.forEach((obs) => {
    // If room is locked, perimeter doors act as solid walls
    const nearestX = Math.max(obs.x, Math.min(px, obs.x + obs.width));
    const nearestY = Math.max(obs.y, Math.min(py, obs.y + obs.height));

    const dx = px - nearestX;
    const dy = py - nearestY;
    const distSq = dx * dx + dy * dy;

    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq);
      if (dist === 0) {
        px += radius;
      } else {
        const overlap = radius - dist;
        px += (dx / dist) * overlap;
        py += (dy / dist) * overlap;
      }
    }
  });

  // Strict room perimeter boundary enforcement when locked
  if (currentRoom && isLocked) {
    px = Math.max(currentRoom.worldX + 38 + radius, Math.min(px, currentRoom.worldX + currentRoom.width - 38 - radius));
    py = Math.max(currentRoom.worldY + 38 + radius, Math.min(py, currentRoom.worldY + currentRoom.height - 38 - radius));
  } else if (bounds) {
    px = Math.max(bounds.minX + radius, Math.min(px, bounds.maxX - radius));
    py = Math.max(bounds.minY + radius, Math.min(py, bounds.maxY - radius));
  }

  return { x: px, y: py };
}

function distToSegment(p1: Vector2D, p2: Vector2D, p: Vector2D): number {
  const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - p1.x, p.y - p1.y);
  let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (p1.x + t * (p2.x - p1.x)), p.y - (p1.y + t * (p2.y - p1.y)));
}
