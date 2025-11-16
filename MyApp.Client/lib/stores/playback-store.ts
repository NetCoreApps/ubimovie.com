import { create } from 'zustand';
import { useTimelineStore } from './timeline-store';

interface PlaybackStoreState {
  isPlaying: boolean;
  fps: number;
  loop: boolean;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (frame: number) => void;
  skipForward: (frames: number) => void;
  skipBackward: (frames: number) => void;
  toggleLoop: () => void;
  setFps: (fps: number) => void;
}

export const usePlaybackStore = create<PlaybackStoreState>((set, get) => ({
  isPlaying: false,
  fps: 30,
  loop: false,

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),

  seek: (frame: number) => {
    useTimelineStore.getState().setCurrentFrame(frame);
  },

  skipForward: (frames: number) => {
    const timeline = useTimelineStore.getState().getTimeline();
    if (!timeline) return;
    const newFrame = Math.min(
      timeline.currentFrame + frames,
      9999 // Max frame limit
    );
    useTimelineStore.getState().setCurrentFrame(newFrame);
  },

  skipBackward: (frames: number) => {
    const timeline = useTimelineStore.getState().getTimeline();
    if (!timeline) return;
    const newFrame = Math.max(timeline.currentFrame - frames, 0);
    useTimelineStore.getState().setCurrentFrame(newFrame);
  },

  toggleLoop: () => set(state => ({ loop: !state.loop })),

  setFps: (fps: number) => set({ fps }),
}));
