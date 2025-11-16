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

  // Wait for player to be ready with better detection
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;
    let timeoutId: NodeJS.Timeout;

    const checkPlayerReady = () => {
      if (playerRef.current) {
        try {
          // Try to get current frame as a test of readiness
          playerRef.current.getCurrentFrame();
          console.log('Player is ready!');
          setIsPlayerReady(true);
          return;
        } catch (error) {
          console.log('Player not ready yet, attempt:', attempts + 1);
        }
      }

      attempts++;
      if (attempts < maxAttempts) {
        timeoutId = setTimeout(checkPlayerReady, 100);
      } else {
        console.error('Player failed to initialize after', maxAttempts, 'attempts');
      }
    };

    timeoutId = setTimeout(checkPlayerReady, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Sync current frame to player when timeline changes
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) {
      return;
    }

    try {
      const currentPlayerFrame = playerRef.current.getCurrentFrame();
      if (timeline && currentPlayerFrame !== timeline.currentFrame) {
        playerRef.current.seekTo(timeline.currentFrame);
      }
    } catch (error) {
      console.error('Error seeking player:', error);
    }
  }, [timeline?.currentFrame, isPlayerReady]);

  // Sync player playback state
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) {
      console.log('Player not ready for playback control');
      return;
    }

    try {
      const player = playerRef.current;
      console.log('Current player state:', {
        isPlaying,
        currentFrame: player.getCurrentFrame(),
        isPlayerPlaying: player.isPlaying(),
      });

      if (isPlaying) {
        console.log('Calling play() on player');
        player.play();

        // Verify playback started
        setTimeout(() => {
          console.log('Playback verification:', {
            isPlayerPlaying: player.isPlaying(),
            currentFrame: player.getCurrentFrame(),
          });
        }, 100);
      } else {
        console.log('Calling pause() on player');
        player.pause();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  }, [isPlaying, isPlayerReady]);

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
            renderLoading={() => (
              <div className="flex items-center justify-center h-full bg-black">
                <div className="text-white">Loading...</div>
              </div>
            )}
            errorFallback={(error) => (
              <div className="flex items-center justify-center h-full bg-red-900/20">
                <div className="text-red-400">Error: {error.message}</div>
              </div>
            )}
          />
        </div>
      </div>

      <PlaybackControls project={project} playerRef={playerRef} />
    </div>
  );
}
