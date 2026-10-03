export interface EraData {
  id: string;
  index: number;
  imageSrc: string;
  ambientTone: string;
  visualAnchor: string;
  palette: {
    primary: string;
    ambient: string;
    glow: string;
  };
  cameraProfile: {
    baseScale: number;
    zoomScale: number;
    driftX: number;
    driftY: number;
  };
  audioProfile: {
    wind: number;
    fire: number;
    water: number;
    organ: number;
    steam: number;
    synth: number;
  };
}

export interface MousePosition {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}
