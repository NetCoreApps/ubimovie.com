'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProjectStore } from '@/lib/stores/project-store';
import { useAssetStore } from '@/lib/stores/asset-store';
import { EditorLayout } from '@/components/editor/editor-layout';
import { Film } from 'lucide-react';

export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { projects, loadProjects, setActiveProject, getActiveProject } = useProjectStore();
  const { loadAssets } = useAssetStore();

  useEffect(() => {
    const loadData = async () => {
      await loadProjects();
      setActiveProject(projectId);
      await loadAssets(projectId);
    };
    loadData();
  }, [projectId, loadProjects, setActiveProject, loadAssets]);

  const project = getActiveProject();

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <Film className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Loading editor...</p>
        </div>
      </div>
    );
  }

  return <EditorLayout project={project} />;
}
