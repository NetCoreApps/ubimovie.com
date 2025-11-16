'use client';

import { useState } from 'react';
import { Project } from '@/lib/types/project';
import { useTimelineStore } from '@/lib/stores/timeline-store';
import { useAssetStore } from '@/lib/stores/asset-store';
import { TimelineTrack } from './timeline-track';
import { TimelineRuler } from './timeline-ruler';
import { Button } from '@/components/ui/button';
import { Plus, Video, Music, Type } from 'lucide-react';

interface TimelineContainerProps {
  project: Project;
}

export function TimelineContainer({ project }: TimelineContainerProps) {
  const { getTimeline, addTrack, addElement } = useTimelineStore();
  const { getAsset } = useAssetStore();
  const timeline = getTimeline();
  const [draggedAssetId, setDraggedAssetId] = useState<string | null>(null);

  if (!timeline) return null;

  const handleDrop = (e: React.DragEvent, trackId: string, frame: number) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData('assetId');
    const assetType = e.dataTransfer.getData('assetType');

    if (assetId && assetType) {
      const asset = getAsset(assetId);
      if (!asset) return;

      const durationInFrames = asset.metadata.duration
        ? Math.floor(asset.metadata.duration * project.settings.fps)
        : 90; // Default 3 seconds

      addElement(trackId, {
        assetId,
        type: asset.type as any,
        name: asset.name,
        startFrame: frame,
        durationInFrames,
      });
    }
    setDraggedAssetId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-12 bg-gray-900 border-b border-gray-800 px-4 flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => addTrack('video')}>
          <Video className="w-4 h-4 mr-1" />
          Add Video Track
        </Button>
        <Button size="sm" variant="ghost" onClick={() => addTrack('audio')}>
          <Music className="w-4 h-4 mr-1" />
          Add Audio Track
        </Button>
        <Button size="sm" variant="ghost" onClick={() => addTrack('text')}>
          <Type className="w-4 h-4 mr-1" />
          Add Text Track
        </Button>
      </div>

      {/* Timeline Ruler */}
      <TimelineRuler fps={project.settings.fps} totalFrames={project.settings.durationInFrames} />

      {/* Tracks */}
      <div className="flex-1 overflow-y-auto">
        {timeline.tracks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tracks yet</p>
              <p className="text-xs">Add a track to get started</p>
            </div>
          </div>
        ) : (
          timeline.tracks.map((track) => (
            <TimelineTrack
              key={track.id}
              track={track}
              fps={project.settings.fps}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          ))
        )}
      </div>
    </div>
  );
}
