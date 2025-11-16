import { v4 as uuidv4 } from 'uuid';
import { Project, ProjectSettings, ProjectMetadata } from '@/lib/types/project';
import { Timeline, Track } from '@/lib/types/timeline';

export function createDefaultProject(name: string): Project {
  const now = new Date();

  const settings: ProjectSettings = {
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 900, // 30 seconds at 30fps
    backgroundColor: '#000000',
  };

  const timeline: Timeline = {
    tracks: [createDefaultTrack('video')],
    currentFrame: 0,
    zoomLevel: 1,
    scrollPosition: 0,
  };

  const metadata: ProjectMetadata = {
    version: '1.0.0',
    totalSize: 0,
    assetCount: 0,
    trackCount: 1,
  };

  return {
    id: uuidv4(),
    name,
    createdAt: now,
    updatedAt: now,
    settings,
    timeline,
    assets: [],
    metadata,
  };
}

export function createDefaultTrack(type: Track['type']): Track {
  return {
    id: uuidv4(),
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track`,
    type,
    order: 0,
    elements: [],
    isLocked: false,
    isMuted: false,
    height: 80,
  };
}

export function calculateProjectDuration(project: Project): number {
  let maxFrame = 0;

  project.timeline.tracks.forEach(track => {
    track.elements.forEach(element => {
      const endFrame = element.startFrame + element.durationInFrames;
      if (endFrame > maxFrame) {
        maxFrame = endFrame;
      }
    });
  });

  return maxFrame;
}

export function updateProjectMetadata(project: Project): Project {
  return {
    ...project,
    metadata: {
      ...project.metadata,
      assetCount: project.assets.length,
      trackCount: project.timeline.tracks.length,
      totalSize: project.assets.reduce((sum, asset) => sum + asset.file.size, 0),
    },
    updatedAt: new Date(),
  };
}
