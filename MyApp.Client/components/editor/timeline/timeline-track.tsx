'use client';

import { Track } from '@/lib/types/timeline';
import { TimelineElement } from './timeline-element';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { useTimelineStore } from '@/lib/stores/timeline-store';

interface TimelineTrackProps {
  track: Track;
  fps: number;
  onDrop: (e: React.DragEvent, trackId: string, frame: number) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export function TimelineTrack({ track, fps, onDrop, onDragOver }: TimelineTrackProps) {
  const { removeTrack } = useTimelineStore();
  const pixelsPerFrame = 2;

  const handleDrop = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 200; // Subtract track header width
    const frame = Math.max(0, Math.floor(x / pixelsPerFrame));
    onDrop(e, track.id, frame);
  };

  const getTrackColor = () => {
    switch (track.type) {
      case 'video':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30';
      case 'audio':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30';
      case 'text':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30';
      default:
        return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/30';
    }
  };

  return (
    <div
      className={`flex border-b border-border ${getTrackColor()}`}
      style={{ height: `${track.height}px` }}
    >
      {/* Track Header */}
      <div className="w-48 bg-slate-100 dark:bg-slate-900 border-r border-border p-2 flex flex-col justify-between shadow-sm">
        <div>
          <div className="font-semibold text-sm mb-1 truncate text-foreground">{track.name}</div>
          <div className="text-xs text-muted-foreground capitalize font-medium">{track.type}</div>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-accent">
            {track.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-accent">
            {track.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-destructive/90 hover:text-destructive-foreground"
            onClick={() => removeTrack(track.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Track Content */}
      <div
        className="flex-1 relative"
        onDrop={handleDrop}
        onDragOver={onDragOver}
      >
        {track.elements.map((element) => (
          <TimelineElement key={element.id} element={element} fps={fps} />
        ))}
      </div>
    </div>
  );
}
