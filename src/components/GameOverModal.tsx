import React from 'react';
import { GameRunState } from '../types/game';
import { Skull, RotateCcw, Home, Award, Gem, Coins, Swords } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  score: number;
  gemsEarned: number;
  coinsEarned: number;
  monstersKilled: number;
  damageDealt: number;
  floorReached: string;
  onRetry: () => void;
  onLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  gemsEarned,
  coinsEarned,
  monstersKilled,
  damageDealt,
  floorReached,
  onRetry,
  onLobby,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c16]/85 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200 font-mono">
      <div className="bg-[#1a1a2e] border-2 border-[#ff3e3e] p-6 sm:p-8 shadow-[8px_8px_0px_#000] max-w-md w-full flex flex-col items-center text-center">
        {/* SKULL ICON */}
        <div className="w-16 h-16 bg-[#0c0c16] border-2 border-[#ff3e3e] flex items-center justify-center text-[#ff3e3e] mb-4 shadow-[4px_4px_0px_#000]">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-[#ff3e3e] mb-1 uppercase">
          DEFEAT
        </h2>
        <p className="text-xs text-[#8a8aa8] mb-6">
          Your hero fell on Stage <b className="text-white">{floorReached}</b>. Better luck in the next raid!
        </p>

        {/* RUN SUMMARY STATS */}
        <div className="w-full bg-[#0c0c16] border-2 border-[#252545] p-4 flex flex-col gap-2.5 mb-6 text-xs shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[#8a8aa8] flex items-center gap-1.5 uppercase">
              <Award className="w-3.5 h-3.5 text-[#ffd700]" /> TOTAL SCORE:
            </span>
            <span className="font-bold text-white text-sm">{score}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8a8aa8] flex items-center gap-1.5 uppercase">
              <Gem className="w-3.5 h-3.5 text-[#3effc3]" /> GEMS SALVAGED:
            </span>
            <span className="font-bold text-[#3effc3] text-sm">+{gemsEarned}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8a8aa8] flex items-center gap-1.5 uppercase">
              <Coins className="w-3.5 h-3.5 text-[#ffd700]" /> GOLD COLLECTED:
            </span>
            <span className="font-bold text-[#ffd700]">{coinsEarned}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8a8aa8] flex items-center gap-1.5 uppercase">
              <Swords className="w-3.5 h-3.5 text-[#3e93ff]" /> MONSTERS SLAIN:
            </span>
            <span className="font-bold text-[#e0e0ed]">{monstersKilled}</span>
          </div>

          <div className="flex items-center justify-between border-t-2 border-[#252545] pt-2">
            <span className="text-[#8a8aa8] uppercase">TOTAL DAMAGE:</span>
            <span className="font-bold text-[#ff3e3e]">{damageDealt}</span>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => {
              sound.playShoot('sword');
              onLobby();
            }}
            className="flex-1 py-3 px-4 bg-[#0c0c16] hover:bg-[#252545] active:translate-x-0.5 active:translate-y-0.5 text-[#8a8aa8] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#252545] transition-all cursor-pointer shadow-[3px_3px_0px_#000]"
          >
            <Home className="w-4 h-4" /> LIVING ROOM
          </button>
          <button
            onClick={() => {
              sound.playShoot('sword');
              onRetry();
            }}
            className="flex-1 py-3 px-4 bg-[#3effc3] hover:bg-[#2edaa4] active:translate-x-0.5 active:translate-y-0.5 text-[#0c0c16] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000] border-2 border-[#3effc3] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> RETRY DUNGEON
          </button>
        </div>
      </div>
    </div>
  );
};
