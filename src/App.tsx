import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HistoricalCanvas } from './components/HistoricalCanvas';
import { AtmosphericParticles } from './components/AtmosphericParticles';
import { MinimalHud } from './components/MinimalHud';
import { audioEngine } from './engine/audioEngine';

export default function App() {
  // Master timeline progress: 0.0 to 1.0
  const [targetProgress, setTargetProgress] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  // Mouse tracking for 2.5D parallax and detail lens
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Interactive modes
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [isAutoVoyage, setIsAutoVoyage] = useState<boolean>(false);
  const [lensActive, setLensActive] = useState<boolean>(false);
  const [showAnchorReticle, setShowAnchorReticle] = useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const touchStartY = useRef<number>(0);
  const autoVoyageTimer = useRef<number | null>(null);

  // Smooth lerp loop for 60 FPS camera motion
  useEffect(() => {
    let animId: number;
    const lerpSpeed = isReducedMotion ? 0.15 : 0.07;

    const tick = () => {
      setCurrentProgress((prev) => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.0001) return targetProgress;
        const nextVal = prev + diff * lerpSpeed;
        audioEngine.updateProgress(nextVal);
        return nextVal;
      });
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [targetProgress, isReducedMotion]);

  // Handle Wheel Events (Physical smooth scroll, fully reversible)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setHasInteracted(true);
    setIsAutoVoyage(false);

    // Delta normalization
    const delta = e.deltaY * 0.00045;
    setTargetProgress((prev) => Math.max(0, Math.min(1, prev + delta)));
  }, []);

  // Handle Touch Events (Mobile/Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setHasInteracted(true);
    setIsAutoVoyage(false);
    const touchY = e.touches[0].clientY;
    const deltaY = (touchStartY.current - touchY) * 0.002;
    touchStartY.current = touchY;
    setTargetProgress((prev) => Math.max(0, Math.min(1, prev + deltaY)));
  };

  // Handle Mouse Move (2.5D Parallax & Detail Lens)
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Normalized from -1 to 1
    const normX = (clientX / w) * 2 - 1;
    const normY = (clientY / h) * 2 - 1;

    setMouseOffset({ x: normX, y: normY });
    setLensPosition({ x: clientX, y: clientY });
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setHasInteracted(true);
        setIsAutoVoyage(false);
        setTargetProgress((prev) => Math.min(1, prev + 0.04));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setHasInteracted(true);
        setIsAutoVoyage(false);
        setTargetProgress((prev) => Math.max(0, prev - 0.04));
      } else if (e.code === 'Space') {
        e.preventDefault();
        setHasInteracted(true);
        setIsAutoVoyage((prev) => !prev);
      } else if (e.key.toLowerCase() === 'm') {
        toggleSound();
      } else if (e.key.toLowerCase() === 'l') {
        setLensActive((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mount wheel listener to window with passive: false to prevent default page scrolling
  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Auto-Voyage loop (Cinematic continuous historical playback)
  useEffect(() => {
    if (isAutoVoyage) {
      autoVoyageTimer.current = window.setInterval(() => {
        setTargetProgress((prev) => {
          if (prev >= 1) {
            setIsAutoVoyage(false);
            return 1;
          }
          return prev + 0.0015;
        });
      }, 30);
    } else {
      if (autoVoyageTimer.current) clearInterval(autoVoyageTimer.current);
    }
    return () => {
      if (autoVoyageTimer.current) clearInterval(autoVoyageTimer.current);
    };
  }, [isAutoVoyage]);

  const toggleSound = () => {
    setHasInteracted(true);
    const active = audioEngine.toggleMute();
    setIsPlayingSound(active);
  };

  const handleSeek = (pos: number) => {
    setHasInteracted(true);
    setIsAutoVoyage(false);
    setTargetProgress(pos);
  };

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-black text-white select-none cursor-crosshair"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* 2.5D Canvas Composite Transformation Engine */}
      <HistoricalCanvas
        progress={currentProgress}
        mouseOffset={mouseOffset}
        isReducedMotion={isReducedMotion}
        lensActive={lensActive}
        lensPosition={lensPosition}
        showAnchorReticle={showAnchorReticle}
      />

      {/* Multi-depth Atmospheric Particles (Embers, Mist, Soot, Cosmic Dust) */}
      <AtmosphericParticles
        progress={currentProgress}
        mouseOffset={mouseOffset}
        isReducedMotion={isReducedMotion}
      />

      {/* Ultra-minimal, Non-intrusive Cinematic HUD */}
      <MinimalHud
        progress={currentProgress}
        onSeek={handleSeek}
        isPlayingSound={isPlayingSound}
        onToggleSound={toggleSound}
        isAutoVoyage={isAutoVoyage}
        onToggleAutoVoyage={() => {
          setHasInteracted(true);
          setIsAutoVoyage((prev) => !prev);
        }}
        lensActive={lensActive}
        onToggleLens={() => setLensActive((prev) => !prev)}
        showAnchorReticle={showAnchorReticle}
        onToggleReticle={() => setShowAnchorReticle((prev) => !prev)}
        isReducedMotion={isReducedMotion}
        onToggleReducedMotion={() => setIsReducedMotion((prev) => !prev)}
        hasInteracted={hasInteracted}
      />
    </main>
  );
}
