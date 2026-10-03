import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  depth: number; // 0 to 1 (0 = far, 1 = extreme foreground)
  life: number;
  maxLife: number;
}

interface AtmosphericParticlesProps {
  progress: number;
  mouseOffset: { x: number; y: number };
  isReducedMotion: boolean;
}

export const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({
  progress,
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

    // Generate particles
    const particleCount = isReducedMotion ? 25 : 90;
    const particles: Particle[] = [];

    const getParticlePalette = (prog: number) => {
      if (prog < 0.25) {
        // Prehistoric: warm orange sparks & white mist
        return ['rgba(245, 158, 11, ', 'rgba(251, 191, 36, ', 'rgba(217, 119, 6, ', 'rgba(255, 237, 213, '];
      } else if (prog < 0.5) {
        // Ancient: golden dust, warm yellow motes
        return ['rgba(234, 179, 8, ', 'rgba(250, 204, 21, ', 'rgba(217, 119, 6, ', 'rgba(254, 240, 138, '];
      } else if (prog < 0.75) {
        // Medieval: amber lantern glow & river mist
        return ['rgba(251, 146, 60, ', 'rgba(56, 189, 248, ', 'rgba(224, 231, 255, ', 'rgba(253, 186, 116, '];
      } else if (prog < 0.88) {
        // Industrial: dark soot flakes & orange embers
        return ['rgba(120, 113, 108, ', 'rgba(234, 88, 12, ', 'rgba(75, 85, 99, ', 'rgba(254, 215, 170, '];
      } else {
        // Space / Cosmic: cyan, ice blue, starlight white
        return ['rgba(255, 255, 255, ', 'rgba(147, 197, 253, ', 'rgba(96, 165, 250, ', 'rgba(191, 219, 254, '];
      }
    };

    const createParticle = (): Particle => {
      const palette = getParticlePalette(progress);
      const colorBase = palette[Math.floor(Math.random() * palette.length)];
      const depth = 0.2 + Math.random() * 0.8;
      const isSpace = progress > 0.85;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: isSpace ? 0.6 + Math.random() * 2.2 * depth : 1.2 + Math.random() * 3.5 * depth,
        speedX: (Math.random() - 0.45) * (0.4 + depth * 0.8),
        speedY: isSpace
          ? (Math.random() - 0.5) * 0.2
          : -0.2 - Math.random() * (0.6 + depth * 0.9), // drift upward like smoke/embers
        opacity: 0.1 + Math.random() * 0.7,
        color: colorBase,
        depth,
        life: 0,
        maxLife: 200 + Math.random() * 300,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const palette = getParticlePalette(progress);
      const isSpace = progress > 0.85;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife || p.y < -20 || p.x < -20 || p.x > width + 20) {
          particles[i] = createParticle();
          continue;
        }

        // Parallax displacement based on mouse and particle depth
        const parallaxX = mouseOffset.x * p.depth * 35;
        const parallaxY = mouseOffset.y * p.depth * 30;

        p.x += p.speedX;
        p.y += p.speedY;

        // Fade in and out
        const lifeRatio = p.life / p.maxLife;
        const currentOpacity =
          p.opacity * Math.sin(lifeRatio * Math.PI) * (isSpace ? 0.9 : 0.75);

        ctx.fillStyle = `${p.color}${currentOpacity})`;
        ctx.beginPath();

        const drawX = p.x + parallaxX;
        const drawY = p.y + parallaxY;

        if (isSpace && Math.random() > 0.98) {
          // Twinkle / glint for space stars
          ctx.arc(drawX, drawY, p.size * 1.6, 0, Math.PI * 2);
        } else {
          ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        }
        ctx.fill();

        // Subtle glow halo for extreme foreground embers/stars
        if (p.depth > 0.75 && !isReducedMotion) {
          ctx.fillStyle = `${p.color}${currentOpacity * 0.25})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, p.size * 2.8, 0, Math.PI * 2);
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
  }, [progress, mouseOffset, isReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
