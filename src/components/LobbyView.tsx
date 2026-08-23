import React, { useState } from 'react';
import { HEROES, PETS } from '../data/heroes';
import { WEAPONS, getWeaponById } from '../data/weapons';
import { Hero, Pet, Weapon, GameSaveData } from '../types/game';
import { sound } from '../utils/audio';
import { HeroPreviewCanvas, PetPreviewCanvas } from './SpritePreviewCanvas';
import {
  Shield,
  Heart,
  Zap,
  Sparkles,
  Flame,
  Gem,
  Swords,
  ChevronRight,
  ChevronLeft,
  Play,
  Lock,
  Check,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  Settings,
} from 'lucide-react';

interface LobbyViewProps {
  saveData: GameSaveData;
  onUpdateSave: (newSave: GameSaveData) => void;
  onStartDungeon: (hero: Hero, pet: Pet, startingWeapon: Weapon) => void;
  onOpenSettings?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  saveData,
  onUpdateSave,
  onStartDungeon,
  onOpenSettings,
}) => {
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(
    Math.max(0, HEROES.findIndex((h) => h.id === saveData.selectedHeroId))
  );
  const [selectedPetIndex, setSelectedPetIndex] = useState(
    Math.max(0, PETS.findIndex((p) => p.id === saveData.selectedPetId))
  );
  const [activeTab, setActiveTab] = useState<'heroes' | 'pets' | 'forge' | 'safe'>('heroes');
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(HEROES[selectedHeroIndex].startingWeaponId);
  const [safeClaimed, setSafeClaimed] = useState(false);

  const currentHero = HEROES[selectedHeroIndex];
  const currentPet = PETS[selectedPetIndex];
  const isHeroUnlocked = saveData.unlockedHeroes.includes(currentHero.id) || currentHero.unlocked;

  const handleSelectHero = (idx: number) => {
    setSelectedHeroIndex(idx);
    const hero = HEROES[idx];
    setSelectedWeaponId(hero.startingWeaponId);
    sound.playShoot('sword');
  };

  const handleUnlockHero = () => {
    if (saveData.gems >= currentHero.gemCost) {
      const newGems = saveData.gems - currentHero.gemCost;
      const newUnlocked = [...saveData.unlockedHeroes, currentHero.id];
      onUpdateSave({
        ...saveData,
        gems: newGems,
        unlockedHeroes: newUnlocked,
        selectedHeroId: currentHero.id,
      });
      sound.playLevelClear();
    } else {
      sound.playShoot('pistol');
    }
  };

  const handleUpgradeHeroStat = (stat: 'hp' | 'shield' | 'energy') => {
    const cost = 50;
    if (saveData.gems >= cost) {
      const heroUpgrades = { ...saveData.heroUpgrades };
      const current = heroUpgrades[currentHero.id] || { hpLevel: 0, shieldLevel: 0, energyLevel: 0 };

      if (stat === 'hp') current.hpLevel += 1;
      if (stat === 'shield') current.shieldLevel += 1;
      if (stat === 'energy') current.energyLevel += 1;

      heroUpgrades[currentHero.id] = current;
      onUpdateSave({
        ...saveData,
        gems: saveData.gems - cost,
        heroUpgrades,
      });
      sound.playCoin();
    }
  };

  const handleClaimSafe = () => {
    if (!safeClaimed) {
      setSafeClaimed(true);
      onUpdateSave({
        ...saveData,
        gems: saveData.gems + 100,
      });
      sound.playChestOpen();
    }
  };

  const handleStartGame = () => {
    if (!isHeroUnlocked) return;
    const chosenWeapon = getWeaponById(selectedWeaponId);
    sound.playSkill(currentHero.id);
    onStartDungeon(currentHero, currentPet, chosenWeapon);
  };

  const currentUpgrades = saveData.heroUpgrades[currentHero.id] || { hpLevel: 0, shieldLevel: 0, energyLevel: 0 };
  const effectiveHp = currentHero.maxHp + currentUpgrades.hpLevel;
  const effectiveShield = currentHero.maxShield + currentUpgrades.shieldLevel;
  const effectiveEnergy = currentHero.maxEnergy + currentUpgrades.energyLevel * 20;

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0c0c16] geometric-grid-bg flex flex-col justify-between p-4 sm:p-8 text-[#e0e0ed] select-none font-mono overflow-y-auto">
      {/* --- HEADER: GAME TITLE, HIGH SCORE & GEMS --- */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto border-b-2 border-[#252545] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a1a2e] border-2 border-[#3effc3] flex items-center justify-center shadow-[3px_3px_0px_#000]">
            <Swords className="w-5 h-5 text-[#3effc3]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              DUNGEON CRAWLERS{' '}
              <div className="inline-block -skew-x-12 px-2 py-0.5 bg-[#ff3e3e]">
                <span className="inline-block skew-x-12 text-[10px] sm:text-xs font-black text-[#0c0c16] tracking-wider uppercase">
                  GUILD OUTPOST
                </span>
              </div>
            </h1>
            <p className="text-xs text-[#8a8aa8]">Choose your crawler, upgrade abilities, and brave the depths!</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* HIGH SCORE */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2e] border-2 border-[#252545] text-[#ffd700] text-xs font-bold shadow-[2px_2px_0px_#000]">
            <Award className="w-4 h-4 text-[#ffd700]" />
            <span>BEST: <b className="text-white">{saveData.highScore}</b></span>
          </div>

          {/* GEMS */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a1a2e] border-2 border-[#3effc3] text-[#3effc3] font-bold text-sm shadow-[2px_2px_0px_#000]">
            <Gem className="w-4 h-4 text-[#3effc3] fill-[#3effc3]" />
            <span>{saveData.gems}</span>
          </div>

          {/* SETTINGS BUTTON */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 bg-[#1a1a2e] hover:bg-[#252545] text-[#8a8aa8] hover:text-white border-2 border-[#252545] hover:border-[#3effc3] transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
              title="Settings & Reset Stats"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* --- MAIN LOBBY HUB --- */}
      <div className="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 py-6">
        {/* LEFT COLUMN: HERO PODIUM & SELECTION (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* TAB SWITCHER */}
          <div className="flex items-center gap-2 border-b-2 border-[#252545] pb-2 flex-wrap">
            <button
              onClick={() => setActiveTab('heroes')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-2 ${
                activeTab === 'heroes'
                  ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
                  : 'bg-[#1a1a2e] text-[#8a8aa8] border-[#252545] hover:border-[#3effc3] hover:text-white'
              }`}
            >
              HEROES & KNIGHTS
            </button>
            <button
              onClick={() => setActiveTab('pets')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-2 ${
                activeTab === 'pets'
                  ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
                  : 'bg-[#1a1a2e] text-[#8a8aa8] border-[#252545] hover:border-[#3effc3] hover:text-white'
              }`}
            >
              PET COMPANIONS
            </button>
            <button
              onClick={() => setActiveTab('forge')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-2 ${
                activeTab === 'forge'
                  ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
                  : 'bg-[#1a1a2e] text-[#8a8aa8] border-[#252545] hover:border-[#3effc3] hover:text-white'
              }`}
            >
              WEAPON FORGE
            </button>
            <button
              onClick={() => setActiveTab('safe')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-2 ${
                activeTab === 'safe'
                  ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
                  : 'bg-[#1a1a2e] text-[#8a8aa8] border-[#252545] hover:border-[#3effc3] hover:text-white'
              }`}
            >
              SAFE & TREASURY
            </button>
          </div>

          {/* TAB 1: HERO SELECTOR */}
          {activeTab === 'heroes' && (
            <div className="bg-[#1a1a2e] border-2 border-[#252545] p-5 shadow-[6px_6px_0px_#000] flex flex-col gap-4">
              {/* HERO CAROUSEL SELECTOR */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {HEROES.map((hero, idx) => {
                  const unlocked = saveData.unlockedHeroes.includes(hero.id) || hero.unlocked;
                  const isSelected = idx === selectedHeroIndex;
                  return (
                    <button
                      key={hero.id}
                      onClick={() => handleSelectHero(idx)}
                      className={`relative flex flex-col items-center justify-center p-2 border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#3effc3] bg-[#252545] shadow-[3px_3px_0px_#3effc3]'
                          : 'border-[#252545] bg-[#0c0c16] hover:border-[#3effc3]/60'
                      }`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center mb-1">
                        <HeroPreviewCanvas heroId={hero.id} scale={1.8} width={48} height={48} />
                      </div>
                      <span className="text-[11px] font-bold text-[#e0e0ed] uppercase">{hero.name}</span>
                      {!unlocked && (
                        <div className="absolute top-1 right-1 bg-[#0c0c16] p-1 border border-[#ff3e3e]">
                          <Lock className="w-2.5 h-2.5 text-[#ff3e3e]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* CURRENT HERO SPOTLIGHT */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#0c0c16] border-2 border-[#252545]">
                {/* HERO AVATAR DISPLAY */}
                <div className="w-24 h-24 flex items-center justify-center border-4 border-[#3effc3] bg-[#1a1a2e] shadow-[4px_4px_0px_#000] relative shrink-0">
                  <HeroPreviewCanvas heroId={currentHero.id} scale={2.8} width={96} height={96} />
                </div>

                <div className="flex-1 flex flex-col gap-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">{currentHero.name}</h2>
                    <div className="inline-block -skew-x-12 px-2 py-0.5 bg-[#252545]">
                      <span className="inline-block skew-x-12 text-[10px] font-bold text-[#3effc3] uppercase">
                        {currentHero.title}
                      </span>
                    </div>
                  </div>

                  {/* ACTIVE SKILL & PASSIVE */}
                  <div className="text-xs text-[#e0e0ed]">
                    <b className="text-[#3effc3] uppercase">SKILL:</b> {currentHero.skillName} –{' '}
                    <span className="text-[#8a8aa8]">{currentHero.skillDescription}</span>
                  </div>
                  <div className="text-xs text-[#e0e0ed]">
                    <b className="text-[#ffd700] uppercase">PASSIVE:</b> {currentHero.passiveName} –{' '}
                    <span className="text-[#8a8aa8]">{currentHero.passiveDescription}</span>
                  </div>
                </div>
              </div>

              {/* STATS & UPGRADES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* HP */}
                <div className="bg-[#0c0c16] border-2 border-[#252545] p-3 flex items-center justify-between shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#ff3e3e] fill-[#ff3e3e]" />
                    <div>
                      <div className="text-[10px] text-[#8a8aa8] font-bold uppercase">HEALTH</div>
                      <div className="text-sm font-black text-[#ff3e3e]">{effectiveHp} HP</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpgradeHeroStat('hp')}
                    className="text-[10px] font-bold px-2.5 py-1 bg-[#1a1a2e] hover:bg-[#ff3e3e] hover:text-[#0c0c16] active:translate-x-0.5 active:translate-y-0.5 text-[#ff3e3e] border border-[#ff3e3e] cursor-pointer flex items-center gap-1 transition-all"
                    title="Upgrade HP (+1) for 50 Gems"
                  >
                    +1 <Gem className="w-2.5 h-2.5" />50
                  </button>
                </div>

                {/* SHIELD */}
                <div className="bg-[#0c0c16] border-2 border-[#252545] p-3 flex items-center justify-between shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#3e93ff] fill-[#3e93ff]" />
                    <div>
                      <div className="text-[10px] text-[#8a8aa8] font-bold uppercase">SHIELD</div>
                      <div className="text-sm font-black text-[#3e93ff]">{effectiveShield} ARMOR</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpgradeHeroStat('shield')}
                    className="text-[10px] font-bold px-2.5 py-1 bg-[#1a1a2e] hover:bg-[#3e93ff] hover:text-[#0c0c16] active:translate-x-0.5 active:translate-y-0.5 text-[#3e93ff] border border-[#3e93ff] cursor-pointer flex items-center gap-1 transition-all"
                    title="Upgrade Shield (+1) for 50 Gems"
                  >
                    +1 <Gem className="w-2.5 h-2.5" />50
                  </button>
                </div>

                {/* ENERGY */}
                <div className="bg-[#0c0c16] border-2 border-[#252545] p-3 flex items-center justify-between shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#ffd700] fill-[#ffd700]" />
                    <div>
                      <div className="text-[10px] text-[#8a8aa8] font-bold uppercase">ENERGY</div>
                      <div className="text-sm font-black text-[#ffd700]">{effectiveEnergy} MANA</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpgradeHeroStat('energy')}
                    className="text-[10px] font-bold px-2.5 py-1 bg-[#1a1a2e] hover:bg-[#ffd700] hover:text-[#0c0c16] active:translate-x-0.5 active:translate-y-0.5 text-[#ffd700] border border-[#ffd700] cursor-pointer flex items-center gap-1 transition-all"
                    title="Upgrade Energy (+20) for 50 Gems"
                  >
                    +20 <Gem className="w-2.5 h-2.5" />50
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PETS */}
          {activeTab === 'pets' && (
            <div className="bg-[#1a1a2e] border-2 border-[#252545] p-5 shadow-[6px_6px_0px_#000] flex flex-col gap-4">
              <h3 className="text-xs font-bold text-[#8a8aa8] uppercase tracking-wider">CHOOSE COMPANION PET</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PETS.map((pet, idx) => {
                  const isSelected = idx === selectedPetIndex;
                  return (
                    <button
                      key={pet.id}
                      onClick={() => {
                        setSelectedPetIndex(idx);
                        sound.playCoin();
                      }}
                      className={`flex flex-col items-center p-3 border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#ffd700] bg-[#252545] shadow-[3px_3px_0px_#ffd700]'
                          : 'border-[#252545] bg-[#0c0c16] hover:border-[#ffd700]/50'
                      }`}
                    >
                      <div className="w-16 h-16 flex items-center justify-center mb-1">
                        <PetPreviewCanvas pet={pet} scale={2.2} width={64} height={64} />
                      </div>
                      <span className="text-xs font-bold text-white uppercase">{pet.name}</span>
                      <span className="text-[10px] text-[#8a8aa8] mt-1 text-center">{pet.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WEAPON FORGE */}
          {activeTab === 'forge' && (
            <div className="bg-[#1a1a2e] border-2 border-[#252545] p-5 shadow-[6px_6px_0px_#000] flex flex-col gap-3">
              <h3 className="text-xs font-bold text-[#8a8aa8] uppercase tracking-wider">STARTING WEAPON SELECTION</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {WEAPONS.slice(0, 10).map((w) => {
                  const isSelected = w.id === selectedWeaponId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setSelectedWeaponId(w.id);
                        sound.playShoot(w.soundType);
                      }}
                      className={`flex items-center gap-2.5 p-2.5 border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#3effc3] bg-[#252545] shadow-[2px_2px_0px_#3effc3]'
                          : 'border-[#252545] bg-[#0c0c16] hover:border-[#3effc3]/50'
                      }`}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center text-white shrink-0 border border-[#0c0c16]"
                        style={{ backgroundColor: w.color }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white uppercase">{w.name}</div>
                        <div className="text-[10px] text-[#8a8aa8]">DMG: {w.damage} | COST: {w.energyCost}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SAFE & TREASURY */}
          {activeTab === 'safe' && (
            <div className="bg-[#1a1a2e] border-2 border-[#252545] p-6 shadow-[6px_6px_0px_#000] flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-[#0c0c16] border-2 border-[#ffd700] flex items-center justify-center text-[#ffd700] shadow-[3px_3px_0px_#000]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">DAILY SAFE TREASURY</h3>
              <p className="text-xs text-[#8a8aa8] max-w-md">
                Open the vault to claim 100 free gems to unlock heroes and upgrade combat statistics!
              </p>
              <button
                onClick={handleClaimSafe}
                disabled={safeClaimed}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-2 ${
                  safeClaimed
                    ? 'bg-[#0c0c16] text-[#656585] border-[#252545] cursor-not-allowed'
                    : 'bg-[#ffd700] hover:bg-[#f0c800] text-[#0c0c16] border-[#ffd700] shadow-[4px_4px_0px_#000]'
                }`}
              >
                {safeClaimed ? 'VAULT EMPTIED TODAY' : 'OPEN VAULT (+100 GEMS)'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ENTER DUNGEON / UNLOCK ACTION (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#1a1a2e] border-2 border-[#252545] p-6 shadow-[6px_6px_0px_#000]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-[#252545] pb-3">
              <span className="text-xs font-bold text-[#8a8aa8] uppercase tracking-widest">
                RUN CONFIGURATION
              </span>
              <div className="inline-block -skew-x-12 px-2 py-0.5 bg-[#252545] border border-[#3effc3]/50">
                <span className="inline-block skew-x-12 text-xs font-bold text-[#3effc3] uppercase">
                  STAGE 1-1 READY
                </span>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between p-3 bg-[#0c0c16] border-2 border-[#252545]">
                <span className="text-xs text-[#8a8aa8] uppercase">SELECTED HERO:</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                  <span
                    className="w-2.5 h-2.5 border border-[#3effc3]"
                    style={{ backgroundColor: currentHero.color }}
                  />
                  {currentHero.name}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0c0c16] border-2 border-[#252545]">
                <span className="text-xs text-[#8a8aa8] uppercase">COMPANION PET:</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                  <span
                    className="w-2.5 h-2.5 border border-[#ffd700]"
                    style={{ backgroundColor: currentPet.color }}
                  />
                  {currentPet.name}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0c0c16] border-2 border-[#252545]">
                <span className="text-xs text-[#8a8aa8] uppercase">STARTING WEAPON:</span>
                <span className="text-xs font-bold text-[#ffd700] uppercase">
                  {getWeaponById(selectedWeaponId).name}
                </span>
              </div>
            </div>

            {/* KEYBOARD CONTROLS GUIDE */}
            <div className="p-3 bg-[#0c0c16] border-2 border-[#252545] text-[11px] text-[#8a8aa8] flex flex-col gap-1.5">
              <div className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#3effc3]" />
                CONTROLS GUIDE:
              </div>
              <div>• <b className="text-white">WASD / ARROWS:</b> Move Hero</div>
              <div>• <b className="text-white">MOUSE AIM + LEFT CLICK / J:</b> Attack</div>
              <div>• <b className="text-white">RIGHT CLICK / SPACE / K:</b> Cast Active Skill</div>
              <div>• <b className="text-white">Q / MOUSE WHEEL:</b> Switch Weapons</div>
            </div>
          </div>

          {/* ACTION BUTTON: UNLOCK OR ENTER DUNGEON */}
          <div className="mt-6">
            {!isHeroUnlocked ? (
              <button
                onClick={handleUnlockHero}
                disabled={saveData.gems < currentHero.gemCost}
                className={`w-full py-4 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                  saveData.gems >= currentHero.gemCost
                    ? 'bg-[#1a1a2e] hover:bg-[#3effc3] hover:text-[#0c0c16] text-[#3effc3] border-[#3effc3] shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5'
                    : 'bg-[#0c0c16] text-[#656585] border-[#252545] cursor-not-allowed'
                }`}
              >
                <Lock className="w-4 h-4" />
                UNLOCK {currentHero.name} ({currentHero.gemCost} GEMS)
              </button>
            ) : (
              <button
                onClick={handleStartGame}
                className="w-full py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 bg-[#3effc3] hover:bg-[#2edaa4] active:translate-x-0.5 active:translate-y-0.5 text-[#0c0c16] shadow-[6px_6px_0px_#000] border-2 border-[#3effc3] transition-all cursor-pointer group"
              >
                <Play className="w-5 h-5 fill-[#0c0c16] group-hover:scale-110 transition-transform" />
                ENTER DUNGEON (PORTAL)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
