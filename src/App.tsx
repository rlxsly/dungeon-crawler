import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Hero,
  Pet,
  Weapon,
  Enemy,
  GameSaveData,
  Vector2D,
  Perk,
  DungeonLevel,
} from './types/game';
import { HEROES, PETS } from './data/heroes';
import { WEAPONS, getWeaponById } from './data/weapons';
import { getRandomPerks } from './data/perks';
import { generateDungeonLevel } from './systems/dungeonGenerator';
import {
  GameEngineState,
  createInitialGameState,
  updateGameState,
  activateHeroSkill,
  switchWeapon,
  pickupWeapon,
  upgradeActiveWeapon,
  drinkMagicSpring,
  createFloatingText,
  createRadialParticles,
  damagePlayer,
} from './systems/gameEngine';
import { sound } from './utils/audio';
import { LobbyView } from './components/LobbyView';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { PerkSelectionModal } from './components/PerkSelectionModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { SettingsModal } from './components/SettingsModal';
import { StatueModal } from './components/StatueModal';
import { TouchControls } from './components/TouchControls';
import { BossBattleView } from './components/BossBattleView';
import { WeaponIndexModal } from './components/WeaponIndexModal';
import { GuideModal } from './components/GuideModal';

const STORAGE_KEY = 'soul_knight_roguelike_save_v1';

const DEFAULT_SAVE: GameSaveData = {
  gems: 150,
  highScore: 0,
  dungeonsCleared: 0,
  unlockedHeroes: ['knight', 'rogue'],
  unlockedPets: ['pet_cat', 'pet_dog'],
  selectedHeroId: 'knight',
  selectedPetId: 'pet_cat',
  heroUpgrades: {},
  craftedWeapons: ['bad_pistol', 'rusty_sword'],
  dailyBonusClaimed: false,
};

function getInteractPromptInfo(state: GameEngineState | null): { canInteract: boolean; label: string } {
  if (!state) return { canInteract: false, label: 'USE' };
  const { player, currentRoom } = state;

  // Dropped weapon
  for (const drop of state.drops) {
    if (drop.type === 'weapon' && drop.weapon) {
      if (Math.hypot(player.x - drop.x, player.y - drop.y) < 75) {
        return { canInteract: true, label: 'EQUIP' };
      }
    }
  }

  // Obstacles
  for (const obs of currentRoom.obstacles) {
    const cx = obs.x + obs.width / 2;
    const cy = obs.y + obs.height / 2;
    if (Math.hypot(player.x - cx, player.y - cy) < 85) {
      if (obs.type === 'chest' && !obs.opened) return { canInteract: true, label: 'OPEN' };
      if (obs.type === 'shop_item' && obs.data && !obs.data.bought) return { canInteract: true, label: 'BUY' };
      if (obs.type === 'upgrade_anvil' && (!obs.data || !obs.data.upgraded)) return { canInteract: true, label: 'FORGE' };
      if (obs.type === 'magic_spring' && (!obs.data || !obs.data.used)) return { canInteract: true, label: 'DRINK' };
      if (obs.type === 'statue' && currentRoom.statueBlessing && !currentRoom.statueBlessing.prayed) return { canInteract: true, label: 'PRAY' };
      if (obs.type === 'portal') return { canInteract: true, label: 'PORTAL' };
    }
  }

  return { canInteract: false, label: 'USE' };
}

