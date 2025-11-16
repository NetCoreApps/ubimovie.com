'use client';

import { useState } from 'react';
import { TimelineElement as TimelineElementType } from '@/lib/types/timeline';
import { useTimelineStore } from '@/lib/stores/timeline-store';
import { useAssetStore } from '@/lib/stores/asset-store';

interface TimelineElementProps {
  element: TimelineElementType;
  fps: number;
}

export function TimelineElement({ element, fps }: TimelineElementProps) {
  const { updateElement, removeElement, selectedElements, selectElement } = useTimelineStore();
  const { getAsset } = useAssetStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, frame: 0 });

  const pixelsPerFrame = 2;
  const left = element.startFrame * pixelsPerFrame;
  const width = element.durationInFrames * pixelsPerFrame;

  const asset = element.assetId ? getAsset(element.assetId) : null;
  const isSelected = selectedElements.includes(element.id);

  const getElementColor = () => {
    switch (element.type) {
      case 'video':
        return 'bg-blue-600 dark:bg-blue-700 border-blue-500 dark:border-blue-600';
      case 'audio':
        return 'bg-green-600 dark:bg-green-700 border-green-500 dark:border-green-600';
      case 'image':
        return 'bg-purple-600 dark:bg-purple-700 border-purple-500 dark:border-purple-600';
      case 'text':
        return 'bg-yellow-600 dark:bg-yellow-700 border-yellow-500 dark:border-yellow-600';
      default:
        return 'bg-gray-600 dark:bg-gray-700 border-gray-500 dark:border-gray-600';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      frame: element.startFrame,
    });

    selectElement(element.id, e.shiftKey);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaFrames = Math.round(deltaX / pixelsPerFrame);
    const newStartFrame = Math.max(0, dragStart.frame + deltaFrames);

    updateElement(element.id, { startFrame: newStartFrame });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useState(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  const handleDoubleClick = () => {
    // Future: Open property panel
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(element.id);
  };

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-md border-2 ${getElementColor()} ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'shadow-md'
      } cursor-move overflow-hidden transition-shadow hover:shadow-lg`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="px-2 py-1 text-xs font-semibold truncate text-white drop-shadow-sm">
        {asset?.name || element.name}
      </div>

      {/* Resize handles */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/30 cursor-ew-resize hover:bg-white/60 transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/30 cursor-ew-resize hover:bg-white/60 transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
        }}
      />
    </div>
  );
}
