import React from 'react';
import { Composition } from 'remotion';
import { DynamicComposition } from './Composition';
import { Timeline } from '@/lib/types/timeline';
import { Asset } from '@/lib/types/asset';

export interface CompositionProps {
  timeline: Timeline;
  assets: Asset[];
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export const RemotionRoot: React.FC = () => {
  const defaultProps: CompositionProps = {
    timeline: {
      tracks: [],
      currentFrame: 0,
      zoomLevel: 1,
      scrollPosition: 0,
    },
    assets: [],
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 900,
  };

  return (
    <>
      <Composition
        id="DynamicComposition"
        component={DynamicComposition}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
