import React, { useEffect, useState, useMemo } from 'react';
import { HISTORICAL_SEQUENCES, IMAGES } from '../data/erasData';
import { ForegroundMaskPreset } from '../types/eras';
import { ProceduralWorldLayer } from './ProceduralWorldLayer';

interface HistoricalCanvasProps {
  sequenceIndex: number;
  sectionProgress: number; // 0.0 to 1.0 deterministic within active section
  globalProgress: number; // 0.0 to 1.0 across entire 16,700vh document
  mouseOffset: { x: number; y: number };
  isReducedMotion: boolean;
}

function getForegroundMaskCss(preset: ForegroundMaskPreset): string {
  switch (preset) {
    case 'left-cave-overhang':
      return 'linear-gradient(105deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 28%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0) 54%)';
    case 'right-clay-kiln':
      return 'linear-gradient(255deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 26%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0) 52%)';
    case 'left-stone-colonnade':
      return 'linear-gradient(95deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 26%, rgba(0,0,0,0.3) 38%, rgba(0,0,0,0) 48%)';
    case 'full-stone-archway':
      return 'radial-gradient(ellipse 46% 44% at 50% 58%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.75) 82%, rgba(0,0,0,1) 96%)';
    case 'right-brass-astrolabe':
      return 'radial-gradient(ellipse 52% 62% at 72% 58%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.88) 44%, rgba(0,0,0,0) 72%)';
    case 'center-iron-flywheel':
      return 'linear-gradient(110deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 26%, rgba(0,0,0,0.25) 48%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,1) 100%)';
    case 'left-pillars-right-cables':
      return 'radial-gradient(ellipse 44% 52% at 54% 56%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.75) 78%, rgba(0,0,0,1) 96%)';
    case 'circular-orbital-viewport':
      return 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.82) 72%, rgba(0,0,0,1) 88%)';
    case 'bottom-riverbank-terrace':
    default:
      return 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0) 44%)';
  }
}

