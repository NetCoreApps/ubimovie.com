# **Movie Creator Web App - Technical Specification**

## **Executive Summary**

A browser-based video editing platform built with Next.js 14+, React, TailwindCSS, Zustand, and Remotion that enables users to create, edit, and render video projects with a timeline-based editor similar to CapCut or iMovie.

---

## **1. Technical Stack**

### **Core Technologies**
- **Framework**: Next.js 16+ (App Router)
- **UI Library**: React 19+
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand (with middleware for persistence)
- **Video Engine**: Remotion 4.x
- **Storage**:
  - Primary: IndexedDB (via Dexie.js)
  - Optional: PostgreSQL
- **File Handling**: Browser File System Access API (with fallbacks)
- **Rendering**: Remotion local rendering
- **Deployment**: Kamal + Docker

### **Supporting Libraries**
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Media Processing**: FFmpeg.wasm (browser-based video manipulation)
- **Timeline UI**: Custom implementation with Framer Motion
- **Icons**: Lucide React
- **Form Validation**: Zod
- **Date/Time**: date-fns
- **Video Playback**: React Player (for preview)
- **Audio Visualization**: WaveSurfer.js

---

## **2. System Architecture**

### **2.1 High-Level Architecture**

```
┌─────────────────────────────────────────────────────┐
│                 Next.js App Router                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │   Dashboard  │  │    Editor    │  │  Render  │   │
│  │     Page     │  │     Page     │  │   Page   │   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│              Zustand State Management               │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Project    │ │   Timeline   │ │   Playback   │  │
│  │   Store     │ │    Store     │ │    Store     │  │
│  └─────────────┘ └──────────────┘ └──────────────┘  │
├─────────────────────────────────────────────────────┤
│                  Service Layer                      │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   Storage   │ │    Asset     │ │   Remotion   │  │
│  │   Service   │ │   Manager    │ │   Renderer   │  │
│  └─────────────┘ └──────────────┘ └──────────────┘  │
├─────────────────────────────────────────────────────┤
│              Data Persistence Layer                 │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  IndexedDB  │ │   Supabase   │ │ File System  │  │
│  │  (Dexie)    │ │  (Optional)  │ │     API      │  │
│  └─────────────┘ └──────────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────┘
```

### **2.2 Folder Structure**

```
MyApp.Client/
├── app/
│   ├── (auth)/                    # Auth-related pages (future)
│   ├── (marketing)/               # Landing, pricing pages
│   ├── dashboard/
│   │   ├── page.tsx              # Project list dashboard
│   │   └── layout.tsx
│   ├── editor/
│   │   └── [projectId]/
│   │       ├── page.tsx          # Main editor
│   │       └── layout.tsx
│   ├── render/
│   │   └── [projectId]/
│   │       └── page.tsx          # Render queue page
│   ├── api/
│   │   ├── projects/
│   │   │   ├── route.ts          # CRUD operations
│   │   │   └── [id]/route.ts
│   │   ├── assets/
│   │   │   └── route.ts          # Asset upload/management
│   │   └── render/
│   │       └── route.ts          # Trigger rendering
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── dashboard/
│   │   ├── project-card.tsx
│   │   ├── project-grid.tsx
│   │   └── create-project-dialog.tsx
│   ├── editor/
│   │   ├── toolbar/
│   │   │   ├── left-toolbar.tsx
│   │   │   ├── asset-library.tsx
│   │   │   ├── text-tool.tsx
│   │   │   └── upload-asset.tsx
│   │   ├── canvas/
│   │   │   ├── preview-canvas.tsx
│   │   │   ├── remotion-player.tsx
│   │   │   └── playback-controls.tsx
│   │   ├── timeline/
│   │   │   ├── timeline-container.tsx
│   │   │   ├── timeline-track.tsx
│   │   │   ├── timeline-element.tsx
│   │   │   ├── timeline-ruler.tsx
│   │   │   ├── timeline-cursor.tsx
│   │   │   └── property-panel.tsx
│   │   └── editor-layout.tsx
│   ├── render/
│   │   ├── render-queue.tsx
│   │   ├── render-progress.tsx
│   │   └── render-settings.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── slider.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/
│   ├── stores/
│   │   ├── project-store.ts      # Project CRUD state
│   │   ├── timeline-store.ts     # Timeline state (tracks, elements)
│   │   ├── playback-store.ts     # Playback controls state
│   │   └── asset-store.ts        # Asset management state
│   ├── services/
│   │   ├── storage/
│   │   │   ├── indexeddb.ts     # Dexie wrapper
│   │   │   ├── supabase.ts      # Supabase client
│   │   │   └── storage-adapter.ts
│   │   ├── asset-manager.ts     # Asset upload/processing
│   │   ├── remotion-renderer.ts # Rendering logic
│   │   └── export-manager.ts    # Export/download
│   ├── remotion/
│   │   ├── Root.tsx             # Remotion root
│   │   ├── Composition.tsx      # Main composition
│   │   ├── sequences/
│   │   │   ├── VideoSequence.tsx
│   │   │   ├── ImageSequence.tsx
│   │   │   ├── AudioSequence.tsx
│   │   │   └── TextSequence.tsx
│   │   └── utils/
│   │       ├── fps-calculator.ts
│   │       └── frame-converter.ts
│   ├── types/
│   │   ├── project.ts
│   │   ├── timeline.ts
│   │   ├── asset.ts
│   │   └── render.ts
│   ├── hooks/
│   │   ├── use-timeline.ts
│   │   ├── use-playback.ts
│   │   ├── use-keyboard-shortcuts.ts
│   │   └── use-drag-drop.ts
│   └── utils/
│       ├── timeline-helpers.ts
│       ├── file-helpers.ts
│       └── format-helpers.ts
│
├── public/
│   └── assets/                   # Default templates/assets
│
├── remotion.config.ts
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## **3. Data Models**

### **3.1 Project Model**

```typescript
interface Project {
  id: string;                    // UUID
  name: string;
  description?: string;
  thumbnail?: string;            // Base64 or URL
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
  timeline: Timeline;
  assets: Asset[];
  metadata: ProjectMetadata;
}

