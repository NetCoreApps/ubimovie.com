'use client';

import { Project } from '@/lib/types/project';
import { AssetLibrary } from './toolbar/asset-library';
import { PreviewCanvas } from './canvas/preview-canvas';
import { TimelineContainer } from './timeline/timeline-container';
import { Separator } from '@/components/ui/separator';

interface EditorLayoutProps {
  project: Project;
}

export function EditorLayout({ project }: EditorLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="h-14 bg-slate-100 dark:bg-slate-900 border-b border-border flex items-center px-4 shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">{project.name}</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">
            {project.settings.width}x{project.settings.height} • {project.settings.fps}fps
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Asset Library */}
        <div className="w-80 bg-slate-50 dark:bg-slate-900 border-r border-border overflow-y-auto">
          <AssetLibrary projectId={project.id} />
        </div>

        {/* Center - Preview Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <PreviewCanvas project={project} />
          </div>

          <Separator />

          {/* Timeline */}
          <div className="h-80 bg-slate-100 dark:bg-slate-950">
            <TimelineContainer project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}
