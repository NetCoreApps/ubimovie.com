'use client';

import { RefObject } from 'react';
import { PlayerRef } from '@remotion/player';
import { Project } from '@/lib/types/project';
import { usePlaybackStore } from '@/lib/stores/playback-store';
import { useTimelineStore } from '@/lib/stores/timeline-store';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface PlaybackControlsProps {
  project: Project;
  playerRef: RefObject<PlayerRef | null>;
}

export function PlaybackControls({ project, playerRef }: PlaybackControlsProps) {
  const { isPlaying, togglePlay, skipForward, skipBackward } = usePlaybackStore();
  const { getTimeline } = useTimelineStore();
  const timeline = getTimeline();

  if (!timeline) return null;

  const currentFrame = timeline.currentFrame;
  const totalFrames = project.settings.durationInFrames;
  const fps = project.settings.fps;

  const formatTime = (frames: number) => {
    const totalSeconds = frames / fps;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const frames_remainder = Math.floor(frames % fps);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}:${frames_remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-16 bg-gray-900 border-t border-gray-800 px-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => skipBackward(30)}
          title="Go back 1 second"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="default"
          onClick={togglePlay}
          className="w-12 h-12"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => skipForward(30)}
          title="Go forward 1 second"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm font-mono">
        <span>{formatTime(currentFrame)}</span>
        <span className="text-gray-600">/</span>
        <span className="text-gray-400">{formatTime(totalFrames)}</span>
      </div>

      <div className="ml-auto text-sm text-gray-400">
        Frame: {currentFrame} / {totalFrames}
      </div>
    </div>
  );
}
