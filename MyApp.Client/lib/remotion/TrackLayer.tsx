import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Track } from '@/lib/types/timeline';
import { Asset } from '@/lib/types/asset';
import { ElementSequence } from './ElementSequence';

interface TrackLayerProps {
  track: Track;
  assets: Asset[];
  zIndex: number;
  width: number;
  height: number;
}

export const TrackLayer: React.FC<TrackLayerProps> = ({
  track,
  assets,
  zIndex,
  width,
  height,
}) => {
  if (track.isMuted && track.type === 'audio') {
    return null;
  }

  return (
    <AbsoluteFill style={{ zIndex }}>
      {track.elements.map((element) => (
        <ElementSequence
          key={element.id}
          element={element}
          assets={assets}
          isMuted={track.isMuted}
          width={width}
          height={height}
        />
      ))}
    </AbsoluteFill>
  );
};
