export interface TransitionBridge {
  sourceAnchorName: string;
  targetAnchorName: string;
  mechanism: 'zoom-push-pull' | 'match-composition' | 'environmental' | 'scale-pullback';
  focusPoint: { x: number; y: number }; // normalized 0-100 percentage in image
  narrativeBridge: string;
}

export interface EraStageSpec {
  id: string;
  index: number;
  imageSrc: string;
  title: string;
  epochLabel: string;
  timeRange: string;
  historicalEnvironment: string;
  primaryVisualAnchor: string;
  secondaryVisualAnchor: string;
  landscapeAnchor: string;
  transitionBridge: TransitionBridge;
  palette: {
    primary: string;
    ambient: string;
    glow: string;
    specular: string;
  };
  cameraProfile: {
    baseScale: number;
    anchorZoomScale: number;
    driftX: number;
    driftY: number;
    focusPoint: { x: number; y: number };
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

export const ERAS_DATA: EraStageSpec[] = [
  {
    id: 'prehistoric',
    index: 0,
    title: 'Dawn of Humanity',
    epochLabel: 'PALEOLITHIC TO NEOLITHIC',
    timeRange: 'c. 40,000 – 8,000 BCE',
    imageSrc: '/src/assets/images/eras_prehistoric_dawn_1791025008325.jpg',
    historicalEnvironment: 'Untouched primordial river valley, pine forest, morning mist, jagged peaks',
    primaryVisualAnchor: 'Valley hearth fire & riverside footpath',
    secondaryVisualAnchor: 'Nomadic stone shelter & early hunter silhouettes',
    landscapeAnchor: 'Serpentine river bend & towering mountain ridge',
    transitionBridge: {
      sourceAnchorName: 'Hearth Fire & River Crossing',
      targetAnchorName: 'Irrigated Stone Terrace Canal',
      mechanism: 'zoom-push-pull',
      focusPoint: { x: 52, y: 64 }, // riverbank hearth
      narrativeBridge: 'Campfire embers coalesce into agricultural brick kilns & canal works',
    },
    palette: {
      primary: '#d97706',
      ambient: '#78350f',
      glow: '#fbbf24',
      specular: '#fef3c7',
    },
    cameraProfile: {
      baseScale: 1.0,
      anchorZoomScale: 1.35,
      driftX: -15,
      driftY: -5,
      focusPoint: { x: 52, y: 64 },
    },
    audioProfile: {
      wind: 0.8,
      fire: 0.7,
      water: 0.3,
      organ: 0.0,
      steam: 0.0,
      synth: 0.0,
    },
  },
  {
    id: 'ancient',
    index: 1,
    title: 'Bronze & Terraced Canals',
    epochLabel: 'FIRST CIVILIZATIONS',
    timeRange: 'c. 3,500 – 500 BCE',
    imageSrc: '/src/assets/images/eras_ancient_settlement_1791025020469.jpg',
    historicalEnvironment: 'Sun-baked mudbrick stepped temples, canal irrigation terraces, river quays',
    primaryVisualAnchor: 'Irrigated waterway terraces & stone canal bridge',
    secondaryVisualAnchor: 'Wooden merchant barges & colonnaded quays',
    landscapeAnchor: 'The same river bend fortified with stone embankments',
    transitionBridge: {
      sourceAnchorName: 'Stone Canal & River Harbor',
      targetAnchorName: 'Arched Viaduct & Maritime Docks',
      mechanism: 'match-composition',
      focusPoint: { x: 48, y: 58 },
      narrativeBridge: 'Canal quay expands into arched medieval stone aqueduct & trading galleons',
    },
    palette: {
      primary: '#eab308',
      ambient: '#854d0e',
      glow: '#fef08a',
      specular: '#fef9c3',
    },
    cameraProfile: {
      baseScale: 1.03,
      anchorZoomScale: 1.38,
      driftX: 20,
      driftY: -8,
      focusPoint: { x: 48, y: 58 },
    },
    audioProfile: {
      wind: 0.4,
      fire: 0.2,
      water: 0.8,
      organ: 0.1,
      steam: 0.0,
      synth: 0.0,
    },
  },
  {
    id: 'medieval',
    index: 2,
    title: 'Silk Road & Spire',
    epochLabel: 'GLOBAL TRADE CROSSROADS',
    timeRange: 'c. 800 – 1650 CE',
    imageSrc: '/src/assets/images/eras_medieval_silkroad_1791025031523.jpg',
    historicalEnvironment: 'Domed minarets, gothic cathedral spires, arched stone bridges, river fleet',
    primaryVisualAnchor: 'Arched stone bridge & multi-masted carracks',
    secondaryVisualAnchor: 'Riverside iron forge & market lantern clusters',
    landscapeAnchor: 'The same river valley spanned by grand masonry architecture',
    transitionBridge: {
      sourceAnchorName: 'Stone Arched River Bridge',
      targetAnchorName: 'Iron Truss Railway Bridge & Steam Locomotive',
      mechanism: 'zoom-push-pull',
      focusPoint: { x: 50, y: 55 },
      narrativeBridge: 'Masonry bridge transforms into cast-iron railway truss & steam engines',
    },
    palette: {
      primary: '#38bdf8',
      ambient: '#1e3a8a',
      glow: '#7dd3fc',
      specular: '#e0f2fe',
    },
    cameraProfile: {
      baseScale: 1.05,
      anchorZoomScale: 1.42,
      driftX: -25,
      driftY: -12,
      focusPoint: { x: 50, y: 55 },
    },
    audioProfile: {
      wind: 0.3,
      fire: 0.3,
      water: 0.4,
      organ: 0.7,
      steam: 0.1,
      synth: 0.0,
    },
  },
  {
    id: 'industrial',
    index: 3,
    title: 'The Age of Steam & Iron',
    epochLabel: 'INDUSTRIAL ACCELERATION',
    timeRange: 'c. 1780 – 1910 CE',
    imageSrc: '/src/assets/images/eras_industrial_steam_1791025042401.jpg',
    historicalEnvironment: 'Towering brick smokestacks, billowing steam plumes, iron bridges, rail lines',
    primaryVisualAnchor: 'Iron truss railway bridge & locomotive furnace',
    secondaryVisualAnchor: 'Billowing steam stacks & amber gas streetlights',
    landscapeAnchor: 'The river now carrying steam-powered tugs and industrial mills',
    transitionBridge: {
      sourceAnchorName: 'Locomotive Furnace & Amber Gaslight',
      targetAnchorName: 'Metropolitan Grid & Rocket Ascent',
      mechanism: 'zoom-push-pull',
      focusPoint: { x: 45, y: 52 },
      narrativeBridge: 'Steam locomotive furnace ignites into electrical grid and rocket propulsion',
    },
    palette: {
      primary: '#f97316',
      ambient: '#431407',
      glow: '#fdba74',
      specular: '#ffedd5',
    },
    cameraProfile: {
      baseScale: 1.07,
      anchorZoomScale: 1.45,
      driftX: 30,
      driftY: -16,
      focusPoint: { x: 45, y: 52 },
    },
    audioProfile: {
      wind: 0.2,
      fire: 0.4,
      water: 0.1,
      organ: 0.2,
      steam: 0.9,
      synth: 0.2,
    },
  },
  {
    id: 'space',
    index: 4,
    title: 'Planetary Blue & Cosmos',
    epochLabel: 'THE SPACE & DIGITAL AGE',
    timeRange: 'c. 1969 CE – Present',
    imageSrc: '/src/assets/images/eras_modern_space_orbit_1791025053180.jpg',
    historicalEnvironment: 'Glowing metropolis ascending into Earth orbit, blue marble in deep cosmos',
    primaryVisualAnchor: 'Curved horizon of Earth illuminated by city night grids',
    secondaryVisualAnchor: 'Orbital solar arrays & satellite constellation',
    landscapeAnchor: 'The entire planet containing every valley, river, and civilization',
    transitionBridge: {
      sourceAnchorName: 'Planetary Curvature & City Lights',
      targetAnchorName: 'Earth in Cosmic Silence',
      mechanism: 'scale-pullback',
      focusPoint: { x: 50, y: 50 },
      narrativeBridge: 'Extreme cosmic pull-back: humanity\'s entire journey suspended on one blue sphere',
    },
    palette: {
      primary: '#60a5fa',
      ambient: '#0f172a',
      glow: '#93c5fd',
      specular: '#dbeafe',
    },
    cameraProfile: {
      baseScale: 1.1,
      anchorZoomScale: 1.0,
      driftX: 0,
      driftY: 20,
      focusPoint: { x: 50, y: 50 },
    },
    audioProfile: {
      wind: 0.1,
      fire: 0.0,
      water: 0.0,
      organ: 0.1,
      steam: 0.0,
      synth: 0.95,
    },
  },
];
