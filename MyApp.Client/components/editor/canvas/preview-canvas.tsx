'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Wait for player to be ready
  useEffect(() => {
    const timer = setTimeout(() => {
      if (playerRef.current) {
        setIsPlayerReady(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Sync player playback state
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) {
      console.log('Player not ready yet');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Starting playback');
        playerRef.current.play();
      } else {
        console.log('Pausing playback');
        playerRef.current.pause();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  }, [isPlaying, isPlayerReady]);

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
    <div className="h-full flex flex-col bg-slate-900">
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
            autoPlay={false}
            loop={false}
          />
        </div>
      </div>

      <PlaybackControls project={project} playerRef={playerRef} />
    </div>
  );
}
