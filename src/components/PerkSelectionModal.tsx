import React from 'react';
import { Perk } from '../types/game';
import { Sparkles, Shield, Heart, Zap, Flame, Skull, Wind, Crosshair, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface PerkSelectionModalProps {
  perks: Perk[];
  onSelectPerk: (perk: Perk) => void;
}

export const PerkSelectionModal: React.FC<PerkSelectionModalProps> = ({
  perks,
  onSelectPerk,
}) => {
  const getPerkIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield-plus':
      case 'shield-alert':
        return <Shield className="w-8 h-8 text-sky-400" />;
      case 'heart-pulse':
        return <Heart className="w-8 h-8 text-rose-400" />;
      case 'battery-charging':
      case 'zap':
        return <Zap className="w-8 h-8 text-amber-400" />;
      case 'flame':
        return <Flame className="w-8 h-8 text-orange-400" />;
      case 'skull':
        return <Skull className="w-8 h-8 text-lime-400" />;
      case 'wind':
        return <Wind className="w-8 h-8 text-cyan-400" />;
      case 'crosshair':
        return <Crosshair className="w-8 h-8 text-violet-400" />;
      default:
        return <Sparkles className="w-8 h-8 text-yellow-400" />;
    }
  };

  const handlePick = (perk: Perk) => {
    sound.playLevelClear();
    onSelectPerk(perk);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c16]/85 backdrop-blur-sm p-4 select-none font-mono">
      <div className="bg-[#1a1a2e] border-2 border-[#ffd700] p-6 sm:p-8 shadow-[8px_8px_0px_#000] max-w-2xl w-full flex flex-col items-center text-center animate-in fade-in duration-200">
        <div className="w-12 h-12 bg-[#0c0c16] border-2 border-[#ffd700] flex items-center justify-center text-[#ffd700] mb-3 shadow-[2px_2px_0px_#000]">
          <Award className="w-6 h-6" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-widest text-white mb-1 uppercase">
          CHOOSE A BLESSING
        </h2>
        <p className="text-xs text-[#8a8aa8] mb-6">
          Floor cleared! Select 1 passive buff to empower your hero for the trials ahead.
        </p>

        {/* 3 PERK CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {perks.map((perk) => (
            <button
              key={perk.id}
              onClick={() => handlePick(perk)}
              className="flex flex-col items-center text-center p-5 bg-[#0c0c16] hover:bg-[#1a1a2e] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#252545] hover:border-[#3effc3] hover:shadow-[4px_4px_0px_#3effc3] shadow-[4px_4px_0px_#000] transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 bg-[#1a1a2e] border-2 border-[#252545] flex items-center justify-center mb-3 group-hover:border-[#3effc3] transition-all shadow-[2px_2px_0px_#000]">
                {getPerkIcon(perk.icon)}
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#3effc3] transition-colors mb-1.5 uppercase tracking-wide">
                {perk.name}
              </h3>
              <p className="text-xs text-[#8a8aa8] leading-relaxed">
                {perk.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
