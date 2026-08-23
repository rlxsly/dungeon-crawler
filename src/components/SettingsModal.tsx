import React, { useState } from 'react';
import { sound } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  X,
  Crosshair,
  HelpCircle,
  Gamepad2,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Check,
  BookOpen,
  Swords,
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  useAutoAim: boolean;
  onToggleAutoAim: (enabled: boolean) => void;
  onResetStats?: () => void;
  onResetAllProgress?: () => void;
  onOpenWeaponsIndex?: () => void;
  onOpenGuide?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  useAutoAim,
  onToggleAutoAim,
  onResetStats,
  onResetAllProgress,
  onOpenWeaponsIndex,
  onOpenGuide,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [confirmResetStats, setConfirmResetStats] = useState(false);
  const [statsResetDone, setStatsResetDone] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const handleExecuteResetStats = () => {
    if (onResetStats) {
      onResetStats();
      sound.playLevelClear();
      setStatsResetDone(true);
      setConfirmResetStats(false);
      setTimeout(() => setStatsResetDone(false), 2500);
    }
  };

  const handleExecuteResetAll = () => {
    if (onResetAllProgress) {
      onResetAllProgress();
      sound.playExplosion();
      setConfirmResetAll(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c16]/85 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150 font-mono">
      <div className="bg-[#1a1a2e] border-2 border-[#252545] p-6 sm:p-7 shadow-[8px_8px_0px_#000] max-w-md w-full flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-[#252545] pb-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#3effc3]" />
            <h2 className="text-base font-black uppercase tracking-wider text-white">GAME SETTINGS</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-[#0c0c16] hover:bg-[#252545] text-[#8a8aa8] hover:text-white border border-[#252545] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SETTINGS OPTIONS */}
        <div className="flex flex-col gap-2.5">
          {/* AUDIO MUTE TOGGLE */}
          <div className="flex items-center justify-between p-3 bg-[#0c0c16] border-2 border-[#252545]">
            <div className="flex items-center gap-2.5">
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#8a8aa8]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#ffd700]" />
              )}
              <div>
                <div className="text-xs font-bold text-white uppercase">AUDIO & MUSIC</div>
                <div className="text-[10px] text-[#8a8aa8]">WebAudio synthesized chiptunes & sfx</div>
              </div>
            </div>
            <button
              onClick={handleToggleMute}
              className={`px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer border-2 ${
                !isMuted
                  ? 'bg-[#ffd700] text-[#0c0c16] border-[#ffd700] shadow-[2px_2px_0px_#000]'
                  : 'bg-[#1a1a2e] text-[#8a8aa8] border-[#252545]'
              }`}
            >
              {!isMuted ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* AUTO-AIM ASSIST TOGGLE */}
          <div className="flex items-center justify-between p-3 bg-[#0c0c16] border-2 border-[#252545]">
            <div className="flex items-center gap-2.5">
              <Crosshair className="w-4 h-4 text-[#3effc3]" />
              <div>
                <div className="text-xs font-bold text-white uppercase">AUTO-AIM ASSIST</div>
                <div className="text-[10px] text-[#8a8aa8]">Lock on to closest dungeon monster</div>
              </div>
            </div>
            <button
              onClick={() => onToggleAutoAim(!useAutoAim)}
              className={`px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer border-2 ${
                useAutoAim
                  ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
                  : 'bg-[#1a1a2e] text-[#8a8aa8] border-[#252545]'
              }`}
            >
              {useAutoAim ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* RESET HERO STATS & UPGRADES */}
          {onResetStats && (
            <div className="flex flex-col gap-2 p-3 bg-[#0c0c16] border-2 border-[#252545]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[#38bdf8]" />
                  <div>
                    <div className="text-xs font-bold text-white uppercase">RESET HERO STATS</div>
                    <div className="text-[10px] text-[#8a8aa8]">Reset HP/Shield/Energy & refund gems</div>
                  </div>
                </div>

                {!confirmResetStats ? (
                  <button
                    onClick={() => setConfirmResetStats(true)}
                    className="px-3 py-1 bg-[#1a1a2e] hover:bg-[#252545] text-[#38bdf8] border-2 border-[#38bdf8] text-xs font-bold uppercase transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    {statsResetDone ? 'RESET DONE!' : 'RESET STATS'}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleExecuteResetStats}
                      className="px-2.5 py-1 bg-[#38bdf8] text-[#0c0c16] border border-[#38bdf8] text-[11px] font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      CONFIRM
                    </button>
                    <button
                      onClick={() => setConfirmResetStats(false)}
                      className="px-2 py-1 bg-[#252545] text-[#8a8aa8] text-[11px] font-bold uppercase cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FACTORY RESET ALL PROGRESS */}
          {onResetAllProgress && (
            <div className="flex flex-col gap-2 p-3 bg-[#0c0c16] border-2 border-[#451a1a]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-[#ef4444]" />
                  <div>
                    <div className="text-xs font-bold text-[#fca5a5] uppercase">RESET ALL PROGRESS</div>
                    <div className="text-[10px] text-[#8a8aa8]">Erase save data, unlocks, high scores</div>
                  </div>
                </div>

                {!confirmResetAll ? (
                  <button
                    onClick={() => setConfirmResetAll(true)}
                    className="px-3 py-1 bg-[#1a1a2e] hover:bg-[#451a1a] text-[#ef4444] border-2 border-[#ef4444] text-xs font-bold uppercase transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    WIPE DATA
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleExecuteResetAll}
                      className="px-2.5 py-1 bg-[#ef4444] text-white border border-[#ef4444] text-[11px] font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      ERASE ALL
                    </button>
                    <button
                      onClick={() => setConfirmResetAll(false)}
                      className="px-2 py-1 bg-[#252545] text-[#8a8aa8] text-[11px] font-bold uppercase cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* QUICK ACCESS: WEAPON INDEX & GUIDE */}
        <div className="grid grid-cols-2 gap-2">
          {onOpenWeaponsIndex && (
            <button
              onClick={() => {
                onClose();
                onOpenWeaponsIndex();
              }}
              className="p-2.5 bg-[#0c0c16] hover:bg-[#252545] border-2 border-[#ffd700] hover:border-[#ffe247] text-white flex items-center justify-center gap-2 text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000] transition-all"
            >
              <Swords className="w-4 h-4 text-[#ffd700]" />
              WEAPONS CODEX
            </button>
          )}

          {onOpenGuide && (
            <button
              onClick={() => {
                onClose();
                onOpenGuide();
              }}
              className="p-2.5 bg-[#0c0c16] hover:bg-[#252545] border-2 border-[#3effc3] hover:border-[#65ffd0] text-white flex items-center justify-center gap-2 text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000] transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#3effc3]" />
              FIELD GUIDE
            </button>
          )}
        </div>

        {/* CONTROLS REFERENCE */}
        <div className="p-3 bg-[#0c0c16] border-2 border-[#252545] text-xs text-[#8a8aa8] flex flex-col gap-1.5 shadow-[2px_2px_0px_#000]">
          <div className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#3effc3]" /> KEYBINDS:
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div><b className="text-white">WASD / ARROWS:</b> Move</div>
            <div><b className="text-white">MOUSE:</b> Aim</div>
            <div><b className="text-white">LEFT CLICK / J:</b> Attack</div>
            <div><b className="text-white">RIGHT CLICK / K:</b> Skill</div>
            <div><b className="text-white">Q / WHEEL:</b> Swap Weapon</div>
            <div><b className="text-white">SPACE / E:</b> Use / Next</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#3effc3] hover:bg-[#2edaa4] active:translate-x-0.5 active:translate-y-0.5 text-[#0c0c16] font-black text-xs uppercase tracking-wider border-2 border-[#3effc3] shadow-[4px_4px_0px_#000] transition-all cursor-pointer"
        >
          RESUME GAME
        </button>
      </div>
    </div>
  );
};
