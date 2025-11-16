import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CompositionProps } from './Root';
import { TrackLayer } from './TrackLayer';

export const DynamicComposition: React.FC<Record<string, unknown>> = (props) => {
  const { timeline, assets, width, height } = props as unknown as CompositionProps;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {timeline.tracks.map((track, index) => (
        <TrackLayer
          key={track.id}
          track={track}
          assets={assets}
          zIndex={index}
          width={width}
          height={height}
        />
      ))}
    </AbsoluteFill>
  );
};