interface ProjectSettings {
  width: number;                 // Default: 1920
  height: number;                // Default: 1080
  fps: number;                   // Default: 30
  durationInFrames: number;      // Total project duration
  backgroundColor: string;       // Default: '#000000'
}

interface ProjectMetadata {
  version: string;               // App version for compatibility
  totalSize: number;             // In bytes
  assetCount: number;
  trackCount: number;
}
```

### **3.2 Timeline Model**

```typescript
interface Timeline {
  tracks: Track[];
  currentFrame: number;          // Current playback position
  zoomLevel: number;             // Timeline zoom (px per frame)
  scrollPosition: number;
}

interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'overlay';
  order: number;                 // Vertical stacking order
  elements: TimelineElement[];
  isLocked: boolean;
  isMuted: boolean;
  height: number;                // Track height in pixels
}

interface TimelineElement {
  id: string;
  trackId: string;
  assetId?: string;              // Reference to Asset (if applicable)
  type: 'video' | 'image' | 'audio' | 'text' | 'shape';

  // Timeline positioning
  startFrame: number;            // Start position on timeline
  durationInFrames: number;      // Visual duration on timeline

  // Media trimming
  trimStart: number;             // Trim from start (in frames)
  trimEnd: number;               // Trim from end (in frames)

  // Transformations
  properties: ElementProperties;

  // Metadata
  name: string;
  layer: number;                 // Z-index within track
}

interface ElementProperties {
  // Visual
  opacity: number;               // 0-1
  scale: number;                 // 0.1-5
  rotation: number;              // 0-360
  position: { x: number; y: number }; // Canvas position

  // Audio
  volume: number;                // 0-1

  // Playback
  speed: number;                 // 0.25-4x
  playbackDirection: 'forward' | 'reverse';
  loop: boolean;

  // Text-specific
  text?: TextProperties;

  // Transitions
  transitionIn?: Transition;
  transitionOut?: Transition;
}

interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  alignment: 'left' | 'center' | 'right';
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
}

interface Transition {
  type: 'fade' | 'slide' | 'zoom' | 'wipe';
  duration: number;              // In frames
  easing: string;                // CSS easing function
}
```

### **3.3 Asset Model**

```typescript
interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: 'video' | 'audio' | 'image';

  // File information
  file: {
    url: string;                 // Blob URL or remote URL
    size: number;                // In bytes
    mimeType: string;
    originalName: string;
  };

  // Media metadata
  metadata: MediaMetadata;

  // Storage
  storageType: 'indexeddb' | 'supabase' | 'url';
  storageKey?: string;           // Key in storage

  // Timestamps
  uploadedAt: Date;
  lastAccessedAt: Date;
}

interface MediaMetadata {
  duration?: number;             // In seconds (video/audio)
  width?: number;                // Video/image
  height?: number;               // Video/image
  fps?: number;                  // Video
  hasAudio?: boolean;            // Video
  thumbnail?: string;            // Base64 preview
  waveform?: number[];           // Audio waveform data
}
```

### **3.4 Render Job Model**

```typescript
interface RenderJob {
  id: string;
  projectId: string;
  status: 'pending' | 'rendering' | 'completed' | 'failed';

