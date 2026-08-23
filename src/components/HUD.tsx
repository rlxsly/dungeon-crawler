import React from 'react';
import { GameEngineState, activateHeroSkill, switchWeapon } from '../systems/gameEngine';
import {
  Heart,
  Shield,
  Zap,
  Coins,
  Gem,
  Compass,
  Repeat,
  Sparkles,
  Pause,
  Settings,
  BookOpen,
  Swords,
} from 'lucide-react';

interface HUDProps {
  state: GameEngineState;
  onPause: () => void;
  onOpenSettings: () => void;
  onOpenWeaponsIndex?: () => void;
  onOpenGuide?: () => void;
  onSkillTrigger: () => void;
  onWeaponSwitch: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  state,
  onPause,
  onOpenSettings,
  onOpenWeaponsIndex,
  onOpenGuide,
  onSkillTrigger,
  onWeaponSwitch,
}) => {
  const { player, dungeon, coins, gemsEarned, activeWeaponIndex, primaryWeapon, secondaryWeapon } = state;
  const { stats, hero } = player;

  const activeWeapon = activeWeaponIndex === 0 ? primaryWeapon : secondaryWeapon || primaryWeapon;
  const inactiveWeapon = activeWeaponIndex === 0 ? secondaryWeapon : primaryWeapon;

  const skillCdMax = hero.skillCooldown * (1 - stats.cooldownReduction);
  const skillCdRemaining = player.skillCooldownRemaining;
  const skillPercent = Math.max(0, 1 - skillCdRemaining / skillCdMax);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-mono z-10 text-[#e0e0ed]">
      {/* --- TOP BAR: STATS, FLOOR, MINIMAP, COINS --- */}
      <div className="flex items-start justify-between w-full">
        {/* PLAYER STATUS (HP, SHIELD, ENERGY) */}
        <div className="flex flex-col gap-2 pointer-events-auto bg-[#1a1a2e]/95 border-2 border-[#252545] p-3 shadow-[4px_4px_0px_#000000] max-w-[290px] sm:max-w-[340px]">
          {/* HERO NAME & BADGE */}
          <div className="flex items-center justify-between pb-1.5 border-b border-[#252545]">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 border border-[#3effc3] shadow-[1px_1px_0px_#000]"
                style={{ backgroundColor: hero.color }}
              />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase">
                {hero.name}
              </span>
            </div>
            <div className="inline-block -skew-x-12 px-2 py-0.5 bg-[#252545] border border-[#3effc3]/40">
              <span className="inline-block skew-x-12 text-[10px] sm:text-xs font-bold text-[#3effc3] tracking-widest uppercase">
                STAGE {dungeon.stage}-{dungeon.floor}
              </span>
            </div>
          </div>

          {/* HEALTH (RED - #ff3e3e) */}
          <div className="flex items-center gap-2">
            <div className="w-5 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-[#ff3e3e] fill-[#ff3e3e] shrink-0" />
            </div>
            <div className="flex-1 bg-[#0c0c16] h-3.5 border-2 border-[#252545] relative overflow-hidden">
              <div
                className="h-full bg-[#ff3e3e] transition-all duration-150"
                style={{ width: `${Math.max(0, (stats.hp / stats.maxHp) * 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-white drop-shadow-[0_1px_1px_#000]">
                HP {Math.ceil(stats.hp)} / {stats.maxHp}
              </span>
            </div>
          </div>

          {/* SHIELD (ELECTRIC BLUE - #3e93ff) */}
          <div className="flex items-center gap-2">
            <div className="w-5 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#3e93ff] fill-[#3e93ff] shrink-0" />
            </div>
            <div className="flex-1 bg-[#0c0c16] h-3.5 border-2 border-[#252545] relative overflow-hidden">
              <div
                className="h-full bg-[#3e93ff] transition-all duration-150"
                style={{ width: `${Math.max(0, (stats.shield / stats.maxShield) * 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-white drop-shadow-[0_1px_1px_#000]">
                SHIELD {Math.ceil(stats.shield)} / {stats.maxShield}
              </span>
            </div>
          </div>

          {/* ENERGY (GOLD - #ffd700) */}
          <div className="flex items-center gap-2">
            <div className="w-5 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#ffd700] fill-[#ffd700] shrink-0" />
            </div>
            <div className="flex-1 bg-[#0c0c16] h-3.5 border-2 border-[#252545] relative overflow-hidden">
              <div
                className="h-full bg-[#ffd700] transition-all duration-150"
                style={{ width: `${Math.max(0, (stats.energy / stats.maxEnergy) * 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-[#0c0c16] font-mono">
                ENERGY {Math.floor(stats.energy)} / {stats.maxEnergy}
              </span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: COINS, GEMS & MINIMAP */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          {/* CURRENCY & BUTTONS */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1a2e] border-2 border-[#252545] text-[#ffd700] font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#000]">
              <Coins className="w-3.5 h-3.5 text-[#ffd700] fill-[#ffd700]" />
              <span>{coins}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1a2e] border-2 border-[#252545] text-[#3effc3] font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#000]">
              <Gem className="w-3.5 h-3.5 text-[#3effc3] fill-[#3effc3]" />
              <span>{gemsEarned}</span>
            </div>
            {onOpenWeaponsIndex && (
              <button
                onClick={onOpenWeaponsIndex}
                className="p-1.5 bg-[#1a1a2e] hover:bg-[#252545] hover:border-[#ffd700] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#252545] text-[#ffd700] shadow-[2px_2px_0px_#000] transition-all cursor-pointer hidden sm:flex"
                title="Weapons Codex & Rarities"
              >
                <Swords className="w-4 h-4" />
              </button>
            )}
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="p-1.5 bg-[#1a1a2e] hover:bg-[#252545] hover:border-[#3effc3] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#252545] text-[#3effc3] shadow-[2px_2px_0px_#000] transition-all cursor-pointer hidden sm:flex"
                title="Crawler Field Guide"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="p-1.5 bg-[#1a1a2e] hover:bg-[#252545] hover:border-[#3effc3] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#252545] text-[#e0e0ed] shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onPause}
              className="p-1.5 bg-[#1a1a2e] hover:bg-[#252545] hover:border-[#3effc3] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#252545] text-[#e0e0ed] shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {/* MINIMAP */}
          <div className="bg-[#1a1a2e]/95 border-2 border-[#252545] p-2.5 shadow-[4px_4px_0px_#000000] flex flex-col items-center">
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#0c0c16] border border-[#252545]">
              {Array.from({ length: 4 }).map((_, rIdx) =>
                Array.from({ length: 4 }).map((_, cIdx) => {
                  const room = dungeon.rooms.find((r) => r.gridX === cIdx && r.gridY === rIdx);
                  if (!room) {
                    return <div key={`${rIdx}_${cIdx}`} className="w-4 h-4 bg-transparent" />;
                  }

                  const isCurrent = state.currentRoom.id === room.id;
                  const isVisited = room.visited;

                  let cellColor = 'bg-[#252545]/40';
                  let roomTitle = room.type;
                  if (isCurrent) cellColor = 'bg-[#3effc3] animate-pulse';
                  else if (isVisited) {
                    if (room.type === 'start') {
                      cellColor = 'bg-[#3e93ff]';
                      roomTitle = 'Starting Chamber';
                    } else if (room.type === 'shop') {
                      cellColor = 'bg-[#ffd700]';
                      roomTitle = 'Merchant Outpost';
                    } else if (room.type === 'chest') {
                      cellColor = 'bg-[#3effc3]/80';
                      roomTitle = 'Treasure Vault';
                    } else if (room.type === 'statue') {
                      cellColor = 'bg-[#c084fc]';
                      roomTitle = 'Guardian Shrine';
                    } else if (room.type === 'upgrade') {
                      cellColor = 'bg-[#fb923c]';
                      roomTitle = 'Upgrade Forge & Spring';
                    } else if (room.type === 'boss') {
                      cellColor = 'bg-[#ff3e3e]';
                      roomTitle = 'Boss Chamber';
                    } else {
                      cellColor = 'bg-[#8a8aa8]';
                      roomTitle = 'Dungeon Chamber';
                    }
                  }

                  return (
                    <div
                      key={`${rIdx}_${cIdx}`}
                      className={`w-4 h-4 transition-colors ${cellColor} flex items-center justify-center border border-[#0c0c16]`}
                      title={roomTitle}
                    >
                      {room.type === 'boss' && isVisited && (
                        <div className="w-1.5 h-1.5 bg-white" />
                      )}
                      {room.type === 'statue' && isVisited && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-[10px] text-[#8a8aa8] font-bold mt-1.5 tracking-wider uppercase">
              FLOOR {dungeon.stage}-{dungeon.floor}
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM BAR: WEAPON SLOTS & SKILL BUTTON --- */}
      <div className="flex items-end justify-between w-full pointer-events-auto">
        {/* ACTIVE & SECONDARY WEAPON CARDS */}
        <div className="flex items-center gap-2.5">
          {/* PRIMARY / ACTIVE WEAPON */}
          <div className="flex items-center gap-3 bg-[#1a1a2e]/95 border-2 border-[#3effc3] p-2.5 sm:p-3 shadow-[4px_4px_0px_#000000] min-w-[170px] sm:min-w-[210px]">
            <div
              className="w-10 h-10 flex items-center justify-center border-2 border-[#0c0c16] shadow-sm"
              style={{ backgroundColor: activeWeapon.color }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-white leading-tight uppercase tracking-wide">
                {activeWeapon.name}
              </span>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8a8aa8]">
                <span>DMG: <b className="text-[#ff3e3e]">{activeWeapon.damage}</b></span>
                <span>COST: <b className="text-[#ffd700]">{activeWeapon.energyCost}</b></span>
              </div>
            </div>
          </div>

          {/* SECONDARY WEAPON / SWITCH BUTTON */}
          {secondaryWeapon && (
            <button
              onClick={onWeaponSwitch}
              className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#252545] hover:border-[#3e93ff] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#252545] p-2.5 text-[#e0e0ed] shadow-[4px_4px_0px_#000000] transition-all cursor-pointer group"
              title="Switch Weapon (Q / Mouse Wheel)"
            >
              <div
                className="w-8 h-8 flex items-center justify-center opacity-80 group-hover:opacity-100 border border-[#0c0c16]"
                style={{ backgroundColor: inactiveWeapon?.color || '#252545' }}
              >
                <Repeat className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold hidden sm:inline text-[#8a8aa8] group-hover:text-white uppercase">
                [Q] SWAP
              </span>
            </button>
          )}
        </div>

        {/* HERO ACTIVE SKILL BUTTON */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSkillTrigger}
            disabled={skillCdRemaining > 0}
            className={`relative w-14 h-14 sm:w-16 sm:h-16 flex flex-col items-center justify-center font-bold text-white shadow-[4px_4px_0px_#000000] transition-all cursor-pointer ${
              skillCdRemaining > 0
                ? 'bg-[#1a1a2e] text-[#656585] border-2 border-[#252545] cursor-not-allowed opacity-75'
                : 'bg-[#1a1a2e] hover:bg-[#3effc3] hover:text-[#0c0c16] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#3effc3] text-[#3effc3]'
            }`}
            title={`Use Skill: ${hero.skillName} (Right Click / Space / K)`}
          >
            {/* Cooldown overlay */}
            {skillCdRemaining > 0 && (
              <div className="absolute inset-0 bg-[#0c0c16]/80 flex items-center justify-center border border-[#252545]">
                <span className="text-xs sm:text-sm font-extrabold text-[#ffd700] font-mono">
                  {skillCdRemaining.toFixed(1)}s
                </span>
              </div>
            )}
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">
              SKILL
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
