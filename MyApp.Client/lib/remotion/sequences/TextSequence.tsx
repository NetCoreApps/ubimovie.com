import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TimelineElement } from '@/lib/types/timeline';

interface TextElementProps {
  element: TimelineElement;
  width: number;
  height: number;
}

export const TextElement: React.FC<TextElementProps> = ({ element, width, height }) => {
  const textProps = element.properties.text;

  if (!textProps) return null;

  return (
    <AbsoluteFill
      style={{
        fontFamily: textProps.fontFamily || 'Arial',
        fontSize: textProps.fontSize || 48,
        color: textProps.color || '#FFFFFF',
        backgroundColor: textProps.backgroundColor,
        textAlign: textProps.alignment || 'center',
        fontWeight: textProps.fontWeight || 400,
        letterSpacing: textProps.letterSpacing || 0,
        lineHeight: textProps.lineHeight || 1.2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        wordWrap: 'break-word',
      }}
    >
      {textProps.content}
    </AbsoluteFill>
  );
};