  settings: RenderSettings;

  progress: {
    currentFrame: number;
    totalFrames: number;
    percentage: number;
  };

  output?: {
    url: string;
    size: number;
    duration: number;
  };

  error?: string;

  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface RenderSettings {
  codec: 'h264' | 'h265' | 'vp8' | 'vp9';
  format: 'mp4' | 'webm' | 'mov';
  quality: number;               // 0-100
  frameRange?: {
    start: number;
    end: number;
  };
}
```

---

## **4. State Management Architecture**

### **4.1 Zustand Store Structure**

**Project Store** (`project-store.ts`)
- Manages all projects
- CRUD operations
- Active project selection
- Persistence to IndexedDB

```typescript
interface ProjectStoreState {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createProject: (name: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string) => void;
  loadProjects: () => Promise<void>;
}
```

**Timeline Store** (`timeline-store.ts`)
- Manages timeline state for active project
- Track and element manipulation
- Undo/redo functionality
- Auto-save

```typescript
interface TimelineStoreState {
  timeline: Timeline;
  selectedElements: string[];
  clipboard: TimelineElement[];
  history: TimelineHistory;

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

  // History
  undo: () => void;
  redo: () => void;

  // Timeline controls
  setCurrentFrame: (frame: number) => void;
  setZoomLevel: (level: number) => void;
}
```

**Playback Store** (`playback-store.ts`)
- Controls playback state
- Synchronizes with Remotion Player
- Handles scrubbing and seeking

```typescript
interface PlaybackStoreState {
  isPlaying: boolean;
  currentFrame: number;
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
}
```

**Asset Store** (`asset-store.ts`)
- Manages uploaded assets
- Handles file processing
- Manages asset library

```typescript
interface AssetStoreState {
  assets: Asset[];
  isUploading: boolean;
  uploadProgress: { [key: string]: number };

  // Actions
  uploadAsset: (file: File) => Promise<Asset>;
  uploadFromUrl: (url: string) => Promise<Asset>;
  deleteAsset: (assetId: string) => Promise<void>;
  getAsset: (assetId: string) => Asset | undefined;
  processAssetMetadata: (asset: Asset) => Promise<void>;
}
```

### **4.2 State Persistence Strategy**

**IndexedDB Schema** (via Dexie.js)

```typescript
class MovieCreatorDB extends Dexie {
  projects!: Table<Project>;
  assets!: Table<Asset>;
  renderJobs!: Table<RenderJob>;

  constructor() {
    super('MovieCreatorDB');
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      assets: 'id, projectId, type, uploadedAt',
      renderJobs: 'id, projectId, status, createdAt'
    });
  }
}
```

**Middleware for Auto-Persistence**

```typescript
// Zustand middleware that syncs to IndexedDB
const persistMiddleware = (store) => {
  store.subscribe((state) => {
    // Debounced save to IndexedDB
    debouncedSave(state);
  });
};
```

---

## **5. Editor Components Architecture**

### **5.1 Left Toolbar Component**

**Features:**
- Collapsible panels
- Asset library with thumbnails
- Drag-to-timeline functionality
- Upload UI with progress
- Text/shape tools

**Component Structure:**
```
LeftToolbar
├── AssetLibraryPanel
│   ├── AssetUploadZone
│   ├── AssetGrid
│   │   └── AssetCard (draggable)
│   └── AssetFilters
├── TextToolPanel
│   ├── TextTemplates
│   └── TextStyleEditor
└── ShapeToolPanel
    └── ShapeLibrary
```

**Key Implementation Details:**
- Use `@dnd-kit` for drag-from-library to timeline
- Lazy load asset thumbnails for performance
- Use virtual scrolling for large asset lists (react-window)
- Store blob URLs in memory, actual files in IndexedDB

### **5.2 Canvas / Preview Component**

**Features:**
- Live Remotion composition preview
- Synchronized playback with timeline
- Responsive sizing
- Safe area guides
- Element selection overlay

**Component Structure:**
```
PreviewCanvas
├── RemotionPlayer
├── PlaybackControls
│   ├── PlayButton
│   ├── TimeDisplay
│   ├── FrameScrubber
│   └── VolumeControl
└── CanvasOverlay
    ├── SafeAreaGuides
    └── SelectionIndicators
