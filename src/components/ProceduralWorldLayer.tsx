import React, { useEffect, useRef } from 'react';
import { HISTORICAL_SEQUENCES } from '../data/erasData';

interface ProceduralWorldLayerProps {
  sequenceIndex: number;
  sectionProgress: number; // 0.0 to 1.0 deterministic within active section
  mouseOffset: { x: number; y: number };
  isReducedMotion: boolean;
}

export const ProceduralWorldLayer: React.FC<ProceduralWorldLayerProps> = ({
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

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += isReducedMotion ? 0 : 0.018;
      ctx.clearRect(0, 0, width, height);

      const seq = HISTORICAL_SEQUENCES[sequenceIndex] || HISTORICAL_SEQUENCES[0];
      const s = sectionProgress;

      // Multi-depth parallax offsets
      const pxFar = isReducedMotion ? 0 : mouseOffset.x * 12;
      const pyFar = isReducedMotion ? 0 : mouseOffset.y * 8 - (s - 0.5) * 24;

      const pxMid = isReducedMotion ? 0 : mouseOffset.x * 28;
      const pyMid = isReducedMotion ? 0 : mouseOffset.y * 18 - (s - 0.5) * 58;

      const pxFore = isReducedMotion ? 0 : mouseOffset.x * 52;
      const pyFore = isReducedMotion ? 0 : mouseOffset.y * 34 - (s - 0.5) * 112;

      const anchorX = (seq.exitAnchorPoint.x / 100) * width;
      const anchorY = (seq.exitAnchorPoint.y / 100) * height;

      // =========================================================================
      // LAYER 2: ATMOSPHERIC LIGHT SCATTERING & VOLUMETRIC BEAMS (22% Parallax)
      // =========================================================================
      ctx.save();
      ctx.translate(pxFar, pyFar);

      const rayBell = Math.sin(s * Math.PI);
      if (rayBell > 0.01) {
        const grad = ctx.createRadialGradient(
          anchorX,
          anchorY * 0.65,
          10,
          anchorX,
          anchorY * 0.65,
          Math.max(width, height) * 0.78
        );
        grad.addColorStop(0, seq.atmosphere.lightRayColor);
        grad.addColorStop(0.55, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.fillRect(-120, -120, width + 240, height + 240);
      }

      // Drifting Atmospheric Mist / Coal Haze Bands
      if (seq.atmosphere.fogDensity > 0.28) {
        for (let b = 0; b < 3; b++) {
          const bandY = height * (0.36 + b * 0.14) + Math.sin(s * 3.2 + b) * 20;
          const bandX = (s * 140 * (b % 2 === 0 ? 1 : -1) + b * 180) % (width * 0.35);
          const mistGrad = ctx.createLinearGradient(0, bandY - 55, 0, bandY + 55);
          mistGrad.addColorStop(0, 'rgba(0,0,0,0)');
          mistGrad.addColorStop(0.5, seq.atmosphere.fogColor);
          mistGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = mistGrad;
          ctx.globalAlpha = seq.atmosphere.fogDensity * (0.85 - s * 0.25);
          ctx.fillRect(bandX - 240, bandY - 55, width + 480, 110);
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // =========================================================================
      // LAYER 5: EDITORIAL MATCH-CUT & HISTORICAL SUBJECT LIGHTING (72% Parallax)
      // =========================================================================
      ctx.save();
      ctx.translate(pxMid, pyMid);

      // 1. Flame-to-Kiln & Kiln-to-Brazier Match Cut Glow (Sequences 1, 2, 3, 4)
      if (
        seq.transitionMechanism === 'flame-to-kiln-match' ||
        seq.transitionMechanism === 'kiln-to-brazier-match'
      ) {
        const flameIntensity = Math.pow(Math.sin(s * Math.PI), 1.2);
        const flicker = 1 + Math.sin(time * 4.5) * 0.06;
        const radius = (90 + flameIntensity * 260) * flicker;

        const flameGrad = ctx.createRadialGradient(anchorX, anchorY, 4, anchorX, anchorY, radius);
        flameGrad.addColorStop(0, `rgba(254, 243, 199, ${0.72 * flameIntensity})`);
        flameGrad.addColorStop(0.28, `rgba(249, 115, 22, ${0.46 * flameIntensity})`);
        flameGrad.addColorStop(0.65, `rgba(180, 83, 9, ${0.18 * flameIntensity})`);
        flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(anchorX, anchorY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Astrolabe-to-Flywheel Circular Geometric Shape Match (Sequence 9 & 10)
      if (seq.transitionMechanism === 'astrolabe-to-flywheel-shape') {
        const wheelBell = Math.sin(s * Math.PI);
        if (wheelBell > 0.05) {
          const cx = ((seq.exitAnchorPoint.x * (1 - s) + seq.entryAnchorPoint.x * s) / 100) * width;
          const cy = ((seq.exitAnchorPoint.y * (1 - s) + seq.entryAnchorPoint.y * s) / 100) * height;
          const ringRadius = Math.min(width, height) * (0.22 + wheelBell * 0.16);

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(s * Math.PI * 0.45);

          // Subtle brass-to-iron optical ring alignment
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.24 * wheelBell})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = `rgba(251, 191, 36, ${0.14 * wheelBell})`;
          ctx.beginPath();
          ctx.arc(0, 0, ringRadius * 0.78, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }
      }

      // 3. Silk Road & Medieval Caravan / Bridge Lanterns (Sequences 6, 7, 8)
      if (sequenceIndex >= 6 && sequenceIndex <= 8) {
        const lanternCount = 16;
        for (let i = 0; i < lanternCount; i++) {
          const threshold = (i / lanternCount) * 0.78;
          const act = Math.max(0, Math.min(1, (s - threshold) / 0.14));
          if (act > 0) {
            const t = i / (lanternCount - 1);
            const lx = (0.22 + t * 0.56 + Math.sin(t * Math.PI * 2) * 0.06) * width;
            const ly = (0.48 + t * 0.28) * height;
            const pulse = 1 + Math.sin(time * 2.4 + i) * 0.07;
            const g = ctx.createRadialGradient(lx, ly, 1, lx, ly, 18 * act * pulse);
            g.addColorStop(0, `rgba(254, 243, 199, ${0.75 * act})`);
            g.addColorStop(0.4, `rgba(245, 158, 11, ${0.38 * act})`);
            g.addColorStop(1, 'rgba(245, 158, 11, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(lx, ly, 18 * act * pulse, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4. Industrial Steam Locomotive Viaduct Plume & Blast Furnace Glow (Sequence 10)
      if (sequenceIndex === 10) {
        const furnaceX = 0.66 * width;
        const furnaceY = 0.45 * height;
        const furnacePulse = 0.7 + Math.sin(time * 3.2) * 0.15;
        const fg = ctx.createRadialGradient(furnaceX, furnaceY, 4, furnaceX, furnaceY, 110 * furnacePulse);
        fg.addColorStop(0, 'rgba(254, 215, 170, 0.55)');
        fg.addColorStop(0.4, 'rgba(234, 88, 12, 0.3)');
        fg.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(furnaceX, furnaceY, 110 * furnacePulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // =========================================================================
      // LAYER 6: FOREGROUND ARCHITECTURAL SHADOW & DEPTH FRAMING (112% Parallax)
      // Moves faster than the midground to accentuate foreground-to-background separation
      // =========================================================================
      ctx.save();
      ctx.translate(pxFore, pyFore);

      const fgLeft = ctx.createRadialGradient(0, height * 0.85, 10, 0, height * 0.85, width * 0.35);
      fgLeft.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      fgLeft.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fgLeft;
      ctx.fillRect(-120, height * 0.4, width * 0.48, height * 0.75);

      const fgRight = ctx.createRadialGradient(
        width,
        height * 0.85,
        10,
        width,
        height * 0.85,
        width * 0.35
      );
      fgRight.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      fgRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fgRight;
      ctx.fillRect(width * 0.52, height * 0.4, width * 0.6, height * 0.75);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [sequenceIndex, sectionProgress, mouseOffset, isReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-15 w-full h-full"
    />
  );
};
