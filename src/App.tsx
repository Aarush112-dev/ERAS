import React, { useState, useEffect, useRef } from 'react';
import { HistoricalCanvas } from './components/HistoricalCanvas';
import { AtmosphericParticles } from './components/AtmosphericParticles';
import { MinimalHud } from './components/MinimalHud';
import { HISTORICAL_SEQUENCES, TOTAL_DOCUMENT_VH } from './data/erasData';
import { audioEngine } from './engine/audioEngine';

export default function App() {
  // Deterministic scroll-mapped state
  const [sequenceIndex, setSequenceIndex] = useState<number>(0);
  const [sectionProgress, setSectionProgress] = useState<number>(0);
  const [globalProgress, setGlobalProgress] = useState<number>(0);

  // Subtle mouse perspective for multi-layer parallax
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Accessibility & environmental sound controls
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Smoothed scroll tracking ref (settling directly to actual window.scrollY without timers)
  const targetScrollY = useRef<number>(0);
  const smoothedScrollY = useRef<number>(0);

  useEffect(() => {
    const updateScrollTarget = () => {
      targetScrollY.current = window.scrollY || window.pageYOffset || 0;
    };

    updateScrollTarget();
    smoothedScrollY.current = targetScrollY.current;

    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('resize', updateScrollTarget, { passive: true });

    let rafId: number;

    const tick = () => {
      const diff = targetScrollY.current - smoothedScrollY.current;
      const factor = isReducedMotion ? 0.35 : 0.14;

      if (Math.abs(diff) > 0.05) {
        smoothedScrollY.current += diff * factor;
      } else {
        smoothedScrollY.current = targetScrollY.current;
      }

      const vhPx = Math.max(1, window.innerHeight / 100);
      const currentVh = Math.max(0, smoothedScrollY.current / vhPx);
      const maxScrollableVh = Math.max(1, TOTAL_DOCUMENT_VH - 100);

      // Deterministic global progress (0.0 to 1.0)
      const normGlobal = Math.max(0, Math.min(1, currentVh / maxScrollableVh));

      // Locate active sequence from currentVh
      let activeIdx = HISTORICAL_SEQUENCES.length - 1;
      for (let i = 0; i < HISTORICAL_SEQUENCES.length; i++) {
        const seq = HISTORICAL_SEQUENCES[i];
        if (currentVh >= seq.startVh && currentVh < seq.endVh) {
          activeIdx = i;
          break;
        }
      }

      const activeSeq = HISTORICAL_SEQUENCES[activeIdx];
      // For the last section, account for viewport height so it reaches 1.0 cleanly at bottom of page
      const effectiveLengthVh =
        activeIdx === HISTORICAL_SEQUENCES.length - 1
          ? Math.max(100, activeSeq.scrollHeightVh - 100)
          : activeSeq.scrollHeightVh;

      const normSection = Math.max(
        0,
        Math.min(1, (currentVh - activeSeq.startVh) / effectiveLengthVh)
      );

      setSequenceIndex(activeIdx);
      setSectionProgress(normSection);
      setGlobalProgress(normGlobal);

      audioEngine.updateProgress(normGlobal);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('resize', updateScrollTarget);
    };
  }, [isReducedMotion]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isReducedMotion) return;
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    const normX = (e.clientX / w) * 2 - 1;
    const normY = (e.clientY / h) * 2 - 1;
    setMouseOffset({ x: normX, y: normY });
  };

  const toggleSound = () => {
    const active = audioEngine.toggleMute();
    setIsPlayingSound(active);
  };

  return (
    <div
      className="relative w-full bg-black text-white select-none"
      onMouseMove={handleMouseMove}
    >
      {/* =========================================================================
          FIXED FULL-VIEWPORT VISUAL STAGE
          Remains anchored in viewport while native vertical document scrolls
      ========================================================================= */}
      <div className="fixed inset-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        <HistoricalCanvas
          sequenceIndex={sequenceIndex}
          sectionProgress={sectionProgress}
          globalProgress={globalProgress}
          mouseOffset={mouseOffset}
          isReducedMotion={isReducedMotion}
        />

        <AtmosphericParticles
          sequenceIndex={sequenceIndex}
          sectionProgress={sectionProgress}
          mouseOffset={mouseOffset}
          isReducedMotion={isReducedMotion}
        />
      </div>

      {/* =========================================================================
          SHOPIFY EDITIONS-STYLE EDITORIAL NARRATIVE & CONTROLS
      ========================================================================= */}
      <MinimalHud
        sequenceIndex={sequenceIndex}
        sectionProgress={sectionProgress}
        globalProgress={globalProgress}
        isPlayingSound={isPlayingSound}
        onToggleSound={toggleSound}
        isReducedMotion={isReducedMotion}
        onToggleReducedMotion={() => setIsReducedMotion((prev) => !prev)}
      />

      {/* =========================================================================
          GENUINE VERTICAL SCROLL DOCUMENT (16,700vh across 16 Historical Sequences)
          Works with native mouse wheel, trackpad, keyboard, touch swipe & scrollbar
      ========================================================================= */}
      <main className="relative z-0 w-full pointer-events-auto">
        {HISTORICAL_SEQUENCES.map((seq) => (
          <section
            key={seq.id}
            data-sequence-id={seq.id}
            style={{ height: `${seq.scrollHeightVh}vh` }}
            className="w-full relative"
          />
        ))}
      </main>
    </div>
  );
}