```

**Technical Approach:**

1. **Remotion Player Integration:**
   - Use `<Player>` component from `@remotion/player`
   - Sync player's `currentFrame` with timeline store
   - Handle player events (play, pause, seek, ended)

2. **Dynamic Composition:**
   - Remotion composition is generated from timeline state
   - Each track becomes a layer of sequences
   - Properties map directly to Remotion props

3. **Performance Optimization:**
   - Use `delayRender()` for asset loading
   - Implement frame caching for repeated renders
   - Use `<OffthreadVideo>` for better performance

### **5.3 Timeline Component**

**Features:**
- Multi-track timeline with layers
- Drag and drop elements
- Resize elements (trim)
- Snap to grid/cursor
- Zoom and pan
- Ruler with frame numbers
- Property inspector panel

**Component Structure:**
```
TimelineContainer
├── TimelineHeader
│   ├── TrackControls
│   └── TimelineRuler
├── TimelineBody
│   ├── TimelineTracks (virtualized)
│   │   └── TimelineTrack
│   │       └── TimelineElement (draggable, resizable)
│   └── TimelineCursor
└── PropertyPanel
    └── ElementPropertyEditor
```

**Interaction Patterns:**

1. **Drag and Drop:**
   - Use `@dnd-kit/core` for DnD
   - Support: drag from toolbar, drag between tracks, reorder
   - Show drop indicators
   - Implement snap-to-frame logic

2. **Resize/Trim:**
   - Click and drag element edges
   - Update `durationInFrames` and `trimStart/trimEnd`
   - Show tooltip with duration

3. **Scrubbing:**
   - Click/drag on ruler to seek
   - Smooth animation with `requestAnimationFrame`
   - Sync with Remotion Player

4. **Zoom and Pan:**
   - Zoom: Ctrl+Scroll (adjust `zoomLevel` in pixels per frame)
   - Pan: Shift+Scroll or drag on ruler
   - Implement smooth zoom to cursor position

**Timeline Rendering Strategy:**

```typescript
// Calculate visible timeline range based on scroll and zoom
const visibleStartFrame = scrollPosition / zoomLevel;
const visibleEndFrame = visibleStartFrame + (viewportWidth / zoomLevel);

// Only render elements within visible range (virtual scrolling)
const visibleElements = elements.filter(el =>
  el.startFrame < visibleEndFrame &&
  (el.startFrame + el.durationInFrames) > visibleStartFrame
);
```

---

## **6. Remotion Integration Architecture**

### **6.1 Timeline State → Remotion Mapping**

**Core Concept:**
Transform timeline state into a Remotion composition tree where:
- Each timeline track = vertical layer
- Each timeline element = `<Sequence>` with specific props

**Mapping Strategy:**

```typescript
// Main composition that receives timeline state
export const DynamicComposition: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  return (
    <AbsoluteFill>
      {timeline.tracks.map((track, index) => (
        <TrackLayer key={track.id} track={track} zIndex={index} />
      ))}
    </AbsoluteFill>
  );
};

// Individual track renderer
const TrackLayer: React.FC<{ track: Track; zIndex: number }> = ({ track, zIndex }) => {
  return (
    <AbsoluteFill style={{ zIndex }}>
      {track.elements.map(element => (
        <ElementSequence key={element.id} element={element} />
      ))}
    </AbsoluteFill>
  );
};

