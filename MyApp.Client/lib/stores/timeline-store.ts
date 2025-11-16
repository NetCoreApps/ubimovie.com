import { create } from 'zustand';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { Timeline, Track, TimelineElement } from '@/lib/types/timeline';
import { useProjectStore } from './project-store';

interface TimelineStoreState {
  selectedElements: string[];
  clipboard: TimelineElement[];

  // Track operations
  addTrack: (type: Track['type']) => void;
  removeTrack: (trackId: string) => void;
  reorderTracks: (trackIds: string[]) => void;

  // Element operations
  addElement: (trackId: string, element: Partial<TimelineElement>) => void;
  updateElement: (elementId: string, updates: Partial<TimelineElement>) => void;
  removeElement: (elementId: string) => void;
  moveElement: (elementId: string, trackId: string, startFrame: number) => void;

  // Selection
  selectElement: (elementId: string, multi?: boolean) => void;
  clearSelection: () => void;

  // Clipboard
  copy: () => void;
  paste: (trackId: string, frame: number) => void;

  // Timeline controls
  setCurrentFrame: (frame: number) => void;
  setZoomLevel: (level: number) => void;
  setScrollPosition: (position: number) => void;

  // Helpers
  getTimeline: () => Timeline | null;
  updateTimeline: (updater: (timeline: Timeline) => Timeline) => void;
}

export const useTimelineStore = create<TimelineStoreState>((set, get) => ({
  selectedElements: [],
  clipboard: [],

  getTimeline: () => {
    const project = useProjectStore.getState().getActiveProject();
    return project?.timeline || null;
  },

  updateTimeline: (updater) => {
    const project = useProjectStore.getState().getActiveProject();
    if (!project) return;

    const newTimeline = updater(project.timeline);
    useProjectStore.getState().updateProject(project.id, {
      timeline: newTimeline,
    });
  },

  addTrack: (type: Track['type']) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    const newTrack: Track = {
      id: uuidv4(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track`,
      type,
      order: timeline.tracks.length,
      elements: [],
      isLocked: false,
      isMuted: false,
      height: 80,
    };

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        draft.tracks.push(newTrack);
      })
    );
  },

  removeTrack: (trackId: string) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        draft.tracks = draft.tracks.filter(t => t.id !== trackId);
      })
    );
  },

  reorderTracks: (trackIds: string[]) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        const trackMap = new Map(draft.tracks.map(t => [t.id, t]));
        draft.tracks = trackIds.map((id, index) => {
          const track = trackMap.get(id)!;
          return { ...track, order: index };
        });
      })
    );
  },

  addElement: (trackId: string, elementData: Partial<TimelineElement>) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    const element: TimelineElement = {
      id: uuidv4(),
      trackId,
      type: 'video',
      startFrame: 0,
      durationInFrames: 90,
      trimStart: 0,
      trimEnd: 0,
      name: 'New Element',
      layer: 0,
      properties: {
        opacity: 1,
        scale: 1,
        rotation: 0,
        position: { x: 0, y: 0 },
        volume: 1,
        speed: 1,
        playbackDirection: 'forward',
        loop: false,
      },
      ...elementData,
    };

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        const track = draft.tracks.find(t => t.id === trackId);
        if (track) {
          track.elements.push(element);
        }
      })
    );
  },

  updateElement: (elementId: string, updates: Partial<TimelineElement>) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        for (const track of draft.tracks) {
          const element = track.elements.find(e => e.id === elementId);
          if (element) {
            Object.assign(element, updates);
            break;
          }
        }
      })
    );
  },

  removeElement: (elementId: string) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        for (const track of draft.tracks) {
          track.elements = track.elements.filter(e => e.id !== elementId);
        }
      })
    );

    set(state => ({
      selectedElements: state.selectedElements.filter(id => id !== elementId),
    }));
  },

  moveElement: (elementId: string, trackId: string, startFrame: number) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        let element: TimelineElement | null = null;

        // Find and remove element from current track
        for (const track of draft.tracks) {
          const index = track.elements.findIndex(e => e.id === elementId);
          if (index !== -1) {
            element = track.elements.splice(index, 1)[0];
            break;
          }
        }

        // Add to new track
        if (element) {
          element.trackId = trackId;
          element.startFrame = startFrame;
          const track = draft.tracks.find(t => t.id === trackId);
          if (track) {
            track.elements.push(element);
          }
        }
      })
    );
  },

  selectElement: (elementId: string, multi = false) => {
    set(state => ({
      selectedElements: multi
        ? [...state.selectedElements, elementId]
        : [elementId],
    }));
  },

  clearSelection: () => {
    set({ selectedElements: [] });
  },

  copy: () => {
    const timeline = get().getTimeline();
    const { selectedElements } = get();
    if (!timeline) return;

    const elements: TimelineElement[] = [];
    for (const track of timeline.tracks) {
      for (const element of track.elements) {
        if (selectedElements.includes(element.id)) {
          elements.push(element);
        }
      }
    }

    set({ clipboard: elements });
  },

  paste: (trackId: string, frame: number) => {
    const { clipboard } = get();
    if (clipboard.length === 0) return;

    const timeline = get().getTimeline();
    if (!timeline) return;

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        const track = draft.tracks.find(t => t.id === trackId);
        if (!track) return;

        clipboard.forEach(element => {
          const newElement = {
            ...element,
            id: uuidv4(),
            trackId,
            startFrame: frame,
          };
          track.elements.push(newElement);
        });
      })
    );
  },

  setCurrentFrame: (frame: number) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        draft.currentFrame = frame;
      })
    );
  },

  setZoomLevel: (level: number) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        draft.zoomLevel = level;
      })
    );
  },

  setScrollPosition: (position: number) => {
    const timeline = get().getTimeline();
    if (!timeline) return;

    get().updateTimeline((timeline) =>
      produce(timeline, draft => {
        draft.scrollPosition = position;
      })
    );
  },
}));
