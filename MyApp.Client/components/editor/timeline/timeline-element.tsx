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
        return 'bg-blue-600 border-blue-500';
      case 'audio':
        return 'bg-green-600 border-green-500';
      case 'image':
        return 'bg-purple-600 border-purple-500';
      case 'text':
        return 'bg-yellow-600 border-yellow-500';
      default:
        return 'bg-gray-600 border-gray-500';
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
      className={`absolute top-1 bottom-1 rounded border-2 ${getElementColor()} ${
        isSelected ? 'ring-2 ring-white' : ''
      } cursor-move overflow-hidden`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="px-2 py-1 text-xs font-medium truncate text-white">
        {asset?.name || element.name}
      </div>

      {/* Resize handles */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize hover:bg-white"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize hover:bg-white"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
        }}
      />
    </div>
  );
}