export const HistoricalCanvas: React.FC<HistoricalCanvasProps> = ({
  sequenceIndex,
  sectionProgress,
  globalProgress,
  mouseOffset,
  isReducedMotion,
}) => {
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});

  // Preload all master historical compositions
  useEffect(() => {
    const allUrls = Object.values(IMAGES);
    allUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        setLoadedMap((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
      };
      img.onerror = () => {
        setLoadedMap((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
      };
    });
  }, []);

  const seq = HISTORICAL_SEQUENCES[sequenceIndex] || HISTORICAL_SEQUENCES[0];
  const s = Math.max(0, Math.min(1, sectionProgress));

  const smoothstep = (min: number, max: number, value: number) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  };

  // =========================================================================
  // STAGGERED MULTI-LAYER REVEAL PROGRESSION WITHIN EACH SECTION
  // =========================================================================
  const subStages = useMemo(() => {
    const skyReveal = smoothstep(0.12, 0.52, s);
    const distantEnvReveal = smoothstep(0.22, 0.64, s);
    const midgroundReveal = smoothstep(0.32, 0.78, s);
    const mainSubjectReveal = smoothstep(0.42, 0.86, s);
    const foregroundReveal = smoothstep(0.54, 0.94, s);
    const secondaryReveal = seq.secondaryImageSrc ? smoothstep(0.72, 0.98, s) : 0;

    return {
      skyReveal,
      distantEnvReveal,
      midgroundReveal,
      mainSubjectReveal,
      foregroundReveal,
      secondaryReveal,
    };
  }, [s, seq.secondaryImageSrc]);

  // =========================================================================
  // 4-STAGE EDITORIAL VIRTUAL CAMERA CHOREOGRAPHY
  // Entry (0.00) -> Mid Composition (0.32) -> Anchor Peak Match-Cut (0.68) -> Exit (1.00)
  // =========================================================================
  const cameraState = useMemo(() => {
    if (isReducedMotion) {
      return { scale: 1.02, x: 0, y: 0, rotate: 0 };
    }

    const p1 = 0.32;
    const p2 = 0.68;

    if (s <= p1) {
      const t = smoothstep(0, p1, s);
      return {
        scale: seq.cameraEntry.scale + (seq.cameraMid.scale - seq.cameraEntry.scale) * t,
        x: seq.cameraEntry.x + (seq.cameraMid.x - seq.cameraEntry.x) * t,
        y: seq.cameraEntry.y + (seq.cameraMid.y - seq.cameraEntry.y) * t,
        rotate: seq.cameraEntry.rotate + (seq.cameraMid.rotate - seq.cameraEntry.rotate) * t,
      };
    } else if (s <= p2) {
      const t = smoothstep(p1, p2, s);
      return {
        scale: seq.cameraMid.scale + (seq.cameraAnchorPeak.scale - seq.cameraMid.scale) * t,
        x: seq.cameraMid.x + (seq.cameraAnchorPeak.x - seq.cameraMid.x) * t,
        y: seq.cameraMid.y + (seq.cameraAnchorPeak.y - seq.cameraMid.y) * t,
        rotate: seq.cameraMid.rotate + (seq.cameraAnchorPeak.rotate - seq.cameraMid.rotate) * t,
      };
    } else {
      const t = smoothstep(p2, 1.0, s);
      return {
        scale: seq.cameraAnchorPeak.scale + (seq.cameraExit.scale - seq.cameraAnchorPeak.scale) * t,
        x: seq.cameraAnchorPeak.x + (seq.cameraExit.x - seq.cameraAnchorPeak.x) * t,
        y: seq.cameraAnchorPeak.y + (seq.cameraExit.y - seq.cameraAnchorPeak.y) * t,
        rotate:
          seq.cameraAnchorPeak.rotate + (seq.cameraExit.rotate - seq.cameraAnchorPeak.rotate) * t,
      };
    }
  }, [s, seq, isReducedMotion]);

  // =========================================================================
  // 6 INDEPENDENT PARALLAX DEPTH PLANES (Section 5)
  // =========================================================================
  const parallax = useMemo(() => {
    if (isReducedMotion) {
      return {
        deepBg: { x: 0, y: 0, scale: 1.04 },
        distantEnv: { x: 0, y: 0, scale: 1.05 },
        midground: { x: 0, y: 0, scale: 1.06 },
        mainSubject: { x: 0, y: 0, scale: 1.07 },
        foregroundFrame: { x: 0, y: 0, scale: 1.12 },
      };
    }

    const scrollDelta = s - 0.5;
    const mx = mouseOffset.x;
    const my = mouseOffset.y;

    return {
      // 1. Deep background: sky, stars, far mountains (8–14% speed)
      deepBg: {
        x: mx * 5 - scrollDelta * 8,
        y: my * 4 - scrollDelta * 16,
        scale: 1.05,
      },
      // 3. Distant environment: settlements, skylines, hills (28–36% speed)
      distantEnv: {
        x: mx * 13 + scrollDelta * 12,
        y: my * 9 - scrollDelta * 36,
        scale: 1.06,
      },
      // 4. Midground: buildings, river, bridges, vessels (50–62% speed)
      midground: {
        x: mx * 24 - scrollDelta * 18,
        y: my * 16 - scrollDelta * 62,
        scale: 1.08,
      },
      // 5. Main subjects: focal flames, wheels, astrolabes (72–82% speed)
      mainSubject: {
        x: mx * 34 + scrollDelta * 24,
        y: my * 22 - scrollDelta * 84,
        scale: 1.1,
      },
      // 6. Foreground architectural & material frame (108–124% speed)
      foregroundFrame: {
        x: mx * 52 - scrollDelta * 38,
        y: my * 36 - scrollDelta * 122,
        scale: 1.15,
      },
    };
  }, [s, mouseOffset, isReducedMotion]);

  // =========================================================================
  // BESPOKE EDITORIAL TRANSITION & LAYER MASKS
  // =========================================================================
  const spatialMasks = useMemo(() => {
    // Interpolate anchor focus point between exitAnchorPoint and entryAnchorPoint
    const ax = seq.exitAnchorPoint.x * (1 - s) + seq.entryAnchorPoint.x * s;
    const ay = seq.exitAnchorPoint.y * (1 - s) + seq.entryAnchorPoint.y * s;

    const skyClipMask =
      'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 26%, rgba(0,0,0,0) 50%)';
    const distantBandMask =
      'linear-gradient(to bottom, rgba(0,0,0,0) 12%, rgba(0,0,0,1) 28%, rgba(0,0,0,1) 54%, rgba(0,0,0,0) 70%)';

    const baseForegroundMask = getForegroundMaskCss(seq.foregroundMask);
    const targetForegroundMask = getForegroundMaskCss(seq.targetForegroundMask);

    const r = subStages.mainSubjectReveal * 148;
    let targetRevealMask = '';

    switch (seq.maskStyle) {
      case 'flame-radial-bloom':
        // Expands organically from the glowing flame/kiln/brazier center
        targetRevealMask = `radial-gradient(circle at ${ax}% ${ay}%, rgba(0,0,0,1) ${Math.max(
          0,
          r - 38
        )}%, rgba(0,0,0,0.65) ${r}%, rgba(0,0,0,0) ${r + 36}%)`;
        break;
      case 'portal-aperture-expand':
        // Opens outward through the archway / flywheel aperture
        targetRevealMask = `radial-gradient(ellipse 95% 110% at ${ax}% ${ay}%, rgba(0,0,0,1) ${Math.max(
          0,
          r - 30
        )}%, rgba(0,0,0,0.5) ${r}%, rgba(0,0,0,0) ${r + 28}%)`;
        break;
      case 'circular-wheel-iris':
        // Precision circular geometric match-cut for astrolabe -> flywheel & orbital viewport
        targetRevealMask = `radial-gradient(circle at ${ax}% ${ay}%, rgba(0,0,0,1) ${Math.max(
          0,
          r - 22
        )}%, rgba(0,0,0,0.75) ${r}%, rgba(0,0,0,0) ${r + 20}%)`;
        break;
      case 'architectural-wipe':
        targetRevealMask = `linear-gradient(102deg, rgba(0,0,0,1) ${
          subStages.midgroundReveal * 135 - 28
        }%, rgba(0,0,0,0.55) ${subStages.midgroundReveal * 135}%, rgba(0,0,0,0) ${
          subStages.midgroundReveal * 135 + 26
        }%)`;
        break;
      case 'foundation-rise':
        targetRevealMask = `linear-gradient(to top, rgba(0,0,0,1) ${
          subStages.mainSubjectReveal * 132 - 26
        }%, rgba(0,0,0,0.6) ${subStages.mainSubjectReveal * 132}%, rgba(0,0,0,0) ${
          subStages.mainSubjectReveal * 132 + 24
        }%)`;
        break;
      case 'valley-sweep':
        targetRevealMask = `linear-gradient(120deg, rgba(0,0,0,1) ${
          subStages.midgroundReveal * 135 - 30
        }%, rgba(0,0,0,0.5) ${subStages.midgroundReveal * 135}%, rgba(0,0,0,0) ${
          subStages.midgroundReveal * 135 + 28
        }%)`;
        break;
      case 'horizon-part':
      case 'orbital-pullback':
      default:
        targetRevealMask = `radial-gradient(circle at ${ax}% ${ay}%, rgba(0,0,0,1) ${Math.max(
          0,
          r - 30
        )}%, rgba(0,0,0,0) ${r + 34}%)`;
        break;
    }

    return {
      ax,
      ay,
      skyClipMask,
      distantBandMask,
      baseForegroundMask,
      targetForegroundMask,
      targetRevealMask,
    };
  }, [seq, s, subStages]);

  const grade = seq.atmosphere.colorGrade;
  const dynamicFilter = `sepia(${grade.sepia * (1 - s * 0.25)}) contrast(${grade.contrast}) saturate(${
    grade.saturate
  }) brightness(${grade.brightness + Math.sin(s * Math.PI) * 0.05}) hue-rotate(${grade.hueRotate}deg)`;

  const isFirstReady = Boolean(
    loadedMap[IMAGES.wilderness] || loadedMap[IMAGES.editionsPrimordialOchre]
  );

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none transition-colors duration-700"
      style={{ backgroundColor: seq.palette.canvasBg }}
    >
      {/* =========================================================================
          VIRTUAL CAMERA RIG (Continuous vertical-scroll-linked transformation)
      ========================================================================= */}
      <div
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          transform: `scale(${cameraState.scale}) translate3d(${cameraState.x}px, ${cameraState.y}px, 0) rotate(${cameraState.rotate}deg)`,
          transformOrigin: `${spatialMasks.ax}% ${spatialMasks.ay}%`,
          filter: dynamicFilter,
        }}
      >
        {/* =========================================================================
            PLANE 1: DEEP BACKGROUND SKY & CELESTIAL HORIZON (8–14% Parallax)
        ========================================================================= */}
        <div
          className="absolute -inset-24 pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(${parallax.deepBg.x}px, ${parallax.deepBg.y}px, 0) scale(${parallax.deepBg.scale})`,
            maskImage: spatialMasks.skyClipMask,
            WebkitMaskImage: spatialMasks.skyClipMask,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${seq.baseImageSrc})`,
              opacity: 1 - subStages.skyReveal * 0.88,
            }}
          />
          {seq.targetImageSrc !== seq.baseImageSrc && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${seq.targetImageSrc})`,
                opacity: subStages.skyReveal,
              }}
            />
          )}
        </div>

        {/* =========================================================================
            PLANE 3: DISTANT ENVIRONMENT — SKYLINES, RIDGES & MONUMENTS (32% Parallax)
        ========================================================================= */}
        <div
          className="absolute -inset-20 pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(${parallax.distantEnv.x}px, ${parallax.distantEnv.y}px, 0) scale(${parallax.distantEnv.scale})`,
            maskImage: spatialMasks.distantBandMask,
            WebkitMaskImage: spatialMasks.distantBandMask,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${seq.baseImageSrc})`,
              opacity: 1 - subStages.distantEnvReveal * 0.85,
            }}
          />
          {seq.targetImageSrc !== seq.baseImageSrc && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${seq.targetImageSrc})`,
                opacity: subStages.distantEnvReveal,
              }}
            />
          )}
        </div>

        {/* =========================================================================
            PLANE 4 & 5: MIDGROUND & MAIN HISTORICAL SUBJECTS (56% Parallax)
            Spatially masked match-cut, portal, and architectural reveals
        ========================================================================= */}
        <div
          className="absolute -inset-16 pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(${parallax.midground.x}px, ${parallax.midground.y}px, 0) scale(${parallax.midground.scale})`,
          }}
        >
          {/* Base Composition */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${seq.baseImageSrc})`,
            }}
          />

          {/* Target Composition Emerging Through Bespoke Spatial Mask */}
          {seq.targetImageSrc !== seq.baseImageSrc && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${seq.targetImageSrc})`,
                maskImage: spatialMasks.targetRevealMask,
                WebkitMaskImage: spatialMasks.targetRevealMask,
                opacity: Math.min(1, subStages.midgroundReveal * 1.15),
              }}
            />
          )}

          {/* Optional Secondary Bridge Preview for Extended Pacing Continuity */}
          {seq.secondaryImageSrc && subStages.secondaryReveal > 0.01 && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${seq.secondaryImageSrc})`,
                maskImage: spatialMasks.targetRevealMask,
                WebkitMaskImage: spatialMasks.targetRevealMask,
                opacity: subStages.secondaryReveal * 0.48,
              }}
            />
          )}
        </div>

        {/* =========================================================================
            PLANE 6: FOREGROUND FRAMING ELEMENTS (112% Parallax)
            Isolates the basalt cave overhang, earthen clay kiln, carved stone
            colonnade, weathered stone archway, brass astrolabe, cast-iron flywheel,
            suspension bridge cables, and circular orbital viewport so they move at
            markedly faster foreground parallax than the distant scene!
        ========================================================================= */}
        <div
          className="absolute -inset-24 pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(${parallax.foregroundFrame.x}px, ${parallax.foregroundFrame.y}px, 0) scale(${parallax.foregroundFrame.scale})`,
          }}
        >
          {/* Base Foreground Frame */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${seq.baseImageSrc})`,
              maskImage: spatialMasks.baseForegroundMask,
              WebkitMaskImage: spatialMasks.baseForegroundMask,
              opacity: 1 - subStages.foregroundReveal,
            }}
          />

          {/* Incoming Foreground Frame */}
          {seq.targetImageSrc !== seq.baseImageSrc && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${seq.targetImageSrc})`,
                maskImage: spatialMasks.targetForegroundMask,
                WebkitMaskImage: spatialMasks.targetForegroundMask,
                opacity: subStages.foregroundReveal,
              }}
            />
          )}
        </div>

        {/* =========================================================================
            PLANE 2 & OPTICAL MATCH-CUT LIGHTING LAYER
        ========================================================================= */}
        <ProceduralWorldLayer
          sequenceIndex={sequenceIndex}
          sectionProgress={s}
          mouseOffset={mouseOffset}
          isReducedMotion={isReducedMotion}
        />

        {/* Dynamic Material Color-Temperature Bleed Around Active Transition Anchor */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${spatialMasks.ax}% ${spatialMasks.ay}%, ${seq.palette.ambientLight} 0%, transparent 62%)`,
            opacity: 0.45 + Math.sin(s * Math.PI) * 0.45,
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* =========================================================================
          EDITORIAL CHIAROSCURO VIGNETTE & TACTILE FILM GRAIN OVERLAY
      ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_46%,rgba(0,0,0,0.84)_100%)]" />

        {/* Subtle SVG-based 35mm Editorial Film Texture */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            opacity: seq.palette.grainOpacity,
            backgroundImage: `radial-gradient(rgba(255,255,255,0.18) 1px, transparent 0)`,
            backgroundSize: '3px 3px',
          }}
        />

        {/* Final Contemporary Earth Cosmic Pull-Back Framing */}
        {globalProgress > 0.93 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: (globalProgress - 0.93) / 0.07,
              background:
                'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.12) 0%, rgba(0,0,0,0.68) 74%, rgba(0,0,0,0.96) 100%)',
            }}
          />
        )}
      </div>

      {/* Initial Dark Veil while first frame decodes */}
      {!isFirstReady && (
        <div className="absolute inset-0 bg-black z-40 transition-opacity duration-700" />
      )}
    </div>
  );
};
