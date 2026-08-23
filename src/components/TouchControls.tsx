import React, { useRef, useState, useEffect } from 'react';
import { Vector2D } from '../types/game';
import { Sparkles, Repeat, Flame, Hand } from 'lucide-react';

interface TouchControlsProps {
  onMove: (vec: Vector2D) => void;
  onFireChange: (isFiring: boolean) => void;
  onSkill: () => void;
  onSwitchWeapon: () => void;
  onInteract?: () => void;
  canInteract?: boolean;
  interactLabel?: string;
  skillCooldownRemaining?: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onFireChange,
  onSkill,
  onSwitchWeapon,
  onInteract,
  canInteract = false,
  interactLabel = 'USE',
  skillCooldownRemaining = 0,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [stickPos, setStickPos] = useState<Vector2D>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        updateJoystickPos(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        setIsDragging(false);
        setStickPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        touchIdRef.current = null;
        break;
      }
    }
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = 45;

    const dist = Math.hypot(dx, dy);
    let clampedX = dx;
    let clampedY = dy;

    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setStickPos({ x: clampedX, y: clampedY });
    onMove({ x: clampedX / maxRadius, y: clampedY / maxRadius });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none flex justify-between items-end p-3 sm:p-8 font-mono">
      {/* JOYSTICK (BOTTOM LEFT) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-28 h-28 sm:w-32 sm:h-32 bg-[#1a1a2e]/85 border-2 border-[#252545] shadow-[4px_4px_0px_#000] pointer-events-auto flex items-center justify-center relative touch-none opacity-85 hover:opacity-100 transition-opacity"
      >
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 bg-[#3effc3] border-2 border-[#0c0c16] shadow-[2px_2px_0px_#000] transition-transform duration-75"
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          }}
        />
      </div>

      {/* ACTION BUTTONS (BOTTOM RIGHT) */}
      <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* WEAPON SWITCH BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSwitchWeapon();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              onSwitchWeapon();
            }}
            className="w-12 h-12 bg-[#1a1a2e] border-2 border-[#252545] text-[#ffd700] hover:border-[#ffd700] active:scale-95 active:translate-x-0.5 active:translate-y-0.5 flex flex-col items-center justify-center shadow-[3px_3px_0px_#000] cursor-pointer transition-all"
            title="Switch Weapon [Q]"
          >
            <Repeat className="w-4 h-4 mb-0.5" />
            <span className="text-[8px] font-bold uppercase">SWAP</span>
          </button>

          {/* SKILL BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSkill();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              onSkill();
            }}
            disabled={skillCooldownRemaining > 0}
            className={`w-12 h-12 relative border-2 flex flex-col items-center justify-center shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
              skillCooldownRemaining > 0
                ? 'bg-[#1a1a2e] border-[#252545] text-[#656585] opacity-75'
                : 'bg-[#1a1a2e] border-[#3e93ff] text-[#3e93ff] hover:bg-[#3e93ff] hover:text-[#0c0c16] active:scale-95 active:translate-x-0.5 active:translate-y-0.5'
            }`}
            title="Skill [K / Right Click]"
          >
            {skillCooldownRemaining > 0 ? (
              <span className="text-[10px] font-black text-[#ffd700]">
                {skillCooldownRemaining.toFixed(1)}s
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mb-0.5" />
                <span className="text-[8px] font-bold uppercase">SKILL</span>
              </>
            )}
          </button>

          {/* DEDICATED INTERACT / USE BUTTON (CHEST, SHOP, STATUE, PORTAL, WEAPONS) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onInteract?.();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              onInteract?.();
            }}
            className={`h-12 px-3 flex items-center gap-1.5 border-2 shadow-[3px_3px_0px_#000] cursor-pointer transition-all active:scale-95 ${
              canInteract
                ? 'bg-[#f59e0b] border-[#fde047] text-[#0c0c16] shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse'
                : 'bg-[#1a1a2e] border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#0c0c16]'
            }`}
            title="Interact / Pick Up / Use [E / Space]"
          >
            <Hand className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-wider uppercase">
              {canInteract ? interactLabel : 'USE'}
            </span>
          </button>
        </div>

        {/* MAIN FIRE BUTTON */}
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onFireChange(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onFireChange(false);
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            onFireChange(false);
          }}
          onMouseDown={() => onFireChange(true)}
          onMouseUp={() => onFireChange(false)}
          className="w-20 h-16 sm:w-24 sm:h-20 bg-[#ff3e3e] active:scale-95 active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#ff3e3e] shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center text-[#0c0c16] hover:bg-[#ff5555] cursor-pointer transition-all"
          title="Shoot / Attack"
        >
          <Flame className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
            ATTACK
          </span>
        </button>
      </div>
    </div>
  );
};
