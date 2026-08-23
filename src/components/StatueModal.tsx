import React from 'react';
import { Sparkles, Coins, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface StatueModalProps {
  statueName: string;
  cost: number;
  type: string;
  coins: number;
  onPray: () => void;
  onClose: () => void;
}

export const StatueModal: React.FC<StatueModalProps> = ({
  statueName,
  cost,
  type,
  coins,
  onPray,
  onClose,
}) => {
  const canAfford = coins >= cost;

  const getBlessingDescription = () => {
    switch (type) {
      case 'knight_buff':
        return 'Increases Critical Strike Chance by +8% for this floor.';
      case 'paladin_buff':
        return 'Instantly restores full Shield and grants +1 temporary Shield.';
      case 'assassin_buff':
        return 'Increases Critical Strike Chance by +8% and Movement Speed by +8%.';
      case 'priest_buff':
        return 'Restores full Health and +60 Energy.';
      case 'wizard_buff':
        return 'Increases Maximum Energy by +25 and reduces Skill cooldown.';
      case 'berserker_buff':
        return 'Increases all weapon damage by +18% for this floor.';
      case 'rogue_buff':
        return 'Grants +12% Dodge Chance and +6% Critical Strike.';
      case 'thief_buff':
        return 'Grants +2 bonus Gold per coin pickup.';
      default:
        return 'Grants divine favor and combat prowess.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c16]/85 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150 font-mono">
      <div className="bg-[#1a1a2e] border-2 border-[#3effc3] p-6 shadow-[8px_8px_0px_#000] max-w-sm w-full flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-[#0c0c16] border-2 border-[#3effc3] flex items-center justify-center text-[#3effc3] mb-3 shadow-[3px_3px_0px_#000]">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="text-[10px] text-[#3effc3] font-black uppercase tracking-widest mb-0.5">
          GUARDIAN SHRINE
        </div>
        <h3 className="text-base font-black uppercase tracking-wider text-white mb-1">{statueName}</h3>
        <p className="text-xs text-[#8a8aa8] mb-4">{getBlessingDescription()}</p>

        <div className="flex items-center gap-1.5 text-xs text-[#ffd700] font-bold mb-5 px-3 py-1.5 bg-[#0c0c16] border-2 border-[#252545] shadow-[2px_2px_0px_#000]">
          <Coins className="w-4 h-4 text-[#ffd700]" />
          <span>OFFERING: {cost} GOLD</span>
        </div>

        <div className="flex items-center gap-2.5 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#0c0c16] hover:bg-[#252545] active:translate-x-0.5 active:translate-y-0.5 text-[#8a8aa8] hover:text-white font-bold text-xs uppercase tracking-wider border-2 border-[#252545] shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
          >
            LEAVE
          </button>
          <button
            onClick={onPray}
            disabled={!canAfford}
            className={`flex-1 py-2.5 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border-2 ${
              canAfford
                ? 'bg-[#3effc3] hover:bg-[#2edaa4] active:translate-x-0.5 active:translate-y-0.5 text-[#0c0c16] border-[#3effc3] shadow-[3px_3px_0px_#000]'
                : 'bg-[#0c0c16] text-[#656585] border-[#252545] cursor-not-allowed'
            }`}
          >
            PRAY TO GUARDIAN ({cost} G)
          </button>
        </div>
      </div>
    </div>
  );
};
