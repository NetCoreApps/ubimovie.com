export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: 'video' | 'audio' | 'image';

  // File information
  file: {
    url: string;
    size: number;
    mimeType: string;
    originalName: string;
  };

  // Media metadata
  metadata: MediaMetadata;

  // Storage
  storageType: 'indexeddb' | 'supabase' | 'url';
  storageKey?: string;

  // Timestamps
  uploadedAt: Date;
  lastAccessedAt: Date;
}

export interface MediaMetadata {
  duration?: number;      // In seconds (video/audio)
  width?: number;         // Video/image
  height?: number;        // Video/image
  fps?: number;          // Video
  hasAudio?: boolean;    // Video
  thumbnail?: string;    // Base64 preview
  waveform?: number[];   // Audio waveform data
}
