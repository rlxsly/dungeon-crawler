import React, { useRef, useState, useEffect } from 'react';
import { Vector2D } from '../types/game';
import { Sparkles, Repeat, Target, Flame } from 'lucide-react';

interface TouchControlsProps {
  onMove: (vec: Vector2D) => void;
  onFireChange: (isFiring: boolean) => void;
  onSkill: () => void;
  onSwitchWeapon: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onFireChange,
  onSkill,
  onSwitchWeapon,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [stickPos, setStickPos] = useState<Vector2D>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
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
    <div className="absolute inset-0 pointer-events-none z-20 select-none flex justify-between items-end p-4 sm:p-8 font-mono">
      {/* JOYSTICK (BOTTOM LEFT) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-32 h-32 bg-[#1a1a2e]/80 border-2 border-[#252545] shadow-[4px_4px_0px_#000] pointer-events-auto flex items-center justify-center relative touch-none opacity-80 hover:opacity-100 transition-opacity"
      >
        <div
          className="w-12 h-12 bg-[#3effc3] border-2 border-[#0c0c16] shadow-[2px_2px_0px_#000] transition-transform duration-75"
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          }}
        />
      </div>

      {/* ACTION BUTTONS (BOTTOM RIGHT) */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5">
          {/* WEAPON SWITCH BUTTON */}
          <button
            onClick={onSwitchWeapon}
            className="w-12 h-12 bg-[#1a1a2e] border-2 border-[#252545] text-[#ffd700] hover:border-[#ffd700] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center shadow-[3px_3px_0px_#000] cursor-pointer transition-all"
            title="Switch Weapon"
          >
            <Repeat className="w-5 h-5" />
          </button>

          {/* SKILL BUTTON */}
          <button
            onClick={onSkill}
            className="w-14 h-14 bg-[#1a1a2e] border-2 border-[#3e93ff] text-[#3e93ff] hover:bg-[#3e93ff] hover:text-[#0c0c16] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center shadow-[3px_3px_0px_#000] cursor-pointer transition-all"
            title="Skill"
          >
            <Sparkles className="w-6 h-6" />
          </button>
        </div>

        {/* MAIN FIRE BUTTON */}
        <button
          onTouchStart={() => onFireChange(true)}
          onTouchEnd={() => onFireChange(false)}
          onMouseDown={() => onFireChange(true)}
          onMouseUp={() => onFireChange(false)}
          className="w-20 h-20 bg-[#ff3e3e] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#ff3e3e] shadow-[4px_4px_0px_#000] flex items-center justify-center text-[#0c0c16] hover:bg-[#ff5555] cursor-pointer transition-all"
          title="Shoot / Attack"
        >
          <Flame className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
