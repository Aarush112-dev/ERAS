import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ERAS_DATA } from '../data/erasData';

interface HistoricalCanvasProps {
  progress: number; // 0.0 to 1.0
  mouseOffset: { x: number; y: number };
  isReducedMotion: boolean;
  lensActive: boolean;
  lensPosition: { x: number; y: number };
  showAnchorReticle?: boolean;
}

export const HistoricalCanvas: React.FC<HistoricalCanvasProps> = ({
  progress,
  mouseOffset,
  isReducedMotion,
  lensActive,
  lensPosition,
  showAnchorReticle = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(ERAS_DATA.length).fill(false));

  // Preload all 5 master images
  useEffect(() => {
    ERAS_DATA.forEach((era, idx) => {
      const img = new Image();
      img.src = era.imageSrc;
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        setImagesLoaded((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      };
      img.onerror = () => {
        setImagesLoaded((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      };
    });
  }, []);

  // Compute active eras and transition timing
  const { currentEraIndex, nextEraIndex, localProgress, isTransitioning } = useMemo(() => {
    const totalTransitions = ERAS_DATA.length - 1;
    const rawVal = progress * totalTransitions;
    const curr = Math.min(totalTransitions, Math.floor(rawVal));
    const next = Math.min(totalTransitions, curr + 1);
    const local = rawVal - curr;
    return {
      currentEraIndex: curr,
      nextEraIndex: next,
      localProgress: Math.max(0, Math.min(1, local)),
      isTransitioning: curr !== next && local > 0.01 && local < 0.99,
    };
  }, [progress]);

  const currEra = ERAS_DATA[currentEraIndex];
  const nextEra = ERAS_DATA[nextEraIndex];

  // =========================================================================
  // ZOOM-TO-TRANSITION CAMERA CHOREOGRAPHY
  // Curve:
  // 0.0 -> 0.25: Base scale + subtle establishing drift
  // 0.25 -> 0.50: Push-in to transition anchor (scale up to 1.35-1.45x)
  // 0.50: Peak close-up on anchor; image morph threshold
  // 0.50 -> 0.80: Pull back revealing transformed world
  // 0.80 -> 1.00: Settle into new era
  // =========================================================================
  const zoomFactor = useMemo(() => {
    if (isReducedMotion) return 1.02;

    // Special behavior for final cosmic pull-back (Stage 4)
    if (currentEraIndex === 3 && nextEraIndex === 4 && localProgress > 0.6) {
      // Pulling back out into space
      return 1.45 - (localProgress - 0.6) * 1.1; // Pull back to ~1.0
    }
    if (currentEraIndex === 4) {
      // Deep space pull back as progress approaches 1.0
      return 1.05 - (progress - 0.85) * 0.4;
    }

    // Bell curve for zoom push-in / pull-back
    // Peak at localProgress = 0.5
    const bell = Math.sin(localProgress * Math.PI);
    const baseScale = currEra.cameraProfile.baseScale;
    const targetScale = currEra.cameraProfile.anchorZoomScale;
    return baseScale + (targetScale - baseScale) * Math.pow(bell, 1.4);
  }, [localProgress, currentEraIndex, nextEraIndex, currEra, progress, isReducedMotion]);

  // Focus point translation towards the transition anchor
  const focusTranslation = useMemo(() => {
    if (isReducedMotion) return { x: 0, y: 0 };

    const anchor = currEra.transitionBridge.focusPoint;
    // Map normalized anchor (0-100%) to pixel offset centered at screen
    // As camera zooms in, shift center toward the anchor
    const bell = Math.sin(localProgress * Math.PI);
    const offsetX = (50 - anchor.x) * 3.5 * Math.pow(bell, 1.2);
    const offsetY = (50 - anchor.y) * 2.8 * Math.pow(bell, 1.2);

    const driftX = currEra.cameraProfile.driftX + (nextEra.cameraProfile.driftX - currEra.cameraProfile.driftX) * localProgress;
    const driftY = currEra.cameraProfile.driftY + (nextEra.cameraProfile.driftY - currEra.cameraProfile.driftY) * localProgress;

    return {
      x: driftX + offsetX,
      y: driftY + offsetY,
    };
  }, [localProgress, currEra, nextEra, isReducedMotion]);

  // Mouse tilt damping
  const tiltFactor = isReducedMotion ? 0 : 1;
  const mouseTiltX = mouseOffset.x * 24 * tiltFactor;
  const mouseTiltY = mouseOffset.y * 18 * tiltFactor;
  const mouseRotY = mouseOffset.x * 2.2 * tiltFactor;
  const mouseRotX = -mouseOffset.y * 1.8 * tiltFactor;

  // =========================================================================
  // PROGRESSIVE COMPONENT-BY-COMPONENT SPATIAL REVEAL
  // =========================================================================
  // Component 1: Sky & Atmosphere (0.10 to 0.45)
  const skyFade = Math.max(0, Math.min(1, (localProgress - 0.1) / 0.35));
  // Component 2: Terrain & Riverbed (0.25 to 0.65)
  const terrainProgress = Math.max(0, Math.min(1, (localProgress - 0.25) / 0.4));
  // Component 3: Architecture & Bridges (0.40 to 0.85) - grows upward
  const archProgress = Math.max(0, Math.min(1, (localProgress - 0.4) / 0.45));
  // Component 4: Lighting & Glow (0.50 to 1.0)
  const lightProgress = Math.max(0, Math.min(1, (localProgress - 0.5) / 0.5));

  // Spatial mask: Radial expansion anchored at the transition bridge focus point
  const anchor = currEra.transitionBridge.focusPoint;
  const maskRadius = Math.max(0, localProgress * 150);
  const radialRevealMask = `radial-gradient(circle at ${anchor.x}% ${anchor.y}%, rgba(0,0,0,1) ${maskRadius - 30}%, rgba(0,0,0,0) ${maskRadius + 30}%)`;

  // Upward foundation growth mask for architecture
  const verticalArchMask = `linear-gradient(to top, rgba(0,0,0,1) ${archProgress * 130 - 25}%, rgba(0,0,0,0) ${archProgress * 130 + 15}%)`;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black select-none perspective-[1200px]"
    >
      {/* Main 3D Canvas Transform Container */}
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `scale(${zoomFactor}) translate3d(${focusTranslation.x + mouseTiltX}px, ${
            focusTranslation.y + mouseTiltY
          }px, 0) rotateX(${mouseRotX}deg) rotateY(${mouseRotY}deg)`,
          transformOrigin: `${anchor.x}% ${anchor.y}%`,
        }}
      >
        {/* =========================================================================
            LAYER 1: DEEP BACKGROUND (Distant Mountain Silhouette & Horizon Sky)
            Parallax factor: 0.15
        ========================================================================= */}
        <div
          className="absolute -inset-16 transition-transform duration-100 ease-out will-change-transform pointer-events-none"
          style={{
            transform: `translate3d(${mouseTiltX * 0.15}px, ${mouseTiltY * 0.12}px, 0)`,
          }}
        >
          {/* Base Sky */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-[0.6px]"
            style={{
              backgroundImage: `url(${currEra.imageSrc})`,
              transform: 'scale(1.06)',
              opacity: 1 - skyFade * 0.8,
            }}
          />
          {/* Incoming Sky */}
          {currentEraIndex !== nextEraIndex && (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-[0.6px]"
              style={{
                backgroundImage: `url(${nextEra.imageSrc})`,
                transform: 'scale(1.06)',
                opacity: skyFade,
              }}
            />
          )}
        </div>

        {/* =========================================================================
            LAYER 2 & 3: MIDGROUND & ARCHITECTURAL LANDSCAPE
            Parallax factor: 0.55
        ========================================================================= */}
        <div
          className="absolute -inset-8 transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `translate3d(${mouseTiltX * 0.55}px, ${mouseTiltY * 0.45}px, 0)`,
          }}
        >
          {/* Current Era Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-300"
            style={{
              backgroundImage: `url(${currEra.imageSrc})`,
              opacity: 1 - terrainProgress * 0.9,
              filter: `brightness(${1 - localProgress * 0.12}) contrast(${1 + localProgress * 0.05})`,
            }}
          />

          {/* Incoming Era with Dual Spatial Masking (Radial from anchor + Upward foundation reveal) */}
          {currentEraIndex !== nextEraIndex && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${nextEra.imageSrc})`,
                maskImage: `${radialRevealMask}, ${verticalArchMask}`,
                WebkitMaskImage: `${radialRevealMask}, ${verticalArchMask}`,
                maskComposite: 'add',
                WebkitMaskComposite: 'source-over',
                opacity: Math.max(localProgress, archProgress),
                filter: `brightness(${0.88 + localProgress * 0.18})`,
              }}
            />
          )}
        </div>

        {/* =========================================================================
            LAYER 4: FOREGROUND (Riverbanks, Hearth Embers, Quays, Iron Bridges)
            Parallax factor: 1.05
        ========================================================================= */}
        <div
          className="absolute -inset-6 transition-transform duration-75 ease-out will-change-transform pointer-events-none"
          style={{
            transform: `translate3d(${mouseTiltX * 1.05}px, ${mouseTiltY * 0.95}px, 0)`,
          }}
        >
          {/* Specular Lighting & Ambient Ground Reflectance */}
          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-700"
            style={{
              background: `radial-gradient(circle at ${anchor.x}% ${anchor.y}%, ${currEra.palette.glow}26 0%, transparent 60%)`,
              opacity: 0.4 + lightProgress * 0.4,
            }}
          />
        </div>

        {/* =========================================================================
            TRANSITION ANCHOR VISUAL RETICLE (Visible when zooming or requested)
        ========================================================================= */}
        {showAnchorReticle && isTransitioning && (
          <div
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              left: `${anchor.x}%`,
              top: `${anchor.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: Math.sin(localProgress * Math.PI) * 0.85,
            }}
          >
            {/* Minimal optical target ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div
                className="w-12 h-12 rounded-full border border-amber-400/60 animate-ping opacity-30"
                style={{ animationDuration: '2s' }}
              />
              <div className="absolute w-6 h-6 rounded-full border border-amber-300/80 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
              <div className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <div className="absolute -bottom-6 whitespace-nowrap text-[9px] tracking-widest uppercase font-mono text-amber-200/90 px-2 py-0.5 bg-black/70 backdrop-blur-xs rounded border border-amber-500/20">
                TRANSITION ANCHOR
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            LAYER 5: EXTREME FOREGROUND (Atmosphere, Vignette & Deep Space Glow)
        ========================================================================= */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Deep Cinematic Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.88)_100%)]" />

          {/* Color temperature grade */}
          <div
            className="absolute inset-0 mix-blend-color pointer-events-none transition-colors duration-1000"
            style={{
              backgroundColor: currEra.palette.primary,
              opacity: 0.04,
            }}
          />

          {/* Planetary Rim Glow for Space Era */}
          {progress > 0.72 && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-700"
              style={{
                opacity: Math.max(0, (progress - 0.72) / 0.28),
                background:
                  'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(59,130,246,0.18) 0%, rgba(14,165,233,0.06) 55%, transparent 80%)',
                mixBlendMode: 'screen',
              }}
            />
          )}
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE MACRO/MICRO DETAIL INSPECTION LENS
      ========================================================================= */}
      {lensActive && (
        <div
          className="absolute pointer-events-none z-30 rounded-full border border-amber-400/80 shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_25px_rgba(245,158,11,0.35)] overflow-hidden"
          style={{
            width: 250,
            height: 250,
            left: lensPosition.x - 125,
            top: lensPosition.y - 125,
            backdropFilter: 'contrast(120%) saturate(125%)',
          }}
        >
          <div
            className="absolute w-[100vw] h-[100vh] bg-cover bg-center"
            style={{
              backgroundImage: `url(${currEra.imageSrc})`,
              transform: `scale(${zoomFactor * 2.8})`,
              transformOrigin: `${lensPosition.x}px ${lensPosition.y}px`,
              opacity: 1 - localProgress,
            }}
          />
          {currentEraIndex !== nextEraIndex && (
            <div
              className="absolute w-[100vw] h-[100vh] bg-cover bg-center"
              style={{
                backgroundImage: `url(${nextEra.imageSrc})`,
                transform: `scale(${zoomFactor * 2.8})`,
                transformOrigin: `${lensPosition.x}px ${lensPosition.y}px`,
                opacity: localProgress,
              }}
            />
          )}

          {/* Optical Reticle */}
          <div className="absolute inset-0 border border-white/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border border-white/40 rounded-full" />
            <div className="absolute w-full h-[1px] bg-white/25" />
            <div className="absolute h-full w-[1px] bg-white/25" />
            <span className="absolute bottom-3 text-[9px] tracking-widest text-amber-200/90 font-mono uppercase bg-black/60 px-1.5 py-0.5 rounded">
              2.8× RESOLUTION
            </span>
          </div>
        </div>
      )}

      {/* Initial loading veil */}
      {!imagesLoaded[0] && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-t border-amber-500/80 animate-spin" />
            <span className="font-cinzel text-xs tracking-[0.3em] text-neutral-400 uppercase">
              Materializing Epochs
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