// Element renderer with all transformations
const ElementSequence: React.FC<{ element: TimelineElement }> = ({ element }) => {
  const frame = useCurrentFrame();

  // Calculate actual media playback frame accounting for speed and direction
  const mediaFrame = calculateMediaFrame(
    frame,
    element.startFrame,
    element.properties.speed,
    element.properties.playbackDirection
  );

  return (
    <Sequence
      from={element.startFrame}
      durationInFrames={element.durationInFrames}
    >
      <AbsoluteFill
        style={{
          opacity: element.properties.opacity,
          transform: `
            translate(${element.properties.position.x}px, ${element.properties.position.y}px)
            scale(${element.properties.scale})
            rotate(${element.properties.rotation}deg)
          `
        }}
      >
        {renderElementContent(element, mediaFrame)}
      </AbsoluteFill>
    </Sequence>
  );
};
```

### **6.2 Element Type Renderers**

**Video Element:**
```typescript
const VideoElement: React.FC<{ element: TimelineElement; frame: number }> = ({ element, frame }) => {
  const asset = useAsset(element.assetId);

  // Calculate trimmed frame accounting for speed
  const trimmedFrame = Math.floor(
    (frame * element.properties.speed) + element.trimStart
  );

  return (
    <OffthreadVideo
      src={asset.file.url}
      startFrom={trimmedFrame}
      volume={element.properties.volume}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
```

**Image Element:**
```typescript
const ImageElement: React.FC<{ element: TimelineElement }> = ({ element }) => {
  const asset = useAsset(element.assetId);

  return (
    <Img
      src={asset.file.url}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  );
};
```

**Audio Element:**
```typescript
const AudioElement: React.FC<{ element: TimelineElement; frame: number }> = ({ element, frame }) => {
  const asset = useAsset(element.assetId);

  return (
    <Audio
      src={asset.file.url}
      startFrom={element.trimStart}
      volume={element.properties.volume}
    />
  );
};
```

**Text Element:**
```typescript
const TextElement: React.FC<{ element: TimelineElement }> = ({ element }) => {
  const { text } = element.properties;

  return (
    <AbsoluteFill
      style={{
        fontFamily: text.fontFamily,
        fontSize: text.fontSize,
        color: text.color,
        textAlign: text.alignment,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {text.content}
    </AbsoluteFill>
  );
};
```

### **6.3 Advanced Playback Features**

**Reverse Playback:**
```typescript
const calculateReverseFrame = (currentFrame: number, duration: number) => {
  return duration - currentFrame - 1;
};
```

**Speed Adjustment:**
```typescript
const calculateSpeedAdjustedFrame = (frame: number, speed: number) => {
  return Math.floor(frame * speed);
};
```

**Looping:**
```typescript
const calculateLoopedFrame = (frame: number, duration: number) => {
  return frame % duration;
};
```

### **6.4 Transitions Implementation**

**Fade Transition:**
```typescript
const FadeTransition: React.FC<{ progress: number; type: 'in' | 'out' }> = ({ progress, type }) => {
  const opacity = type === 'in' ? progress : 1 - progress;

  return (
    <AbsoluteFill style={{ opacity: interpolate(opacity, [0, 1], [0, 1]) }} />
  );
};
```

---

## **7. Rendering Pipeline**

### **7.1 Render Flow Architecture**

```
User clicks "Export"
  → Validate timeline
  → Create RenderJob
  → Choose rendering method:
    ├─ Browser-based (Small projects, < 30s)
    │   └─ Use @remotion/renderer in Web Worker
    └─ Cloud-based (Large projects)
        └─ Use Remotion Lambda or Cloud Run
  → Update progress in real-time
  → Generate final video file
  → Save to downloads or cloud storage
  → Update RenderJob status
```

### **7.2 Browser-Based Rendering**

**Implementation Strategy:**

```typescript
// lib/services/remotion-renderer.ts
import { bundle } from '@remotion/bundler';
import { renderMedia } from '@remotion/renderer';

export async function renderProjectInBrowser(
  project: Project,
  onProgress: (progress: number) => void
): Promise<Blob> {
  // Step 1: Bundle Remotion composition
  const bundled = await bundle({
    entryPoint: '/lib/remotion/Root.tsx',
    webpackOverride: (config) => config,
  });

  // Step 2: Render to video
  const outputBlob = await renderMedia({
    composition: {
      id: 'DynamicComposition',
      width: project.settings.width,
      height: project.settings.height,
      fps: project.settings.fps,
      durationInFrames: project.settings.durationInFrames,
    },
    serveUrl: bundled,
    codec: 'h264',
    onProgress: ({ renderedFrames, totalFrames }) => {
      onProgress((renderedFrames / totalFrames) * 100);
    },
  });

  return outputBlob;
}
```

**Constraints:**
- Limited to short videos (< 1 min) due to browser memory
- Slower than server-side rendering
- No GPU acceleration in browser

### **7.3 Cloud Rendering with Remotion Lambda**

**Setup:**
1. Deploy Remotion Lambda function to AWS
2. Configure S3 bucket for output storage
3. Set up webhook for progress updates

**Implementation:**
```typescript
import { renderMediaOnLambda } from '@remotion/lambda/client';

export async function renderProjectOnCloud(
  project: Project,
  renderJob: RenderJob
): Promise<string> {
  const { renderId } = await renderMediaOnLambda({
    region: 'us-east-1',
    functionName: 'remotion-render',
    composition: 'DynamicComposition',
    serveUrl: DEPLOYED_BUNDLE_URL,
    inputProps: { timeline: project.timeline, assets: project.assets },
    codec: 'h264',
    onProgress: (progress) => {
      updateRenderJobProgress(renderJob.id, progress);
    },
  });

  // Poll for completion
  const outputUrl = await pollRenderStatus(renderId);
  return outputUrl;
}
```

### **7.4 Render Queue System**

**Features:**
- Multiple concurrent renders
- Priority queue
- Cancel/retry functionality
- Progress notifications

**Queue Management:**
```typescript
interface RenderQueueState {
  jobs: RenderJob[];
  activeJobs: string[];
  maxConcurrent: number;

  addToQueue: (job: RenderJob) => void;
  processQueue: () => void;
  cancelJob: (jobId: string) => void;
  retryJob: (jobId: string) => void;
}
```

---

## **8. Performance Optimizations**

### **8.1 Large File Handling**

**Strategies:**

1. **Lazy Loading Assets:**
   - Only load assets into memory when needed
   - Use blob URLs for in-memory references
   - Store actual files in IndexedDB with chunking

2. **Asset Compression:**
   - Compress images before storing (WebP format)
   - Generate lower-resolution proxies for timeline preview
   - Use FFmpeg.wasm to transcode videos to web-friendly formats

3. **Streaming:**
   - Use `ReadableStream` for large file uploads
   - Chunk large files for IndexedDB storage (max 50MB per chunk)

```typescript
async function storeAssetInChunks(file: File): Promise<string[]> {
  const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB
  const chunks: string[] = [];

  for (let i = 0; i < file.size; i += CHUNK_SIZE) {
    const chunk = file.slice(i, i + CHUNK_SIZE);
    const chunkId = await db.assetChunks.add({
      data: await chunk.arrayBuffer(),
    });
    chunks.push(chunkId);
  }

  return chunks;
}
```

### **8.2 Timeline Rendering Performance**

**Optimizations:**

1. **Virtual Scrolling:**
   - Only render visible tracks and elements
   - Use `react-window` or `react-virtuoso`

2. **Canvas-Based Timeline (Alternative):**
   - Render timeline on HTML5 Canvas instead of DOM
   - Significantly faster for 100+ elements
   - Use `konva.js` or custom canvas implementation

3. **Debounced Updates:**
   - Debounce drag/resize events
   - Batch state updates with `unstable_batchedUpdates`

4. **Memoization:**
   - Memoize timeline element components
   - Use `React.memo` with custom comparison functions

### **8.3 Remotion Player Optimization**

**Techniques:**

1. **Frame Caching:**
   - Cache rendered frames in memory
   - Use LRU cache to prevent memory overflow

2. **Lazy Asset Loading:**
   - Use `delayRender()` and `continueRender()` properly
   - Load assets only when sequence is active

3. **Reduce Composition Complexity:**
   - Split complex compositions into sub-compositions
   - Use `<Sequence>` strategically to prevent unnecessary renders

4. **Use Web Workers:**
   - Offload heavy calculations to Web Workers
   - Process audio waveforms in background

---

## **9. User Experience & UI Design**

### **9.1 Design System with Tailwind + shadcn/ui**

**Color Palette:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { /* Brand colors */ },
        timeline: {
          bg: '#1a1a1a',
          track: '#2d2d2d',
          element: {
            video: '#3b82f6',
            audio: '#10b981',
            text: '#f59e0b',
            image: '#8b5cf6',
          },
        },
        canvas: {
          bg: '#0f0f0f',
          grid: '#2a2a2a',
        },
      },
    },
  },
};
```

**Component Patterns:**

1. **Dashboard:**
   - Grid layout for projects
   - Hover effects on cards
   - Modal dialogs for create/rename/delete
   - Search and filter bar

2. **Editor:**
   - Dark theme optimized for video editing
   - High contrast for UI elements
   - Color-coded element types
   - Tooltips for all tools

3. **Responsive Design:**
   - Desktop-first (1920x1080 minimum recommended)
   - Tablet support (1024px+) with simplified timeline
   - Mobile: View-only mode or redirect to desktop

### **9.2 Keyboard Shortcuts**

**Essential Shortcuts:**
```
Space         - Play/Pause
Left/Right    - Frame forward/back
Shift+Left    - 10 frames back
Shift+Right   - 10 frames forward
Home          - Jump to start
End           - Jump to end
Delete        - Delete selected element
Cmd/Ctrl+C    - Copy
Cmd/Ctrl+V    - Paste
Cmd/Ctrl+Z    - Undo
Cmd/Ctrl+Y    - Redo
Cmd/Ctrl+S    - Save project
I             - Set in point
O             - Set out point
S             - Split element at cursor
```

**Implementation:**
```typescript
// lib/hooks/use-keyboard-shortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        playbackStore.togglePlay();
      }
      // ... other shortcuts
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
```

### **9.3 Accessibility**

- ARIA labels for all interactive elements
- Keyboard navigation for entire app
- Focus indicators
- Screen reader support for timeline
- High contrast mode option

---

## **10. Deployment Strategy**

### **10.1 Vercel Deployment**

**Configuration:**

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: true,
  },
  // Increase serverless function size for rendering
  experimental: {
    outputFileTracingIncludes: {
      '/api/render': ['./node_modules/@remotion/**/*'],
    },
  },
  // Handle large file uploads
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};
```

**Environment Variables:**
```
# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Remotion Lambda (optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
REMOTION_LAMBDA_FUNCTION_NAME=

# App settings
NEXT_PUBLIC_MAX_PROJECT_SIZE=500000000  # 500MB
NEXT_PUBLIC_MAX_FILE_SIZE=104857600      # 100MB
```

### **10.2 Performance Monitoring**

**Tools:**
- Vercel Analytics
- Sentry for error tracking
- Custom performance metrics:
  - Timeline interaction latency
  - Render time per frame
  - Asset load times

### **10.3 Scaling Considerations**

**Storage:**
- IndexedDB: 50GB per origin (Chrome), 500MB (Firefox)
- Supabase: Scalable cloud storage for assets
- Consider CDN for asset delivery

**Rendering:**
- Browser rendering: Limited by client hardware
- Cloud rendering: Scales horizontally with Lambda

---

## **11. Feature Roadmap**

### **11.1 MVP Scope (Phase 1 - 8-12 weeks)**

**Core Functionality:**
- ✅ Project dashboard (create, rename, delete, list)
- ✅ Basic timeline editor (single track)
- ✅ Upload assets (image, video, audio)
- ✅ Add elements to timeline
- ✅ Basic drag & drop
- ✅ Trim elements
- ✅ Remotion preview integration
- ✅ Browser-based rendering (< 30s videos)
- ✅ Export to MP4
- ✅ IndexedDB persistence

**UI Components:**
- ✅ Left toolbar with asset library
- ✅ Canvas with playback controls
- ✅ Timeline with ruler and cursor
- ✅ Property panel for selected elements

**Limitations:**
- Single video/audio track only
- No transitions
- No text tool
- Limited transformations (opacity only)
- No undo/redo

### **11.2 Phase 2 - Enhanced Editing (4-6 weeks)**

**Features:**
- Multi-track timeline
- Text tool with formatting
- Element transformations (scale, rotate, position)
- Fade in/out transitions
- Undo/redo functionality
- Keyboard shortcuts
- Volume and speed controls
- Copy/paste elements
- Timeline zoom and snap-to-grid

### **11.3 Phase 3 - Advanced Features (6-8 weeks)**

**Features:**
- Cloud rendering with Remotion Lambda
- Audio waveform visualization
- Video trimmer with preview
- Shape tools (rectangles, circles)
- Advanced transitions (slide, wipe, zoom)
- Filters and effects (brightness, contrast, blur)
- Audio effects (fade, normalize)
- Timeline markers and regions
- Export presets (1080p, 4K, social media formats)

### **11.4 Phase 4 - Collaboration & Cloud (8-10 weeks)**

**Features:**
- User authentication (Supabase Auth)
- Cloud project storage
- Share projects (view-only links)
- Real-time collaboration (optional, complex)
- Asset marketplace
- Project templates
- Export to cloud storage (Google Drive, Dropbox)

### **11.5 Future Roadmap (Post-Launch)**

**AI-Powered Features:**
- Auto-captions with speech recognition
- AI-generated B-roll suggestions
- Smart trimming (remove silence, filler words)
- Auto-color correction
- Background removal
- AI voiceover (TTS)

**Advanced Tools:**
- Multi-camera editing
- Motion tracking
- Chroma key (green screen)
- 3D text and graphics
- Advanced color grading
- LUT support

**Platform Expansion:**
- Mobile app (React Native + Remotion)
- Desktop app (Electron)
- Plugin system for custom effects
- API for headless rendering

---

## **12. Technical Challenges & Solutions**

### **12.1 Challenge: Large Video Files in Browser**

**Problem:** Browsers have limited memory; large video files can crash the app.

**Solutions:**
1. Proxy videos: Generate lower-res proxy for timeline preview
2. Stream processing: Use `ReadableStream` for chunked uploads
3. Offload to cloud: Store large files in Supabase, load on-demand
4. Warn users: Set file size limits (100MB default, configurable)

### **12.2 Challenge: Timeline Performance with 100+ Elements**

**Problem:** DOM rendering becomes slow with many timeline elements.

**Solutions:**
1. Virtual scrolling: Only render visible elements
2. Canvas-based timeline: Replace DOM with Canvas rendering
3. Web Workers: Offload timeline calculations
4. Debouncing: Batch state updates during drag operations

### **12.3 Challenge: Real-Time Preview Synchronization**

**Problem:** Keeping Remotion Player in sync with timeline cursor during scrubbing.

**Solutions:**
1. Controlled Player: Use `<Player>` in controlled mode
2. Throttle seek events: Limit seek calls to 30fps max
3. Frame-accurate seeking: Use `seekTo(frame)` API
4. Pause during scrub: Pause playback while user drags cursor

### **12.4 Challenge: Undo/Redo for Timeline**

**Problem:** Complex state changes need reversible history.

**Solutions:**
1. Immer for immutable updates: Use Immer.js with Zustand
2. Command pattern: Each action is a reversible command
3. History limit: Store last 50 actions only
4. Compress history: Store diffs instead of full state snapshots

**Implementation:**
```typescript
interface Command {
  execute: () => void;
  undo: () => void;
}

interface HistoryState {
  past: Command[];
  future: Command[];

  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
}
```

### **12.5 Challenge: Cross-Browser Compatibility**

**Problem:** Different browsers have different capabilities (File System Access API, IndexedDB limits).

**Solutions:**
1. Progressive enhancement: Use modern APIs where available, fallback otherwise
2. Polyfills: Use polyfills for missing features
3. Browser detection: Show warnings for unsupported browsers
4. Testing: Test on Chrome, Firefox, Safari, Edge

---

## **13. Testing Strategy**

### **13.1 Unit Tests**

**Tools:** Vitest, React Testing Library

**Coverage:**
- State management (Zustand stores)
- Utility functions (timeline calculations, frame conversions)
- Data models validation

### **13.2 Integration Tests**

**Tools:** Playwright or Cypress

**Scenarios:**
- Create project flow
- Upload asset and add to timeline
- Drag element on timeline
- Resize element
- Render video (mock rendering)
- Save and load project

### **13.3 End-to-End Tests**

**Critical Paths:**
1. User creates project → uploads video → adds to timeline → exports → downloads
2. User creates complex timeline with multiple tracks → renders successfully

### **13.4 Performance Testing**

**Metrics:**
- Timeline interaction latency (< 16ms for 60fps)
- Asset upload time
- Remotion Player frame rate (30fps min)
- Rendering speed (frames per second)

**Tools:**
- Lighthouse for page performance
- Chrome DevTools Performance profiler
- Custom metrics with `performance.measure()`

---

## **14. Security Considerations**

### **14.1 Data Privacy**

- All data stored locally by default (IndexedDB)
- Optional cloud storage requires explicit user consent
- Clear data export/delete functionality
- No tracking or analytics without consent

### **14.2 File Upload Security**

- Validate file types and sizes
- Sanitize file names
- Use Content Security Policy (CSP)
- Scan for malicious files (if cloud storage used)

### **14.3 XSS Prevention**

- Sanitize user-generated text content
- Use React's built-in XSS protection
- Validate all external URLs
- Content Security Policy headers

---

## **15. Documentation Plan**

### **15.1 User Documentation**

- Getting Started guide
- Video tutorials (YouTube)
- Feature documentation
- Keyboard shortcuts reference
- FAQ

### **15.2 Developer Documentation**

- Architecture overview (this document)
- API documentation
- Contributing guide
- Code style guide
- Testing guide

---

## **16. Success Metrics**

### **16.1 Technical Metrics**

- Timeline interaction latency < 16ms (60fps)
- Video export success rate > 95%
- App load time < 3s
- Support for projects with 50+ elements
- Support for videos up to 5 minutes

### **16.2 User Metrics**

- User retention (DAU/MAU)
- Projects created per user
- Average project complexity (# of elements)
- Video export completion rate
- User satisfaction (NPS score)

---

## **17. Summary & Next Steps**

This technical specification provides a comprehensive blueprint for building a professional-grade video editor in the browser. The architecture balances:

- **Performance:** Virtual scrolling, canvas rendering, Web Workers
- **Scalability:** Cloud rendering, modular architecture, horizontal scaling
- **User Experience:** Intuitive UI, keyboard shortcuts, real-time preview
- **Flexibility:** Plugin system ready, multiple storage options, extensible data models

**Recommended Implementation Order:**

1. Project setup, folder structure, basic routing, Zustand stores
2. Dashboard UI, project CRUD, IndexedDB integration
3. Timeline UI (single track), drag & drop, basic element rendering
4. Remotion integration, preview canvas, playback controls
5. Browser-based rendering, export functionality
6. Testing, bug fixes, polish, deploy MVP

This specification can evolve as you build—prioritize MVP features first, then iterate based on user feedback.
