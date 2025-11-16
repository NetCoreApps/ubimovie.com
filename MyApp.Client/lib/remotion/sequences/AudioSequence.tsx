import React from 'react';
import { Audio } from 'remotion';
import { TimelineElement } from '@/lib/types/timeline';
import { Asset } from '@/lib/types/asset';

interface AudioElementProps {
  element: TimelineElement;
  asset?: Asset;
  mediaFrame: number;
  isMuted: boolean;
}

export const AudioElement: React.FC<AudioElementProps> = ({
  element,
  asset,
  mediaFrame,
  isMuted,
}) => {
  if (!asset) return null;

  return (
    <Audio
      src={asset.file.url}
      startFrom={mediaFrame}
      volume={isMuted ? 0 : element.properties.volume}
    />
  );
};
