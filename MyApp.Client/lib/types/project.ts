import { Timeline } from './timeline';
import { Asset } from './asset';

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
  timeline: Timeline;
  assets: Asset[];
  metadata: ProjectMetadata;
}

export interface ProjectSettings {
  width: number;          // Default: 1920
  height: number;         // Default: 1080
  fps: number;           // Default: 30
  durationInFrames: number;
  backgroundColor: string; // Default: '#000000'
}

export interface ProjectMetadata {
  version: string;
  totalSize: number;
  assetCount: number;
  trackCount: number;
}
