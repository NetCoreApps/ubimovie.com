'use client';

import { Project } from '@/lib/types/project';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
}

export function ProjectCard({ project, onDelete, onRename }: ProjectCardProps) {
  const formattedDate = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const duration = Math.floor(project.settings.durationInFrames / project.settings.fps);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-black">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <Play className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link href={`/editor/${project.id}`}>
            <Button size="sm" variant="secondary">
              <Play className="w-4 h-4 mr-1" />
              Open
            </Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={() => onRename(project.id)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(project.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{project.name}</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            {project.settings.width}x{project.settings.height} • {project.settings.fps}fps
          </p>
          <p>
            {minutes}:{seconds.toString().padStart(2, '0')} • {project.metadata.assetCount} assets
          </p>
          <p>Updated {formattedDate}</p>
        </div>
      </CardContent>
    </Card>
  );
}
