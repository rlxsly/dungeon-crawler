import { Perk } from '../types/game';

export const PERKS: Perk[] = [
  {
    id: 'max_shield_up',
    name: 'Reinforced Shield',
    description: 'Increases Maximum Shield by +1 and restores 1 Shield.',
    icon: 'shield-plus',
    rarity: 'common',
    effect: (p) => {
      p.maxShield += 1;
      p.shield = Math.min(p.shield + 1, p.maxShield);
    },
  },
  {
    id: 'max_hp_up',
    name: 'Vitality Elixir',
    description: 'Increases Maximum HP by +1 and heals 2 HP.',
    icon: 'heart-pulse',
    rarity: 'common',
    effect: (p) => {
      p.maxHp += 1;
      p.hp = Math.min(p.hp + 2, p.maxHp);
    },
  },
  {
    id: 'max_energy_up',
    name: 'Arcane Battery',
    description: 'Increases Maximum Energy by +25 and restores 25 Energy.',
    icon: 'battery-charging',
    rarity: 'common',
    effect: (p) => {
      p.maxEnergy += 25;
      p.energy = Math.min(p.energy + 25, p.maxEnergy);
    },
  },
  {
    id: 'bullet_bounce',
    name: 'Bouncing Bullets',
    description: 'Player bullets ricochet once off dungeon walls.',
    icon: 'corner-down-right',
    rarity: 'rare',
    effect: (p) => {
      p.bulletBounce = true;
    },
  },
  {
    id: 'melee_reflect',
    name: 'Deflective Edge',
    description: 'Melee swings reflect enemy bullets back at hostile targets.',
    icon: 'shield-alert',
    rarity: 'rare',
    effect: (p) => {
      p.meleeReflect = true;
    },
  },
  {
    id: 'cooldown_reduction',
    name: 'Rapid Recovery',
    description: 'Reduces Hero active skill cooldown by 15% (up to 35% max).',
    icon: 'clock',
    rarity: 'rare',
    effect: (p) => {
      p.cooldownReduction = Math.min(0.35, p.cooldownReduction + 0.15);
    },
  },
  {
    id: 'crit_mastery',
    name: 'Precision Sight',
    description: 'Increases Critical Strike Chance by +6% and improves accuracy.',
    icon: 'crosshair',
    rarity: 'rare',
    effect: (p) => {
      p.critRate += 0.06;
      p.accuracy = Math.max(0.2, p.accuracy * 0.85); // slight tighter spread
    },
  },
  {
    id: 'fire_immunity',
    name: 'Infernal Core',
    description: 'Immunity to fire floor traps and burn damage.',
    icon: 'flame',
    rarity: 'epic',
    effect: (p) => {
      p.fireImmune = true;
    },
  },
  {
    id: 'poison_immunity',
    name: 'Toxic Antidote',
    description: 'Immunity to poison clouds and hazardous acid pools.',
    icon: 'skull',
    rarity: 'epic',
    effect: (p) => {
      p.poisonImmune = true;
    },
  },
  {
    id: 'potion_efficiency',
    name: 'Potion Master',
    description: 'Health and Energy potions restore +50% more value.',
    icon: 'flask-round',
    rarity: 'common',
    effect: (p) => {
      p.potionBonus = true;
    },
  },
  {
    id: 'laser_enhancement',
    name: 'Beam Focus Prism',
    description: 'Increases laser beam thickness and damage by 20%.',
    icon: 'zap',
    rarity: 'rare',
    effect: (p) => {
      p.laserBuff = true;
    },
  },
  {
    id: 'companion_blessing',
    name: 'Beast Mastery',
    description: 'Companion pet damage and attack rate increased by 30%.',
    icon: 'paw-print',
    rarity: 'rare',
    effect: (p) => {
      p.petDamageMult = (p.petDamageMult || 1.0) * 1.3;
    },
  },
  {
    id: 'swift_strides',
    name: 'Windwalker Boots',
    description: 'Increases movement speed by +10%.',
    icon: 'wind',
    rarity: 'common',
    effect: (p) => {
      p.speed = Math.min(280, p.speed * 1.1);
    },
  },
];

export function getRandomPerks(count: number = 3, existingIds: string[] = []): Perk[] {
  const available = PERKS.filter((p) => !existingIds.includes(p.id));
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