export default function App() {
  // Load or initialize save data
  const [saveData, setSaveData] = useState<GameSaveData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SAVE, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SAVE;
  });

  const saveSaveData = (data: GameSaveData) => {
    setSaveData(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  const handleResetHeroUpgrades = () => {
    // Calculate spent gems to refund
    let totalRefund = 0;
    Object.values(saveData.heroUpgrades || {}).forEach((u) => {
      const upgrade = u as { hpLevel?: number; shieldLevel?: number; energyLevel?: number };
      totalRefund += ((upgrade.hpLevel || 0) + (upgrade.shieldLevel || 0) + (upgrade.energyLevel || 0)) * 50;
    });

    const newSave: GameSaveData = {
      ...saveData,
      gems: saveData.gems + totalRefund,
      heroUpgrades: {},
    };
    saveSaveData(newSave);

    // If currently inside a run, adjust current stats
    if (engineStateRef.current) {
      const hero = engineStateRef.current.player.hero;
      engineStateRef.current.player.stats.maxHp = hero.maxHp;
      engineStateRef.current.player.stats.hp = Math.min(engineStateRef.current.player.stats.hp, hero.maxHp);
      engineStateRef.current.player.stats.maxShield = hero.maxShield;
      engineStateRef.current.player.stats.shield = Math.min(engineStateRef.current.player.stats.shield, hero.maxShield);
      engineStateRef.current.player.stats.maxEnergy = hero.maxEnergy;
      engineStateRef.current.player.stats.energy = Math.min(engineStateRef.current.player.stats.energy, hero.maxEnergy);
    }
  };

  const handleResetAllProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSaveData(DEFAULT_SAVE);
    setScreen('lobby');
    engineStateRef.current = null;
  };

  // Game Engine & Screen State
  const [screen, setScreen] = useState<'lobby' | 'game' | 'game_over' | 'victory'>('lobby');
  const [isPaused, setIsPaused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [availablePerks, setAvailablePerks] = useState<Perk[] | null>(null);
  const [useAutoAim, setUseAutoAim] = useState(true);
  const [statueModalData, setStatueModalData] = useState<{ name: string; cost: number; type: string } | null>(null);
  const [activeBossBattle, setActiveBossBattle] = useState<Enemy | null>(null);

  // Engine State Container
  const engineStateRef = useRef<GameEngineState | null>(null);
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Input states
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const touchMoveVecRef = useRef<Vector2D>({ x: 0, y: 0 });
  const aimPosRef = useRef<Vector2D>({ x: 0, y: 0 });
  const isMouseDownRef = useRef<boolean>(false);
  const isTouchFiringRef = useRef<boolean>(false);

  // --- START DUNGEON RUN ---
  const handleStartDungeon = (hero: Hero, pet: Pet, startingWeapon: Weapon) => {
    // Apply Hero Upgrades to base stats
    const upgrades = saveData.heroUpgrades[hero.id] || { hpLevel: 0, shieldLevel: 0, energyLevel: 0 };
    const customizedHero = {
      ...hero,
      maxHp: hero.maxHp + upgrades.hpLevel,
      maxShield: hero.maxShield + upgrades.shieldLevel,
      maxEnergy: hero.maxEnergy + upgrades.energyLevel * 20,
    };

    const initialDungeon = generateDungeonLevel(1, 1);
    const state = createInitialGameState(customizedHero, pet, startingWeapon, 1, 1, initialDungeon);
    engineStateRef.current = state;

    setScreen('game');
    setIsPaused(false);
    setAvailablePerks(null);
    sound.playMusic('dungeon_stage1');
  };

  // --- RETURN TO LOBBY ---
  const handleReturnToLobby = () => {
    if (engineStateRef.current) {
      const { score, gemsEarned } = engineStateRef.current;
      const newHighScore = Math.max(saveData.highScore, score);
      saveSaveData({
        ...saveData,
        gems: saveData.gems + gemsEarned,
        highScore: newHighScore,
      });
    }
    setScreen('lobby');
    setIsPaused(false);
    setAvailablePerks(null);
    sound.playMusic('lobby');
  };

  // --- RETRY RUN ---
  const handleRetryRun = () => {
    if (!engineStateRef.current) {
      handleReturnToLobby();
      return;
    }
    const { player, primaryWeapon } = engineStateRef.current;
    handleStartDungeon(player.hero, player.pet, primaryWeapon);
  };

  // --- INTERACTION LOGIC (Next Floor, Chest, Pedestals, Statues, Anvil, Magic Spring, Weapon Drops) ---
  const handleInteract = useCallback(() => {
    const state = engineStateRef.current;
    if (!state || screen !== 'game' || isPaused) return;

    const { player, currentRoom } = state;

    // 1. Check interaction with Dropped Weapons on the floor
    let pickedUpWeapon = false;
    state.drops.forEach((drop) => {
      if (pickedUpWeapon || drop.type !== 'weapon' || !drop.weapon) return;
      const dist = Math.hypot(player.x - drop.x, player.y - drop.y);
      if (dist < 70) {
        pickedUpWeapon = true;
        const weaponToEquip = drop.weapon;
        drop.life = 999; // Remove drop
        pickupWeapon(state, weaponToEquip);
        createFloatingText(state, player.x, player.y - 28, `Equipped ${weaponToEquip.name}!`, weaponToEquip.color);
      }
    });

    if (pickedUpWeapon) return;

    // 2. Check interaction with Room Obstacles / Chest / Portal / Pedestals / Statue / Anvil / Spring
    currentRoom.obstacles.forEach((obs) => {
      const dist = Math.hypot(player.x - (obs.x + obs.width / 2), player.y - (obs.y + obs.height / 2));
      if (dist < 80) {
        if (obs.type === 'chest' && !obs.opened && currentRoom.chestReward) {
          obs.opened = true;
          currentRoom.chestReward.opened = true;
          sound.playChestOpen();

          const { weapon, gold, energy } = currentRoom.chestReward;
          state.coins += gold;
          player.stats.energy = Math.min(player.stats.maxEnergy, player.stats.energy + energy);
          createFloatingText(state, obs.x + obs.width / 2, obs.y, `+${gold} Gold`, '#fbbf24');

          if (weapon) {
            pickupWeapon(state, weapon);
            createFloatingText(state, player.x, player.y - 28, `Found ${weapon.name}!`, weapon.color);
          }
        } else if (obs.type === 'shop_item' && obs.data && !obs.data.bought) {
          const item = obs.data;
          if (state.coins >= item.cost) {
            state.coins -= item.cost;
            item.bought = true;
            sound.playCoin();

            if (item.weapon) {
              pickupWeapon(state, item.weapon);
              createFloatingText(state, player.x, player.y - 28, `Bought ${item.weapon.name}!`, item.weapon.color);
            } else if (item.potionType === 'hp') {
              const heal = player.stats.potionBonus ? 4 : 2;
              player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal);
              createFloatingText(state, player.x, player.y - 28, `+${heal} HP!`, '#22c55e');
            } else if (item.potionType === 'energy') {
              const restore = player.stats.potionBonus ? 100 : 50;
              player.stats.energy = Math.min(player.stats.maxEnergy, player.stats.energy + restore);
              createFloatingText(state, player.x, player.y - 28, `+${restore} Energy!`, '#38bdf8');
            }
          } else {
            sound.playShoot('pistol');
            createFloatingText(state, player.x, player.y - 20, 'NOT ENOUGH GOLD', '#ef4444');
          }
        } else if (obs.type === 'upgrade_anvil') {
          const forgeData = obs.data || currentRoom.upgradeForge || { cost: 25, upgraded: false };
          if (forgeData.upgraded) {
            createFloatingText(state, player.x, player.y - 20, 'FORGE EXHAUSTED', '#94a3b8');
          } else if (state.coins >= forgeData.cost) {
            state.coins -= forgeData.cost;
            forgeData.upgraded = true;
            upgradeActiveWeapon(state);
          } else {
            sound.playShoot('pistol');
            createFloatingText(state, player.x, player.y - 20, `NEED ${forgeData.cost} GOLD`, '#ef4444');
          }
        } else if (obs.type === 'magic_spring') {
          const springData = obs.data || currentRoom.magicSpring || { cost: 15, used: false };
          if (springData.used) {
            createFloatingText(state, player.x, player.y - 20, 'SPRING DRIED UP', '#94a3b8');
          } else if (state.coins >= springData.cost) {
            state.coins -= springData.cost;
            springData.used = true;
            drinkMagicSpring(state);
          } else {
            sound.playShoot('pistol');
            createFloatingText(state, player.x, player.y - 20, `NEED ${springData.cost} GOLD`, '#ef4444');
          }
        } else if (obs.type === 'statue' && currentRoom.statueBlessing && !currentRoom.statueBlessing.prayed) {
          setStatueModalData({
            name: currentRoom.statueBlessing.name,
            cost: currentRoom.statueBlessing.cost,
            type: currentRoom.statueBlessing.type,
          });
        } else if (obs.type === 'portal') {
          // Progress to Next Floor / Trigger Perk Selection
          advanceToNextFloor();
        }
      }
    });
  }, [screen, isPaused]);

  // --- STATUE PRAYER CONFIRMATION ---
  const handleStatuePray = () => {
    const state = engineStateRef.current;
    if (!state || !statueModalData) return;

    if (state.coins >= statueModalData.cost) {
      state.coins -= statueModalData.cost;
      sound.playLevelClear();

      if (statueModalData.type === 'paladin_buff') {
        state.player.stats.shield = state.player.stats.maxShield;
      } else if (statueModalData.type === 'priest_buff') {
        state.player.stats.hp = state.player.stats.maxHp;
        state.player.stats.energy = Math.min(state.player.stats.maxEnergy, state.player.stats.energy + 60);
      } else if (statueModalData.type === 'knight_buff') {
        state.player.stats.critRate = Math.min(0.5, state.player.stats.critRate + 0.08);
      } else if (statueModalData.type === 'assassin_buff') {
        state.player.stats.critRate = Math.min(0.5, state.player.stats.critRate + 0.08);
        state.player.stats.speed = Math.min(280, state.player.stats.speed * 1.08);
      } else if (statueModalData.type === 'wizard_buff') {
        state.player.stats.maxEnergy += 25;
        state.player.stats.energy = Math.min(state.player.stats.maxEnergy, state.player.stats.energy + 25);
        state.player.stats.cooldownReduction = Math.min(0.35, state.player.stats.cooldownReduction + 0.1);
      } else if (statueModalData.type === 'berserker_buff') {
        state.player.stats.damageMultiplier = (state.player.stats.damageMultiplier || 1.0) + 0.18;
      } else if (statueModalData.type === 'rogue_buff') {
        state.player.stats.critRate = Math.min(0.5, state.player.stats.critRate + 0.06);
        state.player.stats.dodgeChance = Math.min(0.4, (state.player.stats.dodgeChance || 0) + 0.12);
      } else if (statueModalData.type === 'thief_buff') {
        state.player.stats.bonusCoins = (state.player.stats.bonusCoins || 0) + 2;
      }

      if (state.currentRoom.statueBlessing) {
        state.currentRoom.statueBlessing.prayed = true;
      }

      createFloatingText(state, state.player.x, state.player.y - 28, 'GUARDIAN BLESSED!', '#38bdf8', true);
      createRadialParticles(state, state.player.x, state.player.y, '#38bdf8', 4);
      setStatueModalData(null);
    }
  };

  // --- ADVANCE FLOOR & PERK MODAL ---
  const advanceToNextFloor = () => {
    const state = engineStateRef.current;
    if (!state) return;

    sound.playLevelClear();
    const currentStage = state.dungeon.stage;
    const currentFloor = state.dungeon.floor;

    if (currentStage === 3 && currentFloor === 5) {
      // COMPLETE VICTORY!
      state.isVictory = true;
      setScreen('victory');
      const newScore = state.score + 1000;
      saveSaveData({
        ...saveData,
        gems: saveData.gems + state.gemsEarned + 100,
        highScore: Math.max(saveData.highScore, newScore),
        dungeonsCleared: saveData.dungeonsCleared + 1,
      });
      return;
    }

    // Open 3 Perk Selection Cards
    const perks = getRandomPerks(3, state.activeBuffs);
    setAvailablePerks(perks);
  };

  const handleSelectPerk = (perk: Perk) => {
    const state = engineStateRef.current;
    if (!state) return;

    perk.effect(state.player.stats);
    state.activeBuffs.push(perk.id);
    createFloatingText(state, state.player.x, state.player.y - 30, `${perk.name}!`, '#fbbf24', true);
    setAvailablePerks(null);

    // Generate Next Floor Level
    let nextStage = state.dungeon.stage;
    let nextFloor = state.dungeon.floor + 1;
    if (nextFloor > 5) {
      nextStage += 1;
      nextFloor = 1;
    }

    const nextDungeon = generateDungeonLevel(nextStage, nextFloor);
    state.dungeon = nextDungeon;
    const startRoom = nextDungeon.rooms.find((r) => r.type === 'start') || nextDungeon.rooms[0];
    state.currentRoom = startRoom;
    state.player.x = startRoom.worldX + startRoom.width / 2;
    state.player.y = startRoom.worldY + startRoom.height / 2;
    state.player.vx = 0;
    state.player.vy = 0;
    state.enemies = [];
    state.bullets = [];
    state.slashes = [];
    state.drops = [];
    state.isRoomLocked = false;
    state.portalTriggered = false;

    // Play next biome track
    const track = nextStage === 1 ? 'dungeon_stage1' : nextStage === 2 ? 'dungeon_stage2' : 'dungeon_stage3';
    sound.playMusic(track);
  };

  // --- BOSS BATTLE VICTORY / DEFEAT ---
  const handleBossVictory = (rewards: { gems: number; coins: number; score: number }) => {
    const state = engineStateRef.current;
    if (!state) return;

    // Apply rewards
    state.gemsEarned += rewards.gems;
    state.coins += rewards.coins;
    state.score += rewards.score;
    state.monstersKilled += 1;

    // Save progression
    saveSaveData({
      ...saveData,
      gems: saveData.gems + rewards.gems,
      highScore: Math.max(saveData.highScore, state.score),
    });

    // Clear boss from room & unlock
    state.enemies = [];
    state.bossBattleTriggered = null;
    state.currentRoom.cleared = true;
    state.currentRoom.bossDefeated = true;
    state.isRoomLocked = false;

    // Spawn Portal & Reward Chest in boss room
    const bx = state.currentRoom.worldX + state.currentRoom.width / 2;
    const by = state.currentRoom.worldY + state.currentRoom.height / 2;

    state.currentRoom.obstacles.push({
      id: `portal_${Date.now()}`,
      x: bx - 20,
      y: by - 20,
      width: 40,
      height: 40,
      type: 'portal',
    });

    state.currentRoom.obstacles.push({
      id: `chest_${Date.now()}`,
      x: bx + 50,
      y: by - 20,
      width: 32,
      height: 32,
      type: 'chest',
      opened: false,
    });
    state.currentRoom.chestReward = {
      weapon: undefined,
      gold: 100,
      energy: 100,
      opened: false,
    };

    createFloatingText(state, state.player.x, state.player.y - 30, 'BOSS DEFEATED! PORTAL OPEN!', '#3effc3', true);
    createRadialParticles(state, bx, by, '#ffd700', 36);

    setActiveBossBattle(null);
    sound.playMusic(state.dungeon.stage === 1 ? 'dungeon_stage1' : state.dungeon.stage === 2 ? 'dungeon_stage2' : 'dungeon_stage3');
  };

  const handleBossDefeat = () => {
    setActiveBossBattle(null);
    setScreen('game_over');
    if (engineStateRef.current) {
      saveSaveData({
        ...saveData,
        gems: saveData.gems + engineStateRef.current.gemsEarned,
        highScore: Math.max(saveData.highScore, engineStateRef.current.score),
      });
    }
  };

  // --- KEYBOARD EVENT LISTENERS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = true;

      if (e.code === 'KeyQ') {
        if (engineStateRef.current) switchWeapon(engineStateRef.current);
      } else if (e.code === 'KeyK' || e.code === 'KeyE') {
        if (engineStateRef.current) activateHeroSkill(engineStateRef.current);
      } else if (e.code === 'Space' || e.code === 'KeyF' || e.code === 'Enter') {
        handleInteract();
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (screen === 'game') {
          setIsPaused((prev) => !prev);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = true;
      } else if (e.button === 2) {
        // Right click for active skill
        if (engineStateRef.current) activateHeroSkill(engineStateRef.current);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent context menu so right click works for skill
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [screen, isPaused, handleInteract]);

  // --- MAIN GAME LOOP (60 FPS) ---
  useEffect(() => {
    if (screen !== 'game' || isPaused || availablePerks !== null || statueModalData !== null) {
      return;
    }

    let lastTime = performance.now();
    let animId: number;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = engineStateRef.current;
      if (state) {
        // Calculate Keyboard Move Vector
        let kx = 0;
        let ky = 0;
        const keys = keysPressedRef.current;
        if (keys['KeyW'] || keys['ArrowUp']) ky -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) ky += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) kx -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) kx += 1;

        // Combine with touch joystick
        const moveVec: Vector2D = {
          x: kx !== 0 ? kx : touchMoveVecRef.current.x,
          y: ky !== 0 ? ky : touchMoveVecRef.current.y,
        };

        const isFiring = isMouseDownRef.current || keys['KeyJ'] || isTouchFiringRef.current;

        updateGameState(state, dt, {
          moveVector: moveVec,
          aimPos: aimPosRef.current,
          isFiring,
          useAutoAim,
        });

        // Trigger Pokemon-style turn-based boss battle
        if (state.bossBattleTriggered && !activeBossBattle && screen === 'game') {
          setActiveBossBattle(state.bossBattleTriggered);
        }

        // Trigger defeat modal
        if (state.isGameOver && screen === 'game') {
          setScreen('game_over');
          saveSaveData({
            ...saveData,
            gems: saveData.gems + state.gemsEarned,
            highScore: Math.max(saveData.highScore, state.score),
          });
        }

        // Trigger victory modal
        if (state.isVictory && screen === 'game') {
          setScreen('victory');
        }

        // Check if player stepped directly onto unlocked portal
        if (state.portalTriggered) {
          state.portalTriggered = false;
          advanceToNextFloor();
        }

        setRenderTrigger((t) => (t + 1) % 1000);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [screen, isPaused, availablePerks, statueModalData, useAutoAim, saveData]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none font-sans">
      {/* SCREEN 1: LOBBY LIVING ROOM */}
      {screen === 'lobby' && (
        <LobbyView
          saveData={saveData}
          onUpdateSave={saveSaveData}
          onStartDungeon={handleStartDungeon}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* SCREEN 2: ACTIVE DUNGEON CRAWLER */}
      {screen === 'game' && engineStateRef.current && (
        <div className="relative w-full h-full">
          {activeBossBattle ? (
            <BossBattleView
              hero={engineStateRef.current.player.hero}
              pet={engineStateRef.current.player.pet}
              playerStats={engineStateRef.current.player.stats}
              primaryWeapon={engineStateRef.current.primaryWeapon}
              secondaryWeapon={engineStateRef.current.secondaryWeapon}
              stage={engineStateRef.current.dungeon.stage}
              bossTemplate={activeBossBattle}
              onVictory={handleBossVictory}
              onDefeat={handleBossDefeat}
            />
          ) : (
            <>
              {/* CANVAS RENDERER */}
              <GameCanvas
                state={engineStateRef.current}
                onAim={(pos) => {
                  aimPosRef.current = pos;
                }}
                onInteract={handleInteract}
              />

              {/* HEADS-UP DISPLAY (HUD) */}
              <HUD
                state={engineStateRef.current}
                onPause={() => setIsPaused((p) => !p)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onSkillTrigger={() => {
                  if (engineStateRef.current) activateHeroSkill(engineStateRef.current);
                }}
                onWeaponSwitch={() => {
                  if (engineStateRef.current) switchWeapon(engineStateRef.current);
                }}
              />

              {/* TOUCH CONTROLS (FOR MOBILE / TABLET / TOUCH DEVICES) */}
              {(() => {
                const interactInfo = getInteractPromptInfo(engineStateRef.current);
                return (
                  <TouchControls
                    onMove={(vec) => {
                      touchMoveVecRef.current = vec;
                    }}
                    onFireChange={(firing) => {
                      isTouchFiringRef.current = firing;
                    }}
                    onSkill={() => {
                      if (engineStateRef.current) activateHeroSkill(engineStateRef.current);
                    }}
                    onSwitchWeapon={() => {
                      if (engineStateRef.current) switchWeapon(engineStateRef.current);
                    }}
                    onInteract={handleInteract}
                    canInteract={interactInfo.canInteract}
                    interactLabel={interactInfo.label}
                    skillCooldownRemaining={engineStateRef.current?.player.skillCooldownRemaining || 0}
                  />
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* MODAL 1: PERK SELECTION (BETWEEN FLOORS) */}
      {availablePerks && (
        <PerkSelectionModal
          perks={availablePerks}
          onSelectPerk={handleSelectPerk}
        />
      )}

      {/* MODAL 2: HERO STATUE PRAYER */}
      {statueModalData && engineStateRef.current && (
        <StatueModal
          statueName={statueModalData.name}
          cost={statueModalData.cost}
          type={statueModalData.type}
          coins={engineStateRef.current.coins}
          onPray={handleStatuePray}
          onClose={() => setStatueModalData(null)}
        />
      )}

      {/* MODAL 3: SETTINGS / PAUSE MENU */}
      {(isSettingsOpen || (isPaused && screen === 'game' && !availablePerks && !statueModalData)) && (
        <SettingsModal
          onClose={() => {
            setIsSettingsOpen(false);
            setIsPaused(false);
          }}
          useAutoAim={useAutoAim}
          onToggleAutoAim={setUseAutoAim}
          onResetStats={handleResetHeroUpgrades}
          onResetAllProgress={handleResetAllProgress}
        />
      )}

      {/* MODAL 4: GAME OVER */}
      {screen === 'game_over' && engineStateRef.current && (
        <GameOverModal
          score={engineStateRef.current.score}
          gemsEarned={engineStateRef.current.gemsEarned}
          coinsEarned={engineStateRef.current.coins}
          monstersKilled={engineStateRef.current.monstersKilled}
          damageDealt={engineStateRef.current.damageDealt}
          floorReached={`${engineStateRef.current.dungeon.stage}-${engineStateRef.current.dungeon.floor}`}
          onRetry={handleRetryRun}
          onLobby={handleReturnToLobby}
        />
      )}

      {/* MODAL 5: VICTORY */}
      {screen === 'victory' && engineStateRef.current && (
        <VictoryModal
          score={engineStateRef.current.score}
          gemsEarned={engineStateRef.current.gemsEarned}
          monstersKilled={engineStateRef.current.monstersKilled}
          damageDealt={engineStateRef.current.damageDealt}
          onLobby={handleReturnToLobby}
          onPlayAgain={handleRetryRun}
        />
      )}
    </div>
  );
}
