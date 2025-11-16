'use client';

import { useTimelineStore } from '@/lib/stores/timeline-store';

interface TimelineRulerProps {
  fps: number;
  totalFrames: number;
}

export function TimelineRuler({ fps, totalFrames }: TimelineRulerProps) {
  const { getTimeline, setCurrentFrame } = useTimelineStore();
  const timeline = getTimeline();

  if (!timeline) return null;

  const pixelsPerFrame = 2; // Zoom level
  const totalWidth = totalFrames * pixelsPerFrame;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = Math.floor(x / pixelsPerFrame);
    setCurrentFrame(Math.min(frame, totalFrames - 1));
  };

  const markers: React.ReactElement[] = [];
  const secondInterval = fps;

  for (let frame = 0; frame <= totalFrames; frame += secondInterval) {
    const seconds = frame / fps;
    markers.push(
      <div
        key={frame}
        className="absolute top-0 bottom-0 flex flex-col"
        style={{ left: `${frame * pixelsPerFrame}px` }}
      >
        <div className="w-px h-3 bg-gray-600" />
        <span className="text-xs text-gray-500 ml-1">{seconds}s</span>
      </div>
    );
  }

  const cursorPosition = timeline.currentFrame * pixelsPerFrame;

  return (
    <div
      className="h-8 bg-gray-900 border-b border-gray-800 relative cursor-pointer overflow-x-auto"
      onClick={handleClick}
      style={{ width: '100%' }}
    >
      <div className="relative h-full" style={{ width: `${totalWidth}px` }}>
        {markers}

        {/* Current frame cursor */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 pointer-events-none z-10"
          style={{ left: `${cursorPosition}px` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
