'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/stores/project-store';
import { ProjectCard } from '@/components/dashboard/project-card';
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog';
import { RenameProjectDialog } from '@/components/dashboard/rename-project-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Film } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { projects, loadProjects, createProject, updateProject, deleteProject, setActiveProject } =
    useProjectStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadProjects();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [loadProjects]);

  const handleCreateProject = async (name: string) => {
    const project = await createProject(name);
    setActiveProject(project.id);
    router.push(`/editor/${project.id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      await deleteProject(id);
    }
  };

  const handleRenameProject = async (name: string) => {
    if (renameProjectId) {
      await updateProject(renameProjectId, { name });
      setRenameProjectId(null);
    }
  };

  const renameProject = projects.find((p) => p.id === renameProjectId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Projects</h1>
            <p className="text-muted-foreground">
              Create and manage your video projects
            </p>
          </div>
          <Button size="lg" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first video project to get started
            </p>
            <Button size="lg" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onRename={(id) => setRenameProjectId(id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
      />

      {renameProject && (
        <RenameProjectDialog
          open={!!renameProjectId}
          currentName={renameProject.name}
          onOpenChange={(open) => !open && setRenameProjectId(null)}
          onSubmit={handleRenameProject}
        />
      )}
    </div>
  );
}
