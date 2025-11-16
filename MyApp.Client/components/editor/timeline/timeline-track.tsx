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
        return 'bg-blue-500/20 border-blue-500/30';
      case 'audio':
        return 'bg-green-500/20 border-green-500/30';
      case 'text':
        return 'bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'bg-purple-500/20 border-purple-500/30';
    }
  };

  return (
    <div
      className={`flex border-b border-gray-800 ${getTrackColor()}`}
      style={{ height: `${track.height}px` }}
    >
      {/* Track Header */}
      <div className="w-48 bg-gray-900 border-r border-gray-800 p-2 flex flex-col justify-between">
        <div>
          <div className="font-medium text-sm mb-1 truncate">{track.name}</div>
          <div className="text-xs text-gray-500 capitalize">{track.type}</div>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            {track.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            {track.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => removeTrack(track.id)}
          >
            <Trash2 className="w-3 h-3" />
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
