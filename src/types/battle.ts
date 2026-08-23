import { Hero, Pet, Weapon, Enemy } from './game';

export interface BattleMove {
  id: string;
  name: string;
  type: 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'dark' | 'holy' | 'poison' | 'laser';
  category: 'attack' | 'skill' | 'pet' | 'special';
  power: number;
  accuracy: number; // 0 to 100
  energyCost: number;
  description: string;
  effectType?: 'burn' | 'freeze' | 'poison' | 'stun' | 'heal' | 'shield' | 'buff_crit' | 'multi_hit';
  multiHitCount?: number;
  animationType: 'projectile' | 'slash' | 'beam' | 'explosion' | 'magic_burst' | 'buff' | 'pet_pounce';
  soundType: Weapon['soundType'];
}

export interface BattleItem {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: string;
  effect: 'heal_hp' | 'restore_energy' | 'restore_shield' | 'damage_bomb';
  value: number;
}

export interface BossBattleState {
  stage: number;
  boss: {
    id: string;
    name: string;
    level: number;
    type: Enemy['type'];
    maxHp: number;
    hp: number;
    color: string;
    statusEffects: { type: 'burn' | 'poison' | 'freeze' | 'stun'; turns: number }[];
    spriteOffset: { x: number; y: number };
    isAttacking: boolean;
    isHit: boolean;
    isFainting: boolean;
  };
  player: {
    hero: Hero;
    pet: Pet;
    level: number;
    maxHp: number;
    hp: number;
    maxShield: number;
    shield: number;
    maxEnergy: number;
    energy: number;
    statusEffects: { type: 'burn' | 'poison' | 'freeze' | 'stun'; turns: number }[];
    spriteOffset: { x: number; y: number };
    isAttacking: boolean;
    isHit: boolean;
    isFainting: boolean;
    evasionBoostTurns: number;
    critBoostTurns: number;
    defenseBoostTurns: number;
  };
  moves: BattleMove[];
  items: BattleItem[];
  turn: 'player' | 'enemy' | 'animating' | 'victory' | 'defeat';
  selectedMenu: 'main' | 'fight' | 'bag' | 'tactics';
  selectedMoveIndex: number;
  dialogueText: string;
  isDialogueTyping: boolean;
  turnNumber: number;
  battleLogs: string[];
  activeAnimation: {
    type: string;
    progress: number;
    x: number;
    y: number;
    color: string;
  } | null;
}
