import React, { useRef, useEffect } from 'react';
import { Weapon } from '../types/game';

interface WeaponPreviewCanvasProps {
  weapon: Weapon;
  width?: number;
  height?: number;
  className?: string;
}

export const WeaponPreviewCanvas: React.FC<WeaponPreviewCanvasProps> = ({
  weapon,
  width = 64,
  height = 64,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const t = Date.now() / 1000;
      const floatY = Math.sin(t * 3) * 2;

      ctx.save();
      ctx.translate(cx, cy + floatY);

      // Subtle glow behind weapon
      const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
      glowGrad.addColorStop(0, `${weapon.color}40`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // Shadow below
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 16 - floatY, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.rotate(-0.35 + Math.sin(t * 2) * 0.08);

      ctx.fillStyle = weapon.color;
      ctx.strokeStyle = '#05050d';
      ctx.lineWidth = 2;

      if (weapon.type === 'melee') {
        // Sword blade / katana / axe / hammer
        if (weapon.id.includes('axe')) {
          // Axe handle & head
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-12, -2, 24, 4);
          ctx.fillStyle = weapon.color;
          ctx.beginPath();
          ctx.arc(6, -6, 10, 0, Math.PI);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (weapon.id.includes('hammer')) {
          // Hammer head
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-12, -2, 24, 4);
          ctx.fillStyle = weapon.color;
          ctx.fillRect(4, -10, 12, 20);
          ctx.strokeRect(4, -10, 12, 20);
        } else {
          // Blade
          ctx.beginPath();
          ctx.moveTo(-6, -3);
          ctx.lineTo(18, 0);
          ctx.lineTo(-6, 3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Crossguard
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-8, -6, 3, 12);
          ctx.strokeRect(-8, -6, 3, 12);
          // Grip
          ctx.fillStyle = '#475569';
          ctx.fillRect(-14, -2, 6, 4);
        }
      } else if (weapon.type === 'bow') {
        // Arc bow
        ctx.strokeStyle = weapon.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(4, 0, 14, -Math.PI / 2.5, Math.PI / 2.5);
        ctx.stroke();
        // Bowstring
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(4 + Math.cos(-Math.PI / 2.5) * 14, Math.sin(-Math.PI / 2.5) * 14);
        ctx.lineTo(-4, 0);
        ctx.lineTo(4 + Math.cos(Math.PI / 2.5) * 14, Math.sin(Math.PI / 2.5) * 14);
        ctx.stroke();
        // Arrow
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(16, 0);
        ctx.stroke();
      } else if (weapon.type === 'staff') {
        // Staff rod
        ctx.fillStyle = '#581c87';
        ctx.fillRect(-16, -2, 28, 4);
        ctx.strokeRect(-16, -2, 28, 4);
        // Crystal gem head
        ctx.fillStyle = weapon.color;
        ctx.beginPath();
        ctx.arc(12, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (weapon.type === 'laser') {
        // Futuristic energy laser rifle
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-12, -4, 24, 8);
        ctx.strokeRect(-12, -4, 24, 8);
        ctx.fillStyle = weapon.color;
        ctx.fillRect(-4, -2, 18, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-10, -1, 4, 3);
      } else if (weapon.type === 'launcher') {
        // Heavy rocket / missile launcher
        ctx.fillStyle = '#334155';
        ctx.fillRect(-14, -6, 26, 12);
        ctx.strokeRect(-14, -6, 26, 12);
        ctx.fillStyle = weapon.color;
        ctx.fillRect(8, -4, 6, 8);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-12, -3, 6, 6);
      } else if (weapon.type === 'shotgun') {
        // Multi-barrel shotgun
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, -5, 20, 10);
        ctx.strokeRect(-10, -5, 20, 10);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(2, -4, 12, 3);
        ctx.fillRect(2, 1, 12, 3);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-14, -3, 6, 7);
      } else {
        // Handgun / Rifle
        ctx.fillStyle = weapon.color;
        ctx.fillRect(-8, -4, 18, 7);
        ctx.strokeRect(-8, -4, 18, 7);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, 0, 6, 7);
        ctx.strokeRect(-12, 0, 6, 7);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [weapon]);

  return <canvas ref={canvasRef} width={width} height={height} className={`block ${className}`} />;
};
