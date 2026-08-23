import React, { useState, useMemo } from 'react';
import { WEAPONS } from '../data/weapons';
import { Weapon, WeaponRarity, WeaponType } from '../types/game';
import { WeaponPreviewCanvas } from './WeaponPreviewCanvas';
import {
  X,
  Search,
  BookOpen,
  Sword,
  Crosshair,
  Sparkles,
  Zap,
  Target,
  Shield,
  Layers,
  Flame,
  Volume2,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface WeaponIndexModalProps {
  onClose: () => void;
}

const RARITY_CONFIG: Record<WeaponRarity, { label: string; color: string; bg: string; border: string }> = {
  common: { label: 'COMMON', color: '#94a3b8', bg: 'bg-slate-800/40', border: 'border-slate-600' },
  uncommon: { label: 'UNCOMMON', color: '#22c55e', bg: 'bg-emerald-950/40', border: 'border-emerald-500' },
  rare: { label: 'RARE', color: '#3b82f6', bg: 'bg-blue-950/40', border: 'border-blue-500' },
  epic: { label: 'EPIC', color: '#a855f7', bg: 'bg-purple-950/40', border: 'border-purple-500' },
  legendary: { label: 'LEGENDARY', color: '#f59e0b', bg: 'bg-amber-950/40', border: 'border-amber-500' },
  mythic: { label: 'MYTHIC', color: '#ef4444', bg: 'bg-rose-950/40', border: 'border-rose-500' },
};

const TYPE_CONFIG: Record<WeaponType, { label: string; icon: any }> = {
  handgun: { label: 'Pistol', icon: Crosshair },
  rifle: { label: 'Rifle', icon: Target },
  shotgun: { label: 'Shotgun', icon: Sparkles },
  melee: { label: 'Melee Blade', icon: Sword },
  staff: { label: 'Magic Staff', icon: Sparkles },
  laser: { label: 'Laser Cannon', icon: Zap },
  bow: { label: 'Bow', icon: Target },
  launcher: { label: 'Heavy Launcher', icon: Flame },
};

export const WeaponIndexModal: React.FC<WeaponIndexModalProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<WeaponRarity | 'all'>('all');
  const [selectedType, setSelectedType] = useState<WeaponType | 'all'>('all');
  const [activeWeapon, setActiveWeapon] = useState<Weapon>(WEAPONS[0]);

  const filteredWeapons = useMemo(() => {
    return WEAPONS.filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRarity = selectedRarity === 'all' || w.rarity === selectedRarity;
      const matchType = selectedType === 'all' || w.type === selectedType;
      return matchSearch && matchRarity && matchType;
    });
  }, [searchQuery, selectedRarity, selectedType]);

  const handleSelectWeapon = (weapon: Weapon) => {
    setActiveWeapon(weapon);
    sound.playShoot(weapon.soundType || 'pistol');
  };

  const currentRarity = RARITY_CONFIG[activeWeapon.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c16]/90 backdrop-blur-md p-3 sm:p-6 select-none animate-in fade-in duration-150 font-mono">
      <div className="bg-[#1a1a2e] border-2 border-[#252545] shadow-[10px_10px_0px_#000] max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b-2 border-[#252545] p-4 bg-[#121224]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0c0c16] border-2 border-[#ffd700] flex items-center justify-center text-[#ffd700] shadow-[2px_2px_0px_#000]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-[#ffd700] font-black uppercase tracking-widest">
                DUNGEON ENCYCLOPEDIA
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                WEAPON COMPENDIUM & RARITY INDEX
                <span className="text-xs font-bold text-[#8a8aa8] px-2 py-0.5 bg-[#252545] border border-[#3effc3]/30">
                  {WEAPONS.length} WEAPONS CATALOGED
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#0c0c16] hover:bg-[#252545] text-[#8a8aa8] hover:text-white border border-[#252545] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS: SEARCH & FILTERS */}
        <div className="p-3 sm:p-4 bg-[#141428] border-b-2 border-[#252545] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* SEARCH BAR */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8a8aa8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search weapons, types, effects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c0c16] border-2 border-[#252545] text-white text-xs pl-9 pr-3 py-2 outline-none focus:border-[#3effc3] placeholder:text-[#656585]"
            />
          </div>

          {/* RARITY FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedRarity('all')}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer border ${
                selectedRarity === 'all'
                  ? 'bg-white text-[#0c0c16] border-white shadow-[2px_2px_0px_#000]'
                  : 'bg-[#0c0c16] text-[#8a8aa8] border-[#252545] hover:border-white'
              }`}
            >
              ALL
            </button>
            {(Object.keys(RARITY_CONFIG) as WeaponRarity[]).map((r) => {
              const conf = RARITY_CONFIG[r];
              const isSelected = selectedRarity === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRarity(r)}
                  style={{
                    color: isSelected ? '#0c0c16' : conf.color,
                    borderColor: conf.color,
                    backgroundColor: isSelected ? conf.color : '#0c0c16',
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer border whitespace-nowrap"
                >
                  {conf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN BODY: 2 COLUMNS (GRID + DETAIL INSPECTOR) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* WEAPONS LIST GRID (7 COLS) */}
          <div className="md:col-span-7 p-3 sm:p-4 overflow-y-auto border-b-2 md:border-b-0 md:border-r-2 border-[#252545] max-h-[48vh] md:max-h-[60vh]">
            <div className="text-[11px] text-[#8a8aa8] font-bold mb-2 flex items-center justify-between">
              <span>CATALOG RESULTS ({filteredWeapons.length})</span>
              <span>CLICK TO INSPECT & TEST FIRE</span>
            </div>

            {filteredWeapons.length === 0 ? (
              <div className="p-8 text-center text-[#8a8aa8] text-xs">
                No weapons match your search query or filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredWeapons.map((weapon) => {
                  const isSelected = activeWeapon.id === weapon.id;
                  const rConf = RARITY_CONFIG[weapon.rarity];
                  return (
                    <button
                      key={weapon.id}
                      onClick={() => handleSelectWeapon(weapon)}
                      style={{
                        borderColor: isSelected ? weapon.color : '#252545',
                        boxShadow: isSelected ? `3px 3px 0px ${weapon.color}` : 'none',
                      }}
                      className={`p-2.5 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected ? 'bg-[#252545]' : 'bg-[#0c0c16] hover:bg-[#141428]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          style={{ color: rConf.color }}
                          className="text-[9px] font-black uppercase tracking-wider px-1 bg-[#0c0c16] border border-current"
                        >
                          {rConf.label}
                        </span>
                        <span className="text-[10px] text-[#ffd700] font-bold">{weapon.energyCost}⚡</span>
                      </div>

                      <div className="h-12 w-full flex items-center justify-center my-0.5">
                        <WeaponPreviewCanvas weapon={weapon} width={48} height={48} />
                      </div>

                      <div>
                        <div className="text-xs font-black text-white truncate">{weapon.name}</div>
                        <div className="text-[10px] text-[#8a8aa8] flex items-center justify-between">
                          <span className="capitalize">{weapon.type}</span>
                          <span className="text-[#ff3e3e] font-bold">{weapon.damage} DMG</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* INSPECTION DETAIL PANEL (5 COLS) */}
          <div className="md:col-span-5 p-4 sm:p-5 bg-[#121224] flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[60vh]">
            <div className="flex flex-col gap-4">
              {/* TOP WEAPON HERO CARD */}
              <div
                style={{ borderColor: activeWeapon.color }}
                className="p-4 bg-[#0c0c16] border-2 shadow-[4px_4px_0px_#000] flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* RARITY TAG */}
                <div
                  style={{
                    color: currentRarity.color,
                    borderColor: currentRarity.color,
                  }}
                  className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border mb-2"
                >
                  {currentRarity.label} TIER
                </div>

                <div className="w-24 h-24 flex items-center justify-center my-1">
                  <WeaponPreviewCanvas weapon={activeWeapon} width={80} height={80} />
                </div>

                <h3 className="text-lg font-black text-white uppercase tracking-wider">{activeWeapon.name}</h3>
                <div className="text-xs text-[#3effc3] font-bold uppercase tracking-wider mb-2">
                  {activeWeapon.type} CLASS
                </div>
                <p className="text-xs text-[#a0a0c0] leading-relaxed max-w-sm">{activeWeapon.description}</p>
              </div>

              {/* STATS MATRIX */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#0c0c16] border border-[#252545] flex flex-col">
                  <span className="text-[10px] text-[#8a8aa8] font-bold uppercase">BASE DAMAGE</span>
                  <span className="text-sm font-black text-[#ff3e3e]">{activeWeapon.damage} HP</span>
                </div>

                <div className="p-2.5 bg-[#0c0c16] border border-[#252545] flex flex-col">
                  <span className="text-[10px] text-[#8a8aa8] font-bold uppercase">ENERGY COST</span>
                  <span className="text-sm font-black text-[#ffd700]">
                    {activeWeapon.energyCost === 0 ? 'FREE (0)' : `${activeWeapon.energyCost} MANA`}
                  </span>
                </div>

                <div className="p-2.5 bg-[#0c0c16] border border-[#252545] flex flex-col">
                  <span className="text-[10px] text-[#8a8aa8] font-bold uppercase">FIRE RATE</span>
                  <span className="text-sm font-black text-[#3effc3]">{activeWeapon.fireRate} / SEC</span>
                </div>

                <div className="p-2.5 bg-[#0c0c16] border border-[#252545] flex flex-col">
                  <span className="text-[10px] text-[#8a8aa8] font-bold uppercase">CRITICAL HIT</span>
                  <span className="text-sm font-black text-[#f59e0b]">
                    {Math.round(activeWeapon.critChance * 100)}% CHANCE
                  </span>
                </div>
              </div>

              {/* SPECIAL TRAITS */}
              {activeWeapon.specialEffect && (
                <div className="p-3 bg-[#1e1b4b]/60 border border-[#818cf8] text-xs text-[#c7d2fe] flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#818cf8] shrink-0" />
                  <div>
                    <span className="font-black uppercase tracking-wider text-white">
                      SPECIAL TRAIT: {activeWeapon.specialEffect.toUpperCase()}
                    </span>
                    <p className="text-[11px] text-[#a5b4fc] mt-0.5">
                      {activeWeapon.specialEffect === 'reflect' &&
                        'Swinging slashes deflect incoming hostile bullets back at enemies!'}
                      {activeWeapon.specialEffect === 'freeze' && 'Freezes targets solid, immobilizing their attacks.'}
                      {activeWeapon.specialEffect === 'poison' &&
                        'Inflicts stacking caustic poison damage over time.'}
                      {activeWeapon.specialEffect === 'burn' && 'Sets targets ablaze for continuous thermal burn damage.'}
                      {activeWeapon.specialEffect === 'explosive' &&
                        'Triggers high-radius blast explosions on impact!'}
                      {activeWeapon.specialEffect === 'homing' &&
                        'Projectiles curve and seek hostile targets autonomously.'}
                      {activeWeapon.specialEffect === 'pierce' && 'Drills through multiple enemies consecutively.'}
                      {activeWeapon.specialEffect === 'shock' &&
                        'Discharges chain lightning that arcs to adjacent enemies.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* AUDIO TEST BUTTON */}
            <div className="mt-4 pt-3 border-t border-[#252545] flex items-center justify-between">
              <span className="text-[10px] text-[#8a8aa8] uppercase">SOUND PROFILE: {activeWeapon.soundType || 'default'}</span>
              <button
                onClick={() => sound.playShoot(activeWeapon.soundType || 'pistol')}
                className="px-3 py-1.5 bg-[#1a1a2e] hover:bg-[#3effc3] hover:text-[#0c0c16] text-[#3effc3] border border-[#3effc3] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> TEST FIRE SFX
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
