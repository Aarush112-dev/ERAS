import React, { useEffect, useRef } from 'react';
import { HISTORICAL_SEQUENCES } from '../data/erasData';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  depth: number; // 0.2 (distant atmosphere) to 1.25 (extreme foreground)
  life: number;
  maxLife: number;
}

interface AtmosphericParticlesProps {
  sequenceIndex: number;
  sectionProgress: number;
  mouseOffset: { x: number; y: number };
  isReducedMotion: boolean;
}

export const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({
  sequenceIndex,
  sectionProgress,
  mouseOffset,
  isReducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = isReducedMotion ? 20 : 85;
    const particles: Particle[] = [];

    const getPaletteForType = (type: string): string[] => {
      switch (type) {
        case 'mist':
          return ['rgba(203, 213, 225, ', 'rgba(148, 163, 184, ', 'rgba(241, 245, 249, '];
        case 'embers':
          return ['rgba(245, 158, 11, ', 'rgba(251, 191, 36, ', 'rgba(234, 88, 12, ', 'rgba(254, 243, 199, '];
        case 'pollen':
          return ['rgba(253, 224, 71, ', 'rgba(250, 204, 21, ', 'rgba(254, 249, 195, '];
        case 'dust':
          return ['rgba(234, 179, 8, ', 'rgba(217, 119, 6, ', 'rgba(254, 240, 138, '];
        case 'lanterns':
          return ['rgba(251, 146, 60, ', 'rgba(245, 158, 11, ', 'rgba(254, 215, 170, '];
        case 'sparks':
          return ['rgba(253, 224, 71, ', 'rgba(191, 219, 254, ', 'rgba(251, 191, 36, '];
        case 'smoke':
          return ['rgba(168, 162, 158, ', 'rgba(234, 88, 12, ', 'rgba(120, 113, 108, ', 'rgba(253, 186, 116, '];
        case 'electric':
          return ['rgba(250, 204, 21, ', 'rgba(254, 240, 138, ', 'rgba(125, 211, 252, '];
        case 'data':
          return ['rgba(56, 189, 248, ', 'rgba(14, 165, 233, ', 'rgba(186, 230, 253, '];
        case 'stars':
        default:
          return ['rgba(255, 255, 255, ', 'rgba(191, 219, 254, ', 'rgba(147, 197, 253, '];
      }
    };

    const currentSeq = HISTORICAL_SEQUENCES[sequenceIndex] || HISTORICAL_SEQUENCES[0];
    const pType = currentSeq.atmosphere.particleType;

    const createParticle = (): Particle => {
      const palette = getPaletteForType(pType);
      const colorBase = palette[Math.floor(Math.random() * palette.length)];
      const depth = 0.25 + Math.random() * 1.0; // up to 1.25x foreground parallax
      const isSpace = pType === 'stars';
      const isMist = pType === 'mist' || pType === 'smoke';

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: isSpace
          ? 0.6 + Math.random() * 1.9 * depth
          : isMist
          ? 2.2 + Math.random() * 5.5 * depth
          : 1.0 + Math.random() * 3.0 * depth,
        speedX: (Math.random() - 0.42) * (0.3 + depth * 0.6),
        speedY: isSpace
          ? (Math.random() - 0.5) * 0.12
          : -0.15 - Math.random() * (0.45 + depth * 0.7),
        opacity: 0.12 + Math.random() * 0.65,
        color: colorBase,
        depth,
        life: Math.floor(Math.random() * 120),
        maxLife: 220 + Math.random() * 320,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isSpace = pType === 'stars';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife || p.y < -30 || p.x < -30 || p.x > width + 30) {
          particles[i] = createParticle();
          continue;
        }

        // Depth-scaled parallax from both mouse and vertical section scroll
        const parallaxX = isReducedMotion ? 0 : mouseOffset.x * p.depth * 34;
        const parallaxY = isReducedMotion
          ? 0
          : mouseOffset.y * p.depth * 26 - (sectionProgress - 0.5) * p.depth * 90;

        if (!isReducedMotion) {
          p.x += p.speedX;
          p.y += p.speedY;
        }

        const lifeRatio = p.life / p.maxLife;
        const currentOpacity = p.opacity * Math.sin(lifeRatio * Math.PI) * (isSpace ? 0.92 : 0.72);

        const drawX = (p.x + parallaxX + width) % width;
        const drawY = (p.y + parallaxY + height) % height;

        ctx.fillStyle = `${p.color}${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.depth > 0.85 && !isReducedMotion) {
          ctx.fillStyle = `${p.color}${currentOpacity * 0.22})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, p.size * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [sequenceIndex, sectionProgress, mouseOffset, isReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
