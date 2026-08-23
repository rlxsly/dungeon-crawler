import React, { useState, useEffect, useRef } from 'react';
import { Hero, Pet, Weapon, Enemy, PlayerStats } from '../types/game';
import { BattleMove, BattleItem, BossBattleState } from '../types/battle';
import { drawHeroSprite, drawEnemySprite, drawPetSprite } from '../utils/spriteRenderer';
import { sound } from '../utils/audio';
import {
  Swords,
  Shield,
  Zap,
  Heart,
  Sparkles,
  Package,
  Crosshair,
  Flame,
  Volume2,
  VolumeX,
  ChevronRight,
  ArrowLeft,
  Award,
} from 'lucide-react';

interface BossBattleViewProps {
  hero: Hero;
  pet: Pet;
  playerStats: PlayerStats;
  primaryWeapon: Weapon;
  secondaryWeapon: Weapon | null;
  stage: number;
  bossTemplate: Enemy;
  onVictory: (rewards: { gems: number; coins: number; score: number }) => void;
  onDefeat: () => void;
}

export const BossBattleView: React.FC<BossBattleViewProps> = ({
  hero,
  pet,
  playerStats,
  primaryWeapon,
  secondaryWeapon,
  stage,
  bossTemplate,
  onVictory,
  onDefeat,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate Pokemon Battle Moves based on Hero, Weapons, and Pet
  const generateMoves = (): BattleMove[] => {
    const moves: BattleMove[] = [];

    // Move 1: Primary Weapon
    moves.push({
      id: 'move_primary',
      name: primaryWeapon.name.toUpperCase(),
      type: primaryWeapon.type === 'melee' ? 'normal' : primaryWeapon.specialEffect === 'burn' ? 'fire' : primaryWeapon.specialEffect === 'freeze' ? 'water' : primaryWeapon.specialEffect === 'poison' ? 'poison' : 'laser',
      category: 'attack',
      power: primaryWeapon.damage * (primaryWeapon.bulletCount || 1) * 3,
      accuracy: 95,
      energyCost: primaryWeapon.energyCost * 3,
      description: `Strike with ${primaryWeapon.name}. High damage assault.`,
      effectType: primaryWeapon.specialEffect === 'burn' ? 'burn' : primaryWeapon.specialEffect === 'poison' ? 'poison' : primaryWeapon.specialEffect === 'freeze' ? 'freeze' : undefined,
      animationType: primaryWeapon.type === 'melee' ? 'slash' : 'projectile',
      soundType: primaryWeapon.soundType,
    });

    // Move 2: Secondary Weapon or Elemental Blast
    if (secondaryWeapon) {
      moves.push({
        id: 'move_secondary',
        name: secondaryWeapon.name.toUpperCase(),
        type: secondaryWeapon.type === 'melee' ? 'normal' : secondaryWeapon.specialEffect === 'burn' ? 'fire' : secondaryWeapon.specialEffect === 'freeze' ? 'water' : 'electric',
        category: 'attack',
        power: secondaryWeapon.damage * (secondaryWeapon.bulletCount || 1) * 3,
        accuracy: 90,
        energyCost: secondaryWeapon.energyCost * 3,
        description: `Fire ${secondaryWeapon.name} at the boss.`,
        effectType: secondaryWeapon.specialEffect === 'burn' ? 'burn' : secondaryWeapon.specialEffect === 'poison' ? 'poison' : secondaryWeapon.specialEffect === 'freeze' ? 'freeze' : undefined,
        animationType: secondaryWeapon.type === 'melee' ? 'slash' : 'projectile',
        soundType: secondaryWeapon.soundType,
      });
    } else {
      // Elemental Spark fallback
      moves.push({
        id: 'move_elemental',
        name: 'SOUL BURST',
        type: 'electric',
        category: 'attack',
        power: 35,
        accuracy: 100,
        energyCost: 15,
        description: 'Discharge raw condensed soul energy directly at the foe.',
        animationType: 'beam',
        soundType: 'laser',
      });
    }

    // Move 3: Signature Hero Skill
    const heroSkillMoves: Record<string, BattleMove> = {
      knight: {
        id: 'skill_knight',
        name: 'DUAL WIELD BARRAGE',
        type: 'normal',
        category: 'skill',
        power: 65,
        accuracy: 90,
        energyCost: 25,
        description: 'Unleashes a rapid double-barrage of high speed shots!',
        effectType: 'multi_hit',
        multiHitCount: 2,
        animationType: 'projectile',
        soundType: 'shotgun',
      },
      rogue: {
        id: 'skill_rogue',
        name: 'SHADOW ASSASSINATE',
        type: 'dark',
        category: 'skill',
        power: 80,
        accuracy: 100,
        energyCost: 20,
        description: 'Vanish into shadows and strike for a guaranteed critical hit!',
        effectType: 'buff_crit',
        animationType: 'slash',
        soundType: 'sword',
      },
      wizard: {
        id: 'skill_wizard',
        name: 'LIGHTNING TEMPEST',
        type: 'electric',
        category: 'skill',
        power: 75,
        accuracy: 95,
        energyCost: 35,
        description: 'Summon violent arcane thunderbolts that may stun the boss.',
        effectType: 'stun',
        animationType: 'magic_burst',
        soundType: 'magic',
      },
      assassin: {
        id: 'skill_assassin',
        name: 'DARK BLADE DASH',
        type: 'dark',
        category: 'skill',
        power: 70,
        accuracy: 95,
        energyCost: 25,
        description: 'Lightning-fast cross slash that deflects enemy counter-attacks.',
        animationType: 'slash',
        soundType: 'sword',
      },
      alchemist: {
        id: 'skill_alchemist',
        name: 'TOXIC CATACLYSM',
        type: 'poison',
        category: 'skill',
        power: 50,
        accuracy: 100,
        energyCost: 30,
        description: 'Hurls corrosive toxic gas flasks, inflicting heavy poison!',
        effectType: 'poison',
        animationType: 'explosion',
        soundType: 'plasma',
      },
      paladin: {
        id: 'skill_paladin',
        name: 'SACRED AEGIS SMITE',
        type: 'holy',
        category: 'skill',
        power: 55,
        accuracy: 100,
        energyCost: 25,
        description: 'Radiant holy blast that damages the enemy and restores 3 Shield.',
        effectType: 'shield',
        animationType: 'beam',
        soundType: 'magic',
      },
      gojo: {
        id: 'skill_gojo',
        name: 'HOLLOW PURPLE (虚式「茈」)',
        type: 'dark',
        category: 'skill',
        power: 120,
        accuracy: 95,
        energyCost: 40,
        description: 'Merges Lapse Blue and Reversal Red to fire an unstoppable purple mass of total destruction!',
        effectType: 'buff_crit',
        animationType: 'magic_burst',
        soundType: 'plasma',
      },
    };

    moves.push(heroSkillMoves[hero.id] || heroSkillMoves.knight);

    // Move 4: Pet Companion Action
    moves.push({
      id: 'move_pet',
      name: `${pet.name.toUpperCase()} STRIKE`,
      type: pet.type === 'slime' ? 'grass' : pet.type === 'bat' ? 'dark' : 'normal',
      category: 'pet',
      power: pet.damage * 6,
      accuracy: 95,
      energyCost: 0,
      description: `${pet.name} leaps forward with a fierce loyal assist attack.`,
      animationType: 'pet_pounce',
      soundType: 'punch',
    });

    return moves;
  };

  const initialItems: BattleItem[] = [
    {
      id: 'potion_hp',
      name: 'SUPER HEALTH POTION',
      description: 'Restores 4 HP instantly.',
      count: 2,
      icon: 'Heart',
      effect: 'heal_hp',
      value: 4,
    },
    {
      id: 'elixir_energy',
      name: 'ENERGY ELIXIR',
      description: 'Restores 100 MP energy.',
      count: 2,
      icon: 'Zap',
      effect: 'restore_energy',
      value: 100,
    },
    {
      id: 'shield_cell',
      name: 'SHIELD RECHARGE CELL',
      description: 'Completely recharges your armor shield.',
      count: 1,
      icon: 'Shield',
      effect: 'restore_shield',
      value: 10,
    },
    {
      id: 'plasma_bomb',
      name: 'PLASMA GRENADE',
      description: 'Deals 60 direct explosion damage to boss.',
      count: 1,
      icon: 'Flame',
      effect: 'damage_bomb',
      value: 60,
    },
  ];

  // Battle State
  const [battleState, setBattleState] = useState<BossBattleState>({
    stage,
    boss: {
      id: bossTemplate.id,
      name: bossTemplate.name.toUpperCase(),
      level: stage === 1 ? 50 : stage === 2 ? 75 : 100,
      type: bossTemplate.type,
      maxHp: bossTemplate.hp,
      hp: bossTemplate.hp,
      color: bossTemplate.color,
      statusEffects: [],
      spriteOffset: { x: 0, y: 0 },
      isAttacking: false,
      isHit: false,
      isFainting: false,
    },
    player: {
      hero,
      pet,
      level: 50,
      maxHp: playerStats.maxHp,
      hp: playerStats.hp,
      maxShield: playerStats.maxShield,
      shield: playerStats.shield,
      maxEnergy: playerStats.maxEnergy,
      energy: playerStats.energy,
      statusEffects: [],
      spriteOffset: { x: 0, y: 0 },
      isAttacking: false,
      isHit: false,
      isFainting: false,
      evasionBoostTurns: 0,
      critBoostTurns: 0,
      defenseBoostTurns: 0,
    },
    moves: generateMoves(),
    items: initialItems,
    turn: 'player',
    selectedMenu: 'main',
    selectedMoveIndex: 0,
    dialogueText: `A wild BOSS ${bossTemplate.name.toUpperCase()} appeared!`,
    isDialogueTyping: false,
    turnNumber: 1,
    battleLogs: [`A wild BOSS ${bossTemplate.name.toUpperCase()} appeared!`],
    activeAnimation: null,
  });

  // Sound cue on intro
  useEffect(() => {
    sound.playMusic('boss');
  }, []);

  // Canvas Arena Renderer (Pokémon Split Screen Stage)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Arena Background
      let bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      if (stage === 1) {
        // Ancient ruins stone arena
        bgGradient.addColorStop(0, '#0f172a');
        bgGradient.addColorStop(0.5, '#1e293b');
        bgGradient.addColorStop(1, '#0c0c16');
      } else if (stage === 2) {
        // Volcanic magma forge
        bgGradient.addColorStop(0, '#2d0606');
        bgGradient.addColorStop(0.5, '#450a0a');
        bgGradient.addColorStop(1, '#0c0c16');
      } else {
        // Cosmic void arena
        bgGradient.addColorStop(0, '#1e0533');
        bgGradient.addColorStop(0.5, '#3b0764');
        bgGradient.addColorStop(1, '#0c0c16');
      }

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Arena Grid Perspective Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, height * 0.4);
        ctx.lineTo(i * 1.4 - width * 0.2, height);
        ctx.stroke();
      }

      // 1. OPPONENT BOSS PLATFORM (Top Right)
      const bossPlatformX = width * 0.72;
      const bossPlatformY = height * 0.38;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(bossPlatformX, bossPlatformY + 28, 120, 42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Platform Rim
      ctx.fillStyle = stage === 1 ? '#334155' : stage === 2 ? '#7f1d1d' : '#4c1d95';
      ctx.beginPath();
      ctx.ellipse(bossPlatformX, bossPlatformY + 24, 110, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = stage === 1 ? '#64748b' : stage === 2 ? '#ef4444' : '#a855f7';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 2. PLAYER HERO & PET PLATFORM (Bottom Left)
      const playerPlatformX = width * 0.28;
      const playerPlatformY = height * 0.68;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(playerPlatformX, playerPlatformY + 28, 130, 46, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(playerPlatformX, playerPlatformY + 24, 120, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3effc3';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 3. RENDER OPPONENT BOSS SPRITE
      const bossX = bossPlatformX + battleState.boss.spriteOffset.x;
      const bossY = bossPlatformY + battleState.boss.spriteOffset.y;

      if (!battleState.boss.isFainting || Math.sin(Date.now() / 50) > 0) {
        ctx.save();
        const dummyBoss: Enemy = {
          ...bossTemplate,
          x: bossX,
          y: bossY,
        };
        drawEnemySprite(ctx, dummyBoss, {
          facingRight: false,
          scale: 2.2,
          isHit: battleState.boss.isHit,
          animTime: Date.now() / 1000,
        });
        ctx.restore();
      }

      // 4. RENDER PLAYER HERO SPRITE & PET
      const heroX = playerPlatformX + battleState.player.spriteOffset.x;
      const heroY = playerPlatformY + battleState.player.spriteOffset.y;

      if (!battleState.player.isFainting || Math.sin(Date.now() / 50) > 0) {
        ctx.save();
        drawHeroSprite(ctx, hero.id, heroX, heroY, 18, {
          facingRight: true,
          scale: 2.3,
          isHit: battleState.player.isHit,
          animTime: Date.now() / 1000,
        });
        ctx.restore();

        // Companion Pet standing next to hero on platform
        drawPetSprite(ctx, pet, heroX - 44, heroY + 12, {
          facingRight: true,
          scale: 1.8,
          animTime: Date.now() / 1000,
        });
      }

      // 5. RENDER ACTIVE ATTACK SPELL / PROJECTILE ANIMATION
      if (battleState.activeAnimation) {
        const anim = battleState.activeAnimation;
        ctx.save();
        ctx.fillStyle = anim.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        if (anim.type === 'projectile') {
          ctx.beginPath();
          ctx.arc(anim.x, anim.y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (anim.type === 'slash') {
          ctx.beginPath();
          ctx.arc(anim.x, anim.y, 40, -Math.PI / 4, Math.PI / 4);
          ctx.lineWidth = 6;
          ctx.strokeStyle = anim.color;
          ctx.stroke();
        } else if (anim.type === 'beam') {
          ctx.lineWidth = 8;
          ctx.strokeStyle = anim.color;
          ctx.beginPath();
          ctx.moveTo(playerPlatformX, playerPlatformY);
          ctx.lineTo(bossPlatformX, bossPlatformY);
          ctx.stroke();
        } else if (anim.type === 'explosion') {
          ctx.beginPath();
          ctx.arc(anim.x, anim.y, 35, 0, Math.PI * 2);
          ctx.fillStyle = anim.color;
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [battleState, stage, bossTemplate, hero, pet]);

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

  // --- PLAYER MOVE SELECTION EXECUTION ---
  const handleSelectMove = (move: BattleMove) => {
    if (battleState.turn !== 'player') return;

    // Check Energy
    if (move.energyCost > 0 && battleState.player.energy < move.energyCost) {
      sound.playShoot('pistol');
      setBattleState((prev) => ({
        ...prev,
        dialogueText: 'Not enough MP Energy to execute this move!',
      }));
      return;
    }

    // Deduct Energy
    const remainingEnergy = Math.max(0, battleState.player.energy - move.energyCost);
    sound.playShoot(move.soundType);

    // 1. Animate Player Attack Lunge & Projectile
    setBattleState((prev) => ({
      ...prev,
      turn: 'animating',
      selectedMenu: 'main',
      player: {
        ...prev.player,
        energy: remainingEnergy,
        spriteOffset: { x: 30, y: -15 },
      },
      dialogueText: `${hero.name.toUpperCase()} used ${move.name}!`,
    }));

    // Trigger visual projectile / effect
    setTimeout(() => {
      // Return player to position, shake boss
      sound.playHit(false);

      // Calculate Damage & Crit
      const isCrit = Math.random() < playerStats.critRate + (battleState.player.critBoostTurns > 0 ? 0.5 : 0);
      const critMultiplier = isCrit ? 1.8 : 1.0;
      const baseDamage = Math.round(move.power * (playerStats.accuracy || 1) * critMultiplier);
      const newBossHp = Math.max(0, battleState.boss.hp - baseDamage);

      const statusEffects = [...battleState.boss.statusEffects];
      if (move.effectType === 'burn' && !statusEffects.some((s) => s.type === 'burn')) {
        statusEffects.push({ type: 'burn', turns: 3 });
      }
      if (move.effectType === 'poison' && !statusEffects.some((s) => s.type === 'poison')) {
        statusEffects.push({ type: 'poison', turns: 3 });
      }
      if (move.effectType === 'freeze' && !statusEffects.some((s) => s.type === 'freeze')) {
        statusEffects.push({ type: 'freeze', turns: 2 });
      }

      setBattleState((prev) => ({
        ...prev,
        boss: {
          ...prev.boss,
          hp: newBossHp,
          isHit: true,
          statusEffects,
          spriteOffset: { x: -15, y: -10 },
        },
        player: {
          ...prev.player,
          spriteOffset: { x: 0, y: 0 },
        },
        dialogueText: isCrit
          ? `CRITICAL HIT! Dealt ${baseDamage} damage to ${prev.boss.name}!`
          : `Dealt ${baseDamage} damage to ${prev.boss.name}!`,
      }));

      // Check Boss Defeat
      setTimeout(() => {
        setBattleState((prev) => ({
          ...prev,
          boss: { ...prev.boss, isHit: false, spriteOffset: { x: 0, y: 0 } },
        }));

        if (newBossHp <= 0) {
          handleBossDefeated();
        } else {
          // Pet Follow-up strike if not already pet move
          if (move.category !== 'pet' && Math.random() < 0.6) {
            triggerPetAssist();
          } else {
            startBossTurn();
          }
        }
      }, 900);
    }, 500);
  };

  // Pet Automatic Follow-up Assist
  const triggerPetAssist = () => {
    const petDmg = Math.round(pet.damage * 4);
    const updatedHp = Math.max(0, battleState.boss.hp - petDmg);

    sound.playShoot('punch');
    setBattleState((prev) => ({
      ...prev,
      boss: { ...prev.boss, hp: updatedHp, isHit: true },
      dialogueText: `${pet.name.toUpperCase()} jumped in with an assist! Dealt ${petDmg} extra damage!`,
    }));

    setTimeout(() => {
      setBattleState((prev) => ({
        ...prev,
        boss: { ...prev.boss, isHit: false },
      }));

      if (updatedHp <= 0) {
        handleBossDefeated();
      } else {
        startBossTurn();
      }
    }, 800);
  };

  // --- USE ITEM FROM BAG ---
  const handleUseItem = (item: BattleItem) => {
    if (item.count <= 0 || battleState.turn !== 'player') return;

    sound.playLevelClear();
    let newHp = battleState.player.hp;
    let newEnergy = battleState.player.energy;
    let newShield = battleState.player.shield;
    let newBossHp = battleState.boss.hp;

    if (item.effect === 'heal_hp') {
      newHp = Math.min(battleState.player.maxHp, newHp + item.value);
    } else if (item.effect === 'restore_energy') {
      newEnergy = Math.min(battleState.player.maxEnergy, newEnergy + item.value);
    } else if (item.effect === 'restore_shield') {
      newShield = battleState.player.maxShield;
    } else if (item.effect === 'damage_bomb') {
      newBossHp = Math.max(0, newBossHp - item.value);
    }

    const updatedItems = battleState.items.map((it) => (it.id === item.id ? { ...it, count: it.count - 1 } : it));

    setBattleState((prev) => ({
      ...prev,
      turn: 'animating',
      selectedMenu: 'main',
      items: updatedItems,
      player: {
        ...prev.player,
        hp: newHp,
        energy: newEnergy,
        shield: newShield,
      },
      boss: {
        ...prev.boss,
        hp: newBossHp,
      },
      dialogueText: `Used ${item.name}!`,
    }));

    setTimeout(() => {
      if (newBossHp <= 0) {
        handleBossDefeated();
      } else {
        startBossTurn();
      }
    }, 1000);
  };

  // --- TACTICS (DODGE / FOCUS / FORTIFY) ---
  const handleTactics = (tactic: 'dodge' | 'focus' | 'fortify') => {
    sound.playSkill(hero.id);
    let msg = '';
    let evasionBoost = battleState.player.evasionBoostTurns;
    let critBoost = battleState.player.critBoostTurns;
    let defBoost = battleState.player.defenseBoostTurns;

    if (tactic === 'dodge') {
      evasionBoost = 2;
      msg = `${hero.name.toUpperCase()} assumed an Agile Evade Stance! Evasion boosted for 2 turns!`;
    } else if (tactic === 'focus') {
      critBoost = 2;
      msg = `${hero.name.toUpperCase()} focused their spirit! Critical rate +50% for 2 turns!`;
    } else if (tactic === 'fortify') {
      defBoost = 2;
      msg = `${hero.name.toUpperCase()} fortified their shield defenses!`;
    }

    setBattleState((prev) => ({
      ...prev,
      turn: 'animating',
      selectedMenu: 'main',
      player: {
        ...prev.player,
        evasionBoostTurns: evasionBoost,
        critBoostTurns: critBoost,
        defenseBoostTurns: defBoost,
      },
      dialogueText: msg,
    }));

    setTimeout(() => {
      startBossTurn();
    }, 1100);
  };

  // --- BOSS TURN EXECUTION (AI) ---
  const startBossTurn = () => {
    setBattleState((prev) => ({
      ...prev,
      turn: 'enemy',
      dialogueText: `BOSS ${prev.boss.name} is preparing to attack!`,
    }));

    setTimeout(() => {
      // Check boss status conditions
      let bossStunned = false;
      const updatedBossStatuses = battleState.boss.statusEffects
        .map((st) => {
          if (st.type === 'stun') bossStunned = true;
          return { ...st, turns: st.turns - 1 };
        })
        .filter((st) => st.turns > 0);

      if (bossStunned) {
        sound.playShoot('punch');
        setBattleState((prev) => ({
          ...prev,
          boss: { ...prev.boss, statusEffects: updatedBossStatuses },
          dialogueText: `BOSS ${prev.boss.name} is stunned and could not move!`,
        }));

        setTimeout(() => {
          endTurnAndStartPlayerRound();
        }, 1000);
        return;
      }

      // Boss Moves pool based on boss type
      const isSukuna = battleState.boss.type === 'boss_sukuna' || battleState.boss.name.includes('SUKUNA');
      const bossMoves = isSukuna
        ? [
            { name: 'DISMANTLE (解 - CUTTING SLASH)', power: 4, sound: 'sword' },
            { name: 'CLEAVE (捌 - SEVERING STRIKE)', power: 5, sound: 'sword' },
            { name: 'FUGA: FIRE ARROW (開)', power: 5, sound: 'plasma' },
            { name: 'MALEVOLENT SHRINE (伏魔御廚子)', power: 6, sound: 'plasma' },
          ]
        : [
            { name: 'RADIAL BLADE STORM', power: 3, sound: 'sword' },
            { name: 'HEAVY IMPACT SLAM', power: 4, sound: 'shotgun' },
            { name: 'VENOMOUS ENERGY BEAM', power: 3, sound: 'laser' },
            { name: 'DARK VOID CATACLYSM', power: 5, sound: 'plasma' },
          ];

      const chosenMove = bossMoves[Math.floor(Math.random() * bossMoves.length)];
      sound.playShoot(chosenMove.sound as any);

      // Check Player Evasion
      const evaded = battleState.player.evasionBoostTurns > 0 && Math.random() < 0.6;

      // Boss Lunges Forward
      setBattleState((prev) => ({
        ...prev,
        boss: {
          ...prev.boss,
          statusEffects: updatedBossStatuses,
          spriteOffset: { x: -30, y: 15 },
        },
        dialogueText: `BOSS ${prev.boss.name} used ${chosenMove.name}!`,
      }));

      setTimeout(() => {
        if (evaded) {
          sound.playSkill('rogue');
          setBattleState((prev) => ({
            ...prev,
            boss: { ...prev.boss, spriteOffset: { x: 0, y: 0 } },
            dialogueText: `${hero.name.toUpperCase()} dodged the incoming attack completely!`,
          }));
        } else {
          sound.playHit(true);
          // Apply Damage to Shield first, then HP
          let dmg = chosenMove.power;
          let currentShield = battleState.player.shield;
          let currentHp = battleState.player.hp;

          if (currentShield > 0) {
            const absorbed = Math.min(currentShield, dmg);
            currentShield -= absorbed;
            dmg -= absorbed;
          }

          if (dmg > 0) {
            currentHp = Math.max(0, currentHp - dmg);
          }

          setBattleState((prev) => ({
            ...prev,
            boss: { ...prev.boss, spriteOffset: { x: 0, y: 0 } },
            player: {
              ...prev.player,
              hp: currentHp,
              shield: currentShield,
              isHit: true,
              spriteOffset: { x: -10, y: 10 },
            },
            dialogueText: `${hero.name.toUpperCase()} took ${chosenMove.power} damage!`,
          }));

          setTimeout(() => {
            setBattleState((prev) => ({
              ...prev,
              player: { ...prev.player, isHit: false, spriteOffset: { x: 0, y: 0 } },
            }));

            if (currentHp <= 0) {
              handlePlayerDefeated();
              return;
            }
          }, 600);
        }

        setTimeout(() => {
          endTurnAndStartPlayerRound();
        }, 1000);
      }, 600);
    }, 1000);
  };

  const endTurnAndStartPlayerRound = () => {
    // Regenerate 1 shield if unbroken, recharge 5 energy
    setBattleState((prev) => {
      const shieldRegen = prev.player.shield < prev.player.maxShield ? 1 : 0;
      const energyRegen = Math.min(prev.player.maxEnergy, prev.player.energy + 10);
      return {
        ...prev,
        turn: 'player',
        turnNumber: prev.turnNumber + 1,
        player: {
          ...prev.player,
          shield: Math.min(prev.player.maxShield, prev.player.shield + shieldRegen),
          energy: energyRegen,
          evasionBoostTurns: Math.max(0, prev.player.evasionBoostTurns - 1),
          critBoostTurns: Math.max(0, prev.player.critBoostTurns - 1),
          defenseBoostTurns: Math.max(0, prev.player.defenseBoostTurns - 1),
        },
        dialogueText: `What will ${hero.name.toUpperCase()} do?`,
      };
    });
  };

  const handleBossDefeated = () => {
    sound.playLevelClear();
    setBattleState((prev) => ({
      ...prev,
      turn: 'victory',
      boss: { ...prev.boss, isFainting: true },
      dialogueText: `BOSS ${prev.boss.name} fainted! You won the boss battle!`,
    }));

    setTimeout(() => {
      onVictory({
        gems: 100 + stage * 50,
        coins: 150,
        score: 1000 * stage,
      });
    }, 2200);
  };

  const handlePlayerDefeated = () => {
    sound.playShoot('punch');
    setBattleState((prev) => ({
      ...prev,
      turn: 'defeat',
      player: { ...prev.player, isFainting: true },
      dialogueText: `${hero.name.toUpperCase()} collapsed! Battle lost...`,
    }));

    setTimeout(() => {
      onDefeat();
    }, 2000);
  };

  const currentMove = battleState.moves[battleState.selectedMoveIndex];

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0c0c16] flex flex-col justify-between select-none font-mono text-white overflow-hidden">
      {/* --- POKEMON BATTLE CANVAS ARENA (TOP 65%) --- */}
      <div className="relative w-full h-[62%] sm:h-[65%] border-b-4 border-[#252545]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* 1. BOSS STATUS CARD (TOP RIGHT) */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-[#1a1a2e]/95 border-2 border-[#252545] p-3 sm:p-4 shadow-[6px_6px_0px_#000] w-64 sm:w-76 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white tracking-wide">{battleState.boss.name}</span>
            </div>
            <span className="text-xs font-bold text-[#ffd700] px-1.5 py-0.5 bg-[#0c0c16] border border-[#252545]">
              Lv.{battleState.boss.level}
            </span>
          </div>

          {/* BOSS HP BAR */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-[#ff3e3e]">HP</span>
            <div className="flex-1 h-3.5 bg-[#0c0c16] border border-[#252545] p-0.5 relative overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  battleState.boss.hp / battleState.boss.maxHp > 0.5
                    ? 'bg-[#3effc3]'
                    : battleState.boss.hp / battleState.boss.maxHp > 0.25
                    ? 'bg-[#ffd700]'
                    : 'bg-[#ff3e3e]'
                }`}
                style={{ width: `${Math.max(0, (battleState.boss.hp / battleState.boss.maxHp) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-right font-bold text-[#8a8aa8]">
            {battleState.boss.hp} / {battleState.boss.maxHp} HP
          </div>

          {/* BOSS STATUS CONDITION BADGES */}
          {battleState.boss.statusEffects.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {battleState.boss.statusEffects.map((st, i) => (
                <span
                  key={i}
                  className="text-[9px] font-black px-1.5 py-0.5 bg-[#ff3e3e] text-[#0c0c16] uppercase"
                >
                  {st.type} ({st.turns})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 2. PLAYER STATUS CARD (BOTTOM LEFT) */}
        <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 bg-[#1a1a2e]/95 border-2 border-[#252545] p-3 sm:p-4 shadow-[6px_6px_0px_#000] w-64 sm:w-80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white tracking-wide">{hero.name.toUpperCase()}</span>
              <span className="text-[10px] text-[#3effc3]">({pet.name})</span>
            </div>
            <span className="text-xs font-bold text-[#3effc3] px-1.5 py-0.5 bg-[#0c0c16] border border-[#252545]">
              Lv.{battleState.player.level}
            </span>
          </div>

          {/* HP BAR */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#ff3e3e]">HP</span>
            <div className="flex-1 h-3 bg-[#0c0c16] border border-[#252545] p-0.5 relative overflow-hidden">
              <div
                className="h-full bg-[#ff3e3e] transition-all duration-300"
                style={{ width: `${Math.max(0, (battleState.player.hp / battleState.player.maxHp) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-white w-10 text-right">
              {battleState.player.hp}/{battleState.player.maxHp}
            </span>
          </div>

          {/* SHIELD BAR */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#3e93ff]">SHD</span>
            <div className="flex-1 h-2.5 bg-[#0c0c16] border border-[#252545] p-0.5 relative overflow-hidden">
              <div
                className="h-full bg-[#3e93ff] transition-all duration-300"
                style={{ width: `${Math.max(0, (battleState.player.shield / battleState.player.maxShield) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-white w-10 text-right">
              {battleState.player.shield}/{battleState.player.maxShield}
            </span>
          </div>

          {/* ENERGY BAR */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#3effc3]">MP</span>
            <div className="flex-1 h-2.5 bg-[#0c0c16] border border-[#252545] p-0.5 relative overflow-hidden">
              <div
                className="h-full bg-[#3effc3] transition-all duration-300"
                style={{ width: `${Math.max(0, (battleState.player.energy / battleState.player.maxEnergy) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-white w-10 text-right">
              {battleState.player.energy}/{battleState.player.maxEnergy}
            </span>
          </div>
        </div>
      </div>

      {/* --- POKEMON BATTLE COMMAND & DIALOGUE CONSOLE (BOTTOM 35%) --- */}
      <div className="h-[38%] sm:h-[35%] bg-[#0c0c16] p-3 sm:p-5 flex flex-col justify-between">
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col md:flex-row gap-3 sm:gap-4">
          {/* DIALOGUE / BATTLE ANNOUNCER BOX (LEFT) */}
          <div className="flex-1 bg-[#1a1a2e] border-2 border-[#252545] p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
            <div className="text-sm sm:text-base font-bold text-white leading-relaxed tracking-wide">
              {battleState.dialogueText}
            </div>

            {/* Move description if in fight menu */}
            {battleState.selectedMenu === 'fight' && currentMove && (
              <div className="mt-2 pt-2 border-t border-[#252545] flex items-center justify-between text-xs text-[#8a8aa8]">
                <span>{currentMove.description}</span>
                <span className="text-[#3effc3] font-bold">COST: {currentMove.energyCost} MP</span>
              </div>
            )}
          </div>

          {/* COMMAND MENU BOX (RIGHT) */}
          <div className="w-full md:w-80 bg-[#1a1a2e] border-2 border-[#252545] p-2.5 shadow-[4px_4px_0px_#000] flex flex-col justify-center">
            {/* MAIN POKEMON 4-COMMAND MENU */}
            {battleState.selectedMenu === 'main' && (
              <div className="grid grid-cols-2 gap-2 h-full">
                <button
                  disabled={battleState.turn !== 'player'}
                  onClick={() => setBattleState((prev) => ({ ...prev, selectedMenu: 'fight' }))}
                  className="p-3 bg-[#ff3e3e] hover:bg-[#ff5555] active:translate-x-0.5 active:translate-y-0.5 text-[#0c0c16] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#ff3e3e] shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Swords className="w-4 h-4" /> FIGHT
                </button>
                <button
                  disabled={battleState.turn !== 'player'}
                  onClick={() => setBattleState((prev) => ({ ...prev, selectedMenu: 'bag' }))}
                  className="p-3 bg-[#ffd700] hover:bg-[#ffe033] active:translate-x-0.5 active:translate-y-0.5 text-[#0c0c16] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#ffd700] shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Package className="w-4 h-4" /> BAG
                </button>
                <button
                  disabled={battleState.turn !== 'player'}
                  onClick={() => setBattleState((prev) => ({ ...prev, selectedMenu: 'tactics' }))}
                  className="p-3 bg-[#3e93ff] hover:bg-[#5aa3ff] active:translate-x-0.5 active:translate-y-0.5 text-[#0c0c16] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#3e93ff] shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Shield className="w-4 h-4" /> TACTICS
                </button>
                <button
                  disabled={battleState.turn !== 'player'}
                  onClick={() => handleTactics('focus')}
                  className="p-3 bg-[#3effc3] hover:bg-[#2edaa4] active:translate-x-0.5 active:translate-y-0.5 text-[#0c0c16] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#3effc3] shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles className="w-4 h-4" /> SURGE
                </button>
              </div>
            )}

            {/* FIGHT 4-MOVE MENU */}
            {battleState.selectedMenu === 'fight' && (
              <div className="flex flex-col gap-1.5 h-full justify-between">
                <div className="grid grid-cols-2 gap-1.5">
                  {battleState.moves.map((move, idx) => (
                    <button
                      key={move.id}
                      onMouseEnter={() => setBattleState((prev) => ({ ...prev, selectedMoveIndex: idx }))}
                      onClick={() => handleSelectMove(move)}
                      className={`p-2 text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        battleState.selectedMoveIndex === idx
                          ? 'border-[#3effc3] bg-[#252545] text-white shadow-[2px_2px_0px_#3effc3]'
                          : 'border-[#252545] bg-[#0c0c16] text-[#8a8aa8] hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] font-black uppercase truncate">{move.name}</span>
                      <div className="flex items-center justify-between text-[9px] font-bold mt-1 text-[#ffd700]">
                        <span>POW {move.power}</span>
                        <span>{move.energyCost} MP</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setBattleState((prev) => ({ ...prev, selectedMenu: 'main' }))}
                  className="py-1 bg-[#0c0c16] hover:bg-[#252545] text-[#8a8aa8] text-[10px] font-bold uppercase border border-[#252545] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
              </div>
            )}

            {/* BAG ITEMS MENU */}
            {battleState.selectedMenu === 'bag' && (
              <div className="flex flex-col gap-1.5 h-full justify-between">
                <div className="grid grid-cols-2 gap-1.5">
                  {battleState.items.map((item) => (
                    <button
                      key={item.id}
                      disabled={item.count <= 0}
                      onClick={() => handleUseItem(item)}
                      className="p-2 bg-[#0c0c16] hover:bg-[#252545] text-left border border-[#252545] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-black text-white truncate">{item.name}</span>
                      <span className="text-[9px] font-bold text-[#ffd700] mt-1">QTY: {item.count}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setBattleState((prev) => ({ ...prev, selectedMenu: 'main' }))}
                  className="py-1 bg-[#0c0c16] hover:bg-[#252545] text-[#8a8aa8] text-[10px] font-bold uppercase border border-[#252545] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
              </div>
            )}

            {/* TACTICS MENU */}
            {battleState.selectedMenu === 'tactics' && (
              <div className="flex flex-col gap-1.5 h-full justify-between">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleTactics('dodge')}
                    className="p-1.5 bg-[#0c0c16] hover:bg-[#252545] text-left border border-[#252545] text-[10px] font-bold text-white flex justify-between cursor-pointer"
                  >
                    <span>DODGE STANCE</span>
                    <span className="text-[#3effc3]">+50% EVASION</span>
                  </button>
                  <button
                    onClick={() => handleTactics('focus')}
                    className="p-1.5 bg-[#0c0c16] hover:bg-[#252545] text-left border border-[#252545] text-[10px] font-bold text-white flex justify-between cursor-pointer"
                  >
                    <span>FOCUS SPIRIT</span>
                    <span className="text-[#ffd700]">+50% CRIT</span>
                  </button>
                  <button
                    onClick={() => handleTactics('fortify')}
                    className="p-1.5 bg-[#0c0c16] hover:bg-[#252545] text-left border border-[#252545] text-[10px] font-bold text-white flex justify-between cursor-pointer"
                  >
                    <span>FORTIFY SHIELD</span>
                    <span className="text-[#3e93ff]">ARMOR UP</span>
                  </button>
                </div>
                <button
                  onClick={() => setBattleState((prev) => ({ ...prev, selectedMenu: 'main' }))}
                  className="py-1 bg-[#0c0c16] hover:bg-[#252545] text-[#8a8aa8] text-[10px] font-bold uppercase border border-[#252545] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
