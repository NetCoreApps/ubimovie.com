export interface Timeline {
  tracks: Track[];
  currentFrame: number;
  zoomLevel: number;
  scrollPosition: number;
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'overlay';
  order: number;
  elements: TimelineElement[];
  isLocked: boolean;
  isMuted: boolean;
  height: number;
}

export interface TimelineElement {
  id: string;
  trackId: string;
  assetId?: string;
  type: 'video' | 'image' | 'audio' | 'text' | 'shape';

  // Timeline positioning
  startFrame: number;
  durationInFrames: number;

  // Media trimming
  trimStart: number;
  trimEnd: number;

  // Transformations
  properties: ElementProperties;

  // Metadata
  name: string;
  layer: number;
}

export interface ElementProperties {
  // Visual
  opacity: number;        // 0-1
  scale: number;         // 0.1-5
  rotation: number;      // 0-360
  position: { x: number; y: number };

  // Audio
  volume: number;        // 0-1

  // Playback
  speed: number;         // 0.25-4x
  playbackDirection: 'forward' | 'reverse';
  loop: boolean;

  // Text-specific
  text?: TextProperties;

  // Transitions
  transitionIn?: Transition;
  transitionOut?: Transition;
}

export interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  alignment: 'left' | 'center' | 'right';
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
}

export interface Transition {
  type: 'fade' | 'slide' | 'zoom' | 'wipe';
  duration: number;
  easing: string;
}
