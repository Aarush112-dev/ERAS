import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Compass,
  Maximize,
  Minimize,
  BookOpen,
  List,
  X,
} from 'lucide-react';
import { HISTORICAL_SEQUENCES, TOTAL_DOCUMENT_VH } from '../data/erasData';

interface MinimalHudProps {
  sequenceIndex: number;
  sectionProgress: number;
  globalProgress: number;
  isPlayingSound: boolean;
  onToggleSound: () => void;
  isReducedMotion: boolean;
  onToggleReducedMotion: () => void;
}

const CURATED_NAV_ANCHORS = [
  { label: 'Origins', seqIndex: 0 },
  { label: 'Antiquity', seqIndex: 4 },
  { label: 'Silk Road', seqIndex: 7 },
  { label: 'Science', seqIndex: 9 },
  { label: 'Industry', seqIndex: 10 },
  { label: 'Orbit', seqIndex: 14 },
];

export const MinimalHud: React.FC<MinimalHudProps> = ({
  sequenceIndex,
  sectionProgress,
  globalProgress,
  isPlayingSound,
  onToggleSound,
  isReducedMotion,
  onToggleReducedMotion,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEditorial, setShowEditorial] = useState(true);
  const [isIndexOpen, setIsIndexOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const scrollToVh = (targetVh: number) => {
    const vhPx = window.innerHeight / 100;
    window.scrollTo({
      top: targetVh * vhPx,
      behavior: isReducedMotion ? 'auto' : 'smooth',
    });
  };

  const seq = HISTORICAL_SEQUENCES[sequenceIndex] || HISTORICAL_SEQUENCES[0];
  const { editorial, palette } = seq;

  // Determine which of the 3 progressive sub-stage beats is active (0, 1, or 2)
  const activeBeatIndex = sectionProgress < 0.34 ? 0 : sectionProgress < 0.68 ? 1 : 2;
  const activeBeat = editorial.beats[activeBeatIndex];

  // Progress within the current beat (0 to 100%)
  const beatLocalProgress =
    activeBeatIndex === 0
      ? Math.min(1, sectionProgress / 0.34)
      : activeBeatIndex === 1
      ? Math.min(1, (sectionProgress - 0.34) / 0.34)
      : Math.min(1, (sectionProgress - 0.68) / 0.32);

  const isRightAligned = editorial.editorialAlign === 'right';

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between select-none">
      {/* =========================================================================
          TOP BAR (3-Zone Contract: Wordmark — Editorial Nav Links — Actions)
      ========================================================================= */}
      <header className="w-full px-6 sm:px-10 py-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-auto">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToVh(0);
          }}
          className="font-cinzel text-lg sm:text-xl font-semibold tracking-[0.28em] text-white hover:text-amber-200 transition-colors whitespace-nowrap shrink-0"
        >
          ERAS
        </a>

        {/* Zone 2: Clean Typography Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium tracking-wider text-neutral-300">
          {CURATED_NAV_ANCHORS.map((item) => {
            const targetSeq = HISTORICAL_SEQUENCES[item.seqIndex];
            const isActive =
              sequenceIndex >= item.seqIndex &&
              (item.seqIndex === 14 ||
                sequenceIndex <
                  (CURATED_NAV_ANCHORS[CURATED_NAV_ANCHORS.indexOf(item) + 1]?.seqIndex ?? 16));
            return (
              <button
                key={item.label}
                onClick={() => scrollToVh(targetSeq.startVh + 20)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b ${
                  isActive
                    ? 'text-white border-amber-400/80'
                    : 'text-neutral-400 border-transparent hover:text-white hover:border-white/30'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions & Utility Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIndexOpen((prev) => !prev)}
            className="px-3.5 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 rounded-md transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <List size={14} />
            <span className="tabular-nums">
              {editorial.romanNumeral} / XVI
            </span>
          </button>

          <button
            onClick={() => setShowEditorial((prev) => !prev)}
            title={showEditorial ? 'Hide editorial narrative' : 'Show editorial narrative'}
            aria-label={showEditorial ? 'Hide editorial narrative' : 'Show editorial narrative'}
            className={`p-2 rounded-md border transition-colors ${
              showEditorial
                ? 'text-amber-300 border-amber-400/30 bg-white/5'
                : 'text-neutral-400 border-white/10 hover:text-white'
            }`}
          >
            <BookOpen size={15} />
          </button>

          <button
            onClick={onToggleSound}
            title={isPlayingSound ? 'Mute ambient soundscape' : 'Enable ambient soundscape'}
            aria-label={isPlayingSound ? 'Mute ambient soundscape' : 'Enable ambient soundscape'}
            className={`p-2 rounded-md border transition-colors ${
              isPlayingSound
                ? 'text-amber-300 border-amber-400/30 bg-white/5'
                : 'text-neutral-400 border-white/10 hover:text-white'
            }`}
          >
            {isPlayingSound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <button
            onClick={onToggleReducedMotion}
            title={isReducedMotion ? 'Enable full parallax motion' : 'Reduce camera motion'}
            aria-label={isReducedMotion ? 'Enable full parallax motion' : 'Reduce camera motion'}
            className={`hidden sm:flex p-2 rounded-md border transition-colors ${
              isReducedMotion
                ? 'text-amber-300 border-amber-400/30 bg-white/5'
                : 'text-neutral-400 border-white/10 hover:text-white'
            }`}
          >
            <Compass size={15} />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
            className="hidden sm:flex p-2 rounded-md border border-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          SHOPIFY EDITIONS-STYLE ASYMMETRICAL EDITORIAL NARRATIVE OVERLAY
          Updates deterministically across 3 sub-stages within each era as user scrolls
      ========================================================================= */}
      {showEditorial && (
        <div
          className={`w-full px-6 sm:px-12 pb-8 sm:pb-12 flex flex-col ${
            isRightAligned ? 'items-end' : 'items-start'
          } transition-all duration-500`}
        >
          {/* Measured Contrast Scrim Container */}
          <aside
            className="w-full max-w-lg pointer-events-auto rounded-lg p-6 sm:p-7 bg-gradient-to-t from-black/55 via-black/40 to-black/25 backdrop-blur-xs border border-white/10 shadow-xl transition-all duration-500"
          >
            {/* Unboxed Metadata Kicker (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mb-2.5 tracking-wide">
              <span
                className="font-semibold text-neutral-200"
                style={{ color: palette.primaryAccent }}
              >
                Chapter {editorial.romanNumeral}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums text-neutral-300">{editorial.chronology}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums text-neutral-400">
                {String(sequenceIndex + 1).padStart(2, '0')} / 16
              </span>
            </div>

            {/* Expressive Display Headline */}
            <h1
              className="font-cinzel text-2xl sm:text-3xl font-semibold text-white tracking-wide leading-snug mb-1.5"
              style={{ textWrap: 'balance' }}
            >
              {editorial.chapterTitle}
            </h1>

            {/* Regional & Material Provenance */}
            <p className="text-xs text-neutral-400 mb-5">
              {editorial.regionContext}
            </p>

            {/* 3-Beat Progressive Sub-Stage Selector & Progress Hairlines */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {editorial.beats.map((beat, idx) => {
                const isBeatActive = idx === activeBeatIndex;
                const isBeatCompleted = idx < activeBeatIndex;
                const targetBeatProgress = idx === 0 ? 0.08 : idx === 1 ? 0.48 : 0.82;

                return (
                  <button
                    key={beat.phaseLabel}
                    onClick={() =>
                      scrollToVh(seq.startVh + seq.scrollHeightVh * targetBeatProgress)
                    }
                    className="text-left group focus:outline-none"
                  >
                    <div className="w-full h-[2px] bg-white/15 mb-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-150"
                        style={{
                          width: isBeatCompleted
                            ? '100%'
                            : isBeatActive
                            ? `${Math.max(8, beatLocalProgress * 100)}%`
                            : '0%',
                          backgroundColor: palette.primaryAccent,
                        }}
                      />
                    </div>
                    <span
                      className={`block text-[11px] font-medium truncate transition-colors ${
                        isBeatActive
                          ? 'text-white'
                          : isBeatCompleted
                          ? 'text-neutral-300 group-hover:text-white'
                          : 'text-neutral-500 group-hover:text-neutral-300'
                      }`}
                    >
                      {beat.phaseLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Sub-Stage Narrative Prose */}
            <div className="border-t border-white/10 pt-4">
              <h2
                className="text-base font-semibold text-neutral-100 mb-2 leading-snug"
                style={{ textWrap: 'balance' }}
              >
                {activeBeat.subheading}
              </h2>
              <p className="text-sm sm:text-[15px] text-neutral-300 leading-relaxed mb-4 font-normal">
                {activeBeat.body}
              </p>

              {/* Quiet Unboxed Material & Technical Footnote */}
              <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-white/10 pt-3">
                <span className="truncate">{activeBeat.materialDetail}</span>
                <span className="tabular-nums text-neutral-500 shrink-0 ml-3">
                  {Math.round(sectionProgress * 100)}%
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================================================
          SHOPIFY EDITIONS-STYLE CHAPTER INDEX DRAWER
      ========================================================================= */}
      {isIndexOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md pointer-events-auto flex justify-end">
          <div className="w-full max-w-md bg-neutral-950 border-l border-white/10 h-full flex flex-col justify-between p-6 sm:p-8 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                <div>
                  <span className="font-cinzel text-sm tracking-[0.25em] text-white block">
                    ERAS CHRONICLE
                  </span>
                  <span className="text-xs text-neutral-400">
                    16 Vertical Chapters · {TOTAL_DOCUMENT_VH.toLocaleString()}vh Total Journey
                  </span>
                </div>
                <button
                  onClick={() => setIsIndexOpen(false)}
                  aria-label="Close chapter index"
                  className="p-2 text-neutral-400 hover:text-white rounded-md border border-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="divide-y divide-white/10">
                {HISTORICAL_SEQUENCES.map((item, idx) => {
                  const isCurrent = idx === sequenceIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        scrollToVh(item.startVh + 25);
                        setIsIndexOpen(false);
                      }}
                      className={`w-full py-3.5 text-left flex items-baseline justify-between gap-4 transition-colors ${
                        isCurrent ? 'text-white' : 'text-neutral-400 hover:text-neutral-100'
                      }`}
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span
                          className="text-xs font-mono tabular-nums w-7 shrink-0"
                          style={{
                            color: isCurrent ? item.palette.primaryAccent : undefined,
                          }}
                        >
                          {item.editorial.romanNumeral}.
                        </span>
                        <div className="truncate">
                          <span className="font-cinzel text-sm font-semibold block truncate">
                            {item.editorial.chapterTitle}
                          </span>
                          <span className="text-xs text-neutral-500 block truncate">
                            {item.editorial.regionContext}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500 tabular-nums shrink-0">
                        {item.editorial.chronology}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right-Edge Vertical Scroll Hairline */}
      <div className="fixed right-0 top-0 bottom-0 w-[2px] bg-white/10 pointer-events-none">
        <div
          className="w-full transition-all duration-75"
          style={{
            height: `${Math.min(100, Math.max(0, globalProgress * 100))}%`,
            backgroundColor: palette.primaryAccent,
          }}
        />
      </div>
    </div>
  );
};
