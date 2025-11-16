'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Project } from '@/lib/types/project';
import { useAssetStore } from '@/lib/stores/asset-store';
import { usePlaybackStore } from '@/lib/stores/playback-store';
import { useTimelineStore } from '@/lib/stores/timeline-store';
import { DynamicComposition } from '@/lib/remotion/Composition';
import { PlaybackControls } from './playback-controls';

interface PreviewCanvasProps {
  project: Project;
}

export function PreviewCanvas({ project }: PreviewCanvasProps) {
  const playerRef = useRef<PlayerRef>(null);
  const { assets } = useAssetStore();
  const { isPlaying, pause } = usePlaybackStore();
  const { getTimeline, setCurrentFrame } = useTimelineStore();
  const timeline = getTimeline();

  // Sync player playback state
  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  // Handle frame updates from player
  const handleFrameUpdate = useCallback(
    (frame: number) => {
      if (timeline && frame !== timeline.currentFrame) {
        setCurrentFrame(frame);
      }
    },
    [timeline, setCurrentFrame]
  );

  // Handle playback end
  const handleEnded = useCallback(() => {
    pause();
  }, [pause]);

  if (!timeline) return null;

  return (
    <div className="h-full flex flex-col bg-slate-200 dark:bg-slate-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative bg-black shadow-2xl rounded-lg overflow-hidden"
          style={{
            aspectRatio: `${project.settings.width} / ${project.settings.height}`,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <Player
            ref={playerRef}
            component={DynamicComposition}
            inputProps={{
              timeline,
              assets,
              width: project.settings.width,
              height: project.settings.height,
              fps: project.settings.fps,
              durationInFrames: project.settings.durationInFrames,
            }}
            durationInFrames={project.settings.durationInFrames}
            fps={project.settings.fps}
            compositionWidth={project.settings.width}
            compositionHeight={project.settings.height}
            style={{ width: '100%', height: '100%' }}
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
          />
        </div>
      </div>

      <PlaybackControls project={project} playerRef={playerRef} />
    </div>
  );
}
