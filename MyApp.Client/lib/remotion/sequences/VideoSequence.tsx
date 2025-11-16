import React from 'react';
import { OffthreadVideo, staticFile } from 'remotion';
import { TimelineElement } from '@/lib/types/timeline';
import { Asset } from '@/lib/types/asset';

interface VideoElementProps {
  element: TimelineElement;
  asset?: Asset;
  mediaFrame: number;
  isMuted: boolean;
}

export const VideoElement: React.FC<VideoElementProps> = ({
  element,
  asset,
  mediaFrame,
  isMuted,
}) => {
  if (!asset) return null;

  return (
    <OffthreadVideo
      src={asset.file.url}
      startFrom={mediaFrame}
      volume={isMuted ? 0 : element.properties.volume}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );
};
