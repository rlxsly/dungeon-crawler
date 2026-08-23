import React, { useRef, useEffect } from 'react';
import { HeroClass, Pet, Enemy } from '../types/game';
import { drawHeroSprite, drawPetSprite, drawEnemySprite } from '../utils/spriteRenderer';

interface HeroPreviewCanvasProps {
  heroId: HeroClass;
  scale?: number;
  width?: number;
  height?: number;
  className?: string;
}

export const HeroPreviewCanvas: React.FC<HeroPreviewCanvasProps> = ({
  heroId,
  scale = 2.5,
  width = 96,
  height = 96,
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
      const cy = canvas.height / 2 + 8;

      drawHeroSprite(ctx, heroId, cx, cy, 18, {
        facingRight: true,
        scale,
        animTime: Date.now() / 1000,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [heroId, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`block ${className}`}
    />
  );
};

interface PetPreviewCanvasProps {
  pet: Pet;
  scale?: number;
  width?: number;
  height?: number;
  className?: string;
}

export const PetPreviewCanvas: React.FC<PetPreviewCanvasProps> = ({
  pet,
  scale = 2.5,
  width = 96,
  height = 96,
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
      const cy = canvas.height / 2 + 8;

      drawPetSprite(ctx, pet, cx, cy, {
        facingRight: true,
        scale,
        animTime: Date.now() / 1000,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [pet, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`block ${className}`}
    />
  );
};

interface EnemyPreviewCanvasProps {
  enemy: Enemy;
  scale?: number;
  width?: number;
  height?: number;
  className?: string;
}

export const EnemyPreviewCanvas: React.FC<EnemyPreviewCanvasProps> = ({
  enemy,
  scale = 2.0,
  width = 96,
  height = 96,
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
      const cy = canvas.height / 2 + 8;

      const dummyEnemy = { ...enemy, x: cx, y: cy };
      drawEnemySprite(ctx, dummyEnemy, {
        facingRight: true,
        scale,
        animTime: Date.now() / 1000,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [enemy, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`block ${className}`}
    />
  );
};
