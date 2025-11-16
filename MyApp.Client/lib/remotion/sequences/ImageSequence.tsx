import React from 'react';
import { Img } from 'remotion';
import { TimelineElement } from '@/lib/types/timeline';
import { Asset } from '@/lib/types/asset';

interface ImageElementProps {
  element: TimelineElement;
  asset?: Asset;
}

export const ImageElement: React.FC<ImageElementProps> = ({ element, asset }) => {
  if (!asset) return null;

  return (
    <Img
      src={asset.file.url}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );
};
