import Dexie, { Table } from 'dexie';
import { Project } from '@/lib/types/project';
import { Asset } from '@/lib/types/asset';
import { RenderJob } from '@/lib/types/render';

export class MovieCreatorDB extends Dexie {
  projects!: Table<Project, string>;
  assets!: Table<Asset, string>;
  renderJobs!: Table<RenderJob, string>;

  constructor() {
    super('MovieCreatorDB');

    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      assets: 'id, projectId, type, uploadedAt',
      renderJobs: 'id, projectId, status, createdAt'
    });
  }

  async getProject(id: string): Promise<Project | undefined> {
    return await this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.projects.toArray();
  }

  async saveProject(project: Project): Promise<void> {
    await this.projects.put(project);
  }

  async deleteProject(id: string): Promise<void> {
    await this.transaction('rw', this.projects, this.assets, async () => {
      // Delete all assets associated with the project
      await this.assets.where('projectId').equals(id).delete();
      // Delete the project
      await this.projects.delete(id);
    });
  }

  async getProjectAssets(projectId: string): Promise<Asset[]> {
    return await this.assets.where('projectId').equals(projectId).toArray();
  }

  async saveAsset(asset: Asset): Promise<void> {
    await this.assets.put(asset);
  }

  async deleteAsset(id: string): Promise<void> {
    await this.assets.delete(id);
  }

  async getRenderJobs(projectId: string): Promise<RenderJob[]> {
    return await this.renderJobs.where('projectId').equals(projectId).toArray();
  }

  async saveRenderJob(job: RenderJob): Promise<void> {
    await this.renderJobs.put(job);
  }
}

export const db = new MovieCreatorDB();
