import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Search, Crosshair, Maximize, Minimize, Compass } from 'lucide-react';
import { ERAS_DATA } from '../data/erasData';

interface MinimalHudProps {
  progress: number;
  onSeek: (progress: number) => void;
  isPlayingSound: boolean;
  onToggleSound: () => void;
  isAutoVoyage: boolean;
  onToggleAutoVoyage: () => void;
  lensActive: boolean;
  onToggleLens: () => void;
  showAnchorReticle: boolean;
  onToggleReticle: () => void;
  isReducedMotion: boolean;
  onToggleReducedMotion: () => void;
  hasInteracted: boolean;
}

export const MinimalHud: React.FC<MinimalHudProps> = ({
  progress,
  onSeek,
  isPlayingSound,
  onToggleSound,
  isAutoVoyage,
  onToggleAutoVoyage,
  lensActive,
  onToggleLens,
  showAnchorReticle,
  onToggleReticle,
  isReducedMotion,
  onToggleReducedMotion,
  hasInteracted,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Identify current era and transition state
  const rawIdx = progress * (ERAS_DATA.length - 1);
  const currentIdx = Math.min(ERAS_DATA.length - 1, Math.floor(rawIdx));
  const nextIdx = Math.min(ERAS_DATA.length - 1, currentIdx + 1);
  const localProg = rawIdx - currentIdx;
  const isTransitioning = currentIdx !== nextIdx && localProg > 0.05 && localProg < 0.95;

  const currentEra = ERAS_DATA[currentIdx];
  const nextEra = ERAS_DATA[nextIdx];

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 sm:p-8 select-none">
      {/* ================= TOP BAR ================= */}
      <header className="flex items-center justify-between w-full pointer-events-auto">
        {/* Brand Wordmark (Single text element in Cinzel) */}
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.25em] text-white/90 drop-shadow-sm">
            ERAS
          </span>
          <span className="hidden md:inline-block text-[11px] font-sans tracking-widest text-neutral-400 uppercase">
            Progressive Visual History
          </span>
        </div>

        {/* Minimal Control Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isPlayingSound ? 'Mute Ambient Sound' : 'Play Ambient Sound'}
            className={`p-2 rounded-full transition-colors flex items-center gap-1.5 ${
              isPlayingSound ? 'text-amber-300 hover:text-amber-200' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {isPlayingSound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {isPlayingSound && (
              <span className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-amber-400 animate-pulse" />
                <span className="w-0.5 h-3 bg-amber-300 animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-amber-400 animate-pulse delay-150" />
              </span>
            )}
          </button>

          <div className="w-[1px] h-4 bg-white/15" />

          {/* Auto-Voyage Play / Pause */}
          <button
            onClick={onToggleAutoVoyage}
            title={isAutoVoyage ? 'Pause Continuous Voyage' : 'Start Continuous Cinematic Voyage'}
            className={`p-2 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium ${
              isAutoVoyage ? 'text-amber-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {isAutoVoyage ? <Pause size={15} /> : <Play size={15} />}
            <span className="hidden sm:inline text-[11px] tracking-wider uppercase font-mono">
              {isAutoVoyage ? 'Voyage Playing' : 'Auto-Voyage'}
            </span>
          </button>

          <div className="w-[1px] h-4 bg-white/15" />

          {/* 2.8x Detail Lens */}
          <button
            onClick={onToggleLens}
            title="Inspect 2.8× Micro Architectural Details"
            className={`p-2 rounded-full transition-colors ${
              lensActive ? 'text-amber-300 bg-white/10' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Search size={15} />
          </button>

          {/* Anchor Reticle */}
          <button
            onClick={onToggleReticle}
            title="Toggle Transition Anchor Highlight"
            className={`p-2 rounded-full transition-colors ${
              showAnchorReticle ? 'text-amber-300 bg-white/10' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Crosshair size={15} />
          </button>

          {/* Reduced Motion Toggle */}
          <button
            onClick={onToggleReducedMotion}
            title={isReducedMotion ? 'Enable Full Parallax & Zoom' : 'Reduce Camera Movement'}
            className={`p-2 rounded-full transition-colors ${
              isReducedMotion ? 'text-amber-300 bg-white/10' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass size={15} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-full text-neutral-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </header>

      {/* ================= CENTER: TRANSITION ANCHOR BRIDGE CALLOUT ================= */}
      {/* Shown purely during the visual transformation as the camera pushes into the anchor */}
      <div className="flex flex-col items-center justify-center w-full pointer-events-none transition-opacity duration-500">
        {isTransitioning && (
          <div className="bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-amber-500/30 flex items-center gap-3 text-xs tracking-wider font-mono text-amber-200/90 shadow-2xl animate-fade-in">
            <span className="text-white/80 font-serif tracking-normal">
              {currentEra.transitionBridge.sourceAnchorName}
            </span>
            <span className="text-amber-400/80">⟶</span>
            <span className="text-amber-300 font-serif tracking-normal font-semibold">
              {currentEra.transitionBridge.targetAnchorName}
            </span>
          </div>
        )}

        {/* First scroll hint (fades out permanently once interacted) */}
        {!hasInteracted && (
          <div className="flex flex-col items-center gap-2 text-white/70 animate-bounce duration-1000 mt-32">
            <div className="w-5 h-8 rounded-full border border-white/40 flex justify-center p-1">
              <div className="w-1 h-2 bg-amber-400 rounded-full animate-pulse" />
            </div>
            <span className="font-mono text-[10px] tracking-[0.25em] text-neutral-300 uppercase">
              Scroll or Drag to Progress History
            </span>
          </div>
        )}
      </div>

      {/* ================= BOTTOM BAR: TIMELINE SCRUBBER ================= */}
      <footer className="w-full flex flex-col items-center gap-3 pointer-events-auto max-w-4xl mx-auto">
        {/* Current Epoch Indicator */}
        <div className="flex items-center justify-between w-full text-xs font-mono text-neutral-400 px-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium tracking-wide">
              {currentEra.title}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400 text-[11px] font-sans">
              {currentEra.timeRange}
            </span>
          </div>

          <div className="text-[11px] tracking-widest text-neutral-400 tabular-nums">
            {Math.round(progress * 100)}%
          </div>
        </div>

        {/* Minimal Timeline Scrub Bar */}
        <div
          className="relative w-full h-6 flex items-center cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            onSeek(Math.max(0, Math.min(1, clickPos)));
          }}
        >
          {/* Base track */}
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden transition-all group-hover:h-1.5">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-sky-400 transition-all duration-75"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Era pips */}
          {ERAS_DATA.map((era, idx) => {
            const pipPos = idx / (ERAS_DATA.length - 1);
            const isPassed = progress >= pipPos;
            const isCurrent = currentIdx === idx;
            return (
              <button
                key={era.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(pipPos);
                }}
                title={era.title}
                className="absolute -translate-x-1/2 flex flex-col items-center group/pip focus:outline-none"
                style={{ left: `${pipPos * 100}%` }}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-400 ring-4 ring-amber-400/30 scale-125'
                      : isPassed
                      ? 'bg-white/80 group-hover/pip:scale-125'
                      : 'bg-white/30 group-hover/pip:bg-white/60'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
