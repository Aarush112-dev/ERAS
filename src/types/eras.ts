export type TransitionMechanism =
  | 'flame-to-kiln-match'
  | 'kiln-to-brazier-match'
  | 'colonnade-to-aqueduct'
  | 'archway-portal-flythrough'
  | 'harbor-to-observatory'
  | 'astrolabe-to-flywheel-shape'
  | 'flywheel-to-suspension-bridge'
  | 'cables-to-megacity-grid'
  | 'launchpad-to-orbital-viewport'
  | 'viewport-to-planetary-earth'
  | 'environmental-evolution'
  | 'route-following';

export type ForegroundMaskPreset =
  | 'left-cave-overhang'
  | 'right-clay-kiln'
  | 'left-stone-colonnade'
  | 'full-stone-archway'
  | 'right-brass-astrolabe'
  | 'center-iron-flywheel'
  | 'left-pillars-right-cables'
  | 'circular-orbital-viewport'
  | 'bottom-riverbank-terrace';

export interface NarrativeBeat {
  phaseLabel: string;
  subheading: string;
  body: string;
  materialDetail: string;
}

export interface EditorialStory {
  romanNumeral: string;
  chapterTitle: string;
  chronology: string;
  regionContext: string;
  editorialAlign: 'left' | 'right';
  beats: [NarrativeBeat, NarrativeBeat, NarrativeBeat];
}

export interface HistoricalSequenceSpec {
  id: string;
  index: number;
  scrollHeightVh: number;
  startVh: number;
  endVh: number;
  baseImageSrc: string;
  targetImageSrc: string;
  secondaryImageSrc?: string;
  transitionMechanism: TransitionMechanism;
  foregroundMask: ForegroundMaskPreset;
  targetForegroundMask: ForegroundMaskPreset;
  exitAnchorPoint: { x: number; y: number };
  entryAnchorPoint: { x: number; y: number };
  cameraEntry: { scale: number; x: number; y: number; rotate: number };
  cameraMid: { scale: number; x: number; y: number; rotate: number };
  cameraAnchorPeak: { scale: number; x: number; y: number; rotate: number };
  cameraExit: { scale: number; x: number; y: number; rotate: number };
  maskStyle:
    | 'flame-radial-bloom'
    | 'portal-aperture-expand'
    | 'circular-wheel-iris'
    | 'architectural-wipe'
    | 'valley-sweep'
    | 'foundation-rise'
    | 'horizon-part'
    | 'orbital-pullback';
  palette: {
    canvasBg: string;
    primaryAccent: string;
    ambientLight: string;
    shadowTint: string;
    grainOpacity: number;
  };
  atmosphere: {
    skyTint: string;
    fogColor: string;
    fogDensity: number;
    lightRayColor: string;
    lightRayAngle: number;
    glowColor: string;
    particleType:
      | 'mist'
      | 'embers'
      | 'pollen'
      | 'dust'
      | 'lanterns'
      | 'sparks'
      | 'smoke'
      | 'electric'
      | 'data'
      | 'stars';
    colorGrade: {
      sepia: number;
      contrast: number;
      saturate: number;
      brightness: number;
      hueRotate: number;
    };
  };
  audioWeights: {
    wind: number;
    fire: number;
    water: number;
    organ: number;
    steam: number;
    synth: number;
  };
  editorial: EditorialStory;
}
