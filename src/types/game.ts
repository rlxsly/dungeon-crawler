export type HeroClass =
  | 'knight'
  | 'rogue'
  | 'wizard'
  | 'assassin'
  | 'alchemist'
  | 'paladin'
  | 'gojo'
  | 'goku'
  | 'naruto'
  | 'luffy'
  | 'saitama'
  | 'jinwoo';

export type WeaponRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type WeaponType = 'handgun' | 'shotgun' | 'rifle' | 'laser' | 'melee' | 'staff' | 'bow' | 'launcher' | 'special';

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  rarity: WeaponRarity;
  damage: number;
  energyCost: number;
  fireRate: number; // shots per second
  bulletSpeed: number;
  bulletCount?: number;
  spreadAngle?: number; // degrees
  critChance: number; // 0 to 1
  range?: number;
  description: string;
  color: string;
  iconName: string;
  soundType: 'pistol' | 'shotgun' | 'laser' | 'sword' | 'magic' | 'rocket' | 'bow' | 'punch' | 'plasma';
  specialEffect?: 'freeze' | 'burn' | 'poison' | 'pierce' | 'explosive' | 'homing' | 'chain_lightning' | 'shockwave' | 'reflect';
  chargeTime?: number; // for bows / charged weapons
}

export interface Hero {
  id: HeroClass;
  name: string;
  title: string;
  maxHp: number;
  maxShield: number;
  maxEnergy: number;
  speed: number;
  critRate: number;
  startingWeaponId: string;
  skillName: string;
  skillDescription: string;
  skillCooldown: number; // in seconds
  passiveName: string;
  passiveDescription: string;
  color: string;
  accentColor: string;
  unlocked: boolean;
  gemCost: number;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic';
  effect: (player: PlayerStats) => void;
}

export interface PlayerStats {
  maxHp: number;
  hp: number;
  maxShield: number;
  shield: number;
  maxEnergy: number;
  energy: number;
  speed: number;
  critRate: number;
  meleeReflect: boolean;
  bulletBounce: boolean;
  fireImmune: boolean;
  poisonImmune: boolean;
  potionBonus: boolean;
  laserBuff: boolean;
  cooldownReduction: number; // 0 to 0.5
  accuracy: number; // spread multiplier
  petDamageMult: number;
}

export interface Pet {
  id: string;
  name: string;
  type: 'cat' | 'dog' | 'bat' | 'slime';
  color: string;
  damage: number;
  speed: number;
  attackCooldown: number;
  description: string;
}

export type RoomType = 'start' | 'combat' | 'elite' | 'chest' | 'shop' | 'statue' | 'upgrade' | 'boss' | 'portal';

export interface GridPos {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'crate' | 'barrel_explosive' | 'statue' | 'chest' | 'portal' | 'shop_item' | 'vending' | 'upgrade_anvil' | 'magic_spring' | 'weapon_pedestal';
  hp?: number;
  maxHp?: number;
  isDestructible?: boolean;
  opened?: boolean;
  data?: any;
}

export interface Room {
  id: string;
  gridX: number;
  gridY: number;
  worldX: number;
  worldY: number;
  width: number;
  height: number;
  type: RoomType;
  cleared: boolean;
  visited: boolean;
  doors: { [key in 'top' | 'bottom' | 'left' | 'right']?: boolean };
  obstacles: Obstacle[];
  enemiesSpawned: boolean;
  isEndRoom?: boolean;
  bossDefeated?: boolean;
  shopItems?: { weapon?: Weapon; potionType?: 'hp' | 'energy'; cost: number; bought: boolean; x: number; y: number }[];
  statueBlessing?: { name: string; cost: number; prayed: boolean; type: string };
  chestReward?: { weapon?: Weapon; gold: number; energy: number; opened: boolean };
  upgradeForge?: { cost: number; upgraded: boolean; level: number };
  magicSpring?: { used: boolean; cost: number };
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isEnemy: boolean;
  isCrit: boolean;
  color: string;
  trailColor?: string;
  life: number;
  maxLife: number;
  bounces: number;
  pierces: number;
  effect?: 'freeze' | 'burn' | 'poison' | 'explosive' | 'homing' | 'shockwave';
  homingTarget?: Enemy | null;
  homingStrength?: number;
  canReflect?: boolean;
  isLaserBeam?: boolean;
  laserLength?: number;
  laserAngle?: number;
}

export interface SlashEffect {
  id: string;
  x: number;
  y: number;
  angle: number;
  radius: number;
  arc: number;
  duration: number;
  maxDuration: number;
  color: string;
  damage: number;
  isCrit: boolean;
}

export interface StatusEffect {
  type: 'burn' | 'freeze' | 'poison' | 'stun';
  duration: number;
  tickTimer: number;
  damagePerTick?: number;
}

export interface Enemy {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  color: string;
  type:
    | 'goblin_gunner'
    | 'skeleton_archer'
    | 'boar_charger'
    | 'alien_laser'
    | 'slime'
    | 'shaman'
    | 'boss_grand_knight'
    | 'boss_devil_snare'
    | 'boss_void_emperor'
    | 'boss_sukuna'
    | 'boss_vader'
    | 'boss_madara'
    | 'boss_sephiroth'
    | 'boss_dio';
  isBoss?: boolean;
  isElite?: boolean;
  eliteAffix?: 'speed' | 'fire' | 'frost' | 'multishot';
  attackCooldown: number;
  attackTimer: number;
  shootPattern: 'single' | 'shotgun' | 'sniper' | 'laser' | 'charge' | 'spiral' | 'radial' | 'summon' | 'slam';
  phase?: number;
  statuses: StatusEffect[];
  facingRight: boolean;
  targetPos?: Vector2D;
  isCharging?: boolean;
  chargeVelocity?: Vector2D;
}

export interface DropItem {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'coin' | 'energy' | 'hp_potion' | 'weapon';
  amount?: number;
  weapon?: Weapon;
  life: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'spark' | 'smoke' | 'star' | 'laser_beam';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  life: number;
  isCrit?: boolean;
}

export interface Corridor {
  id: string;
  fromGridX: number;
  fromGridY: number;
  toGridX: number;
  toGridY: number;
  direction: 'horizontal' | 'vertical';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DungeonLevel {
  stage: number; // 1, 2, 3, 4, 5
  floor: number; // 1, 2, 3, 4, 5 (Boss is floor 5)
  rooms: Room[];
  corridors: Corridor[];
  allObstacles: Obstacle[];
  gridWidth: number;
  gridHeight: number;
  biome:
    | 'ancient_ruins'
    | 'death_star'
    | 'valley_end'
    | 'northern_crater'
    | 'cairo_clocktower'
    | 'magma_forge'
    | 'alien_core';
  bossName: string;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface GameRunState {
  score: number;
  coins: number;
  gems: number;
  enemiesKilled: number;
  damageDealt: number;
  timeElapsed: number; // seconds
  currentStage: number;
  currentFloor: number;
  perks: Perk[];
  primaryWeapon: Weapon;
  secondaryWeapon: Weapon | null;
  activeWeaponIndex: 0 | 1;
}

export interface GameSaveData {
  gems: number;
  highScore: number;
  dungeonsCleared: number;
  unlockedHeroes: HeroClass[];
  unlockedPets: string[];
  selectedHeroId: HeroClass;
  selectedPetId: string;
  heroUpgrades: { [key in HeroClass]?: { hpLevel: number; shieldLevel: number; energyLevel: number } };
  craftedWeapons: string[];
}
