import React from 'react';
import { Sequence, AbsoluteFill, useCurrentFrame } from 'remotion';
import { TimelineElement } from '@/lib/types/timeline';
import { Asset } from '@/lib/types/asset';
import { VideoElement } from './sequences/VideoSequence';
import { ImageElement } from './sequences/ImageSequence';
import { AudioElement } from './sequences/AudioSequence';
import { TextElement } from './sequences/TextSequence';

interface ElementSequenceProps {
  element: TimelineElement;
  assets: Asset[];
  isMuted: boolean;
  width: number;
  height: number;
}

export const ElementSequence: React.FC<ElementSequenceProps> = ({
  element,
  assets,
  isMuted,
  width,
  height,
}) => {
  const frame = useCurrentFrame();

  // Calculate media frame accounting for speed and direction
  const relativeFrame = frame - element.startFrame;
  const mediaFrame =
    element.properties.playbackDirection === 'forward'
      ? Math.floor(relativeFrame * element.properties.speed) + element.trimStart
      : element.durationInFrames -
        Math.floor(relativeFrame * element.properties.speed) -
        1 +
        element.trimStart;

  return (
    <Sequence from={element.startFrame} durationInFrames={element.durationInFrames}>
      <AbsoluteFill
        style={{
          opacity: element.properties.opacity,
          transform: `
            translate(${element.properties.position.x}px, ${element.properties.position.y}px)
            scale(${element.properties.scale})
            rotate(${element.properties.rotation}deg)
          `,
          transformOrigin: 'center center',
        }}
      >
        {element.type === 'video' && element.assetId && (
          <VideoElement
            element={element}
            asset={assets.find((a) => a.id === element.assetId)}
            mediaFrame={mediaFrame}
            isMuted={isMuted}
          />
        )}
        {element.type === 'image' && element.assetId && (
          <ImageElement
            element={element}
            asset={assets.find((a) => a.id === element.assetId)}
          />
        )}
        {element.type === 'audio' && element.assetId && (
          <AudioElement
            element={element}
            asset={assets.find((a) => a.id === element.assetId)}
            mediaFrame={mediaFrame}
            isMuted={isMuted}
          />
        )}
        {element.type === 'text' && (
          <TextElement element={element} width={width} height={height} />
        )}
      </AbsoluteFill>
    </Sequence>
  );
};
