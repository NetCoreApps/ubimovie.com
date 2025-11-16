export interface RenderJob {
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

export interface RenderSettings {
  codec: 'h264' | 'h265' | 'vp8' | 'vp9';
  format: 'mp4' | 'webm' | 'mov';
  quality: number;        // 0-100
  frameRange?: {
    start: number;
    end: number;
  };
}
