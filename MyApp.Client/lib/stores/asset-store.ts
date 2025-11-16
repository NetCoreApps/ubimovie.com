import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Asset, MediaMetadata } from '@/lib/types/asset';
import { db } from '@/lib/services/storage/indexeddb';
import { useProjectStore } from './project-store';

interface AssetStoreState {
  assets: Asset[];
  isUploading: boolean;
  uploadProgress: { [key: string]: number };

  // Actions
  uploadAsset: (file: File, projectId: string) => Promise<Asset>;
  uploadFromUrl: (url: string, projectId: string) => Promise<Asset>;
  deleteAsset: (assetId: string) => Promise<void>;
  getAsset: (assetId: string) => Asset | undefined;
  loadAssets: (projectId: string) => Promise<void>;
  processAssetMetadata: (asset: Asset) => Promise<Asset>;
}

export const useAssetStore = create<AssetStoreState>((set, get) => ({
  assets: [],
  isUploading: false,
  uploadProgress: {},

  uploadAsset: async (file: File, projectId: string) => {
    try {
      set({ isUploading: true });

      // Create blob URL for the file
      const blobUrl = URL.createObjectURL(file);

      // Detect asset type
      let type: 'video' | 'audio' | 'image';
      if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type.startsWith('audio/')) {
        type = 'audio';
      } else if (file.type.startsWith('image/')) {
        type = 'image';
      } else {
        throw new Error('Unsupported file type');
      }

      const asset: Asset = {
        id: uuidv4(),
        projectId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type,
        file: {
          url: blobUrl,
          size: file.size,
          mimeType: file.type,
          originalName: file.name,
        },
        metadata: {},
        storageType: 'indexeddb',
        storageKey: file.name,
        uploadedAt: new Date(),
        lastAccessedAt: new Date(),
      };

      // Process metadata
      const assetWithMetadata = await get().processAssetMetadata(asset);

      // Save to IndexedDB
      await db.saveAsset(assetWithMetadata);

      set(state => ({
        assets: [...state.assets, assetWithMetadata],
        isUploading: false,
      }));

      // Update project asset count
      const project = useProjectStore.getState().getActiveProject();
      if (project) {
        useProjectStore.getState().updateProject(project.id, {
          assets: [...project.assets, assetWithMetadata],
        });
      }

      return assetWithMetadata;
    } catch (error) {
      set({ isUploading: false });
      throw error;
    }
  },

  uploadFromUrl: async (url: string, projectId: string) => {
    try {
      set({ isUploading: true });

      // Fetch the file
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = url.split('/').pop() || 'asset';

      // Convert to File
      const file = new File([blob], filename, { type: blob.type });

      const asset = await get().uploadAsset(file, projectId);

      set({ isUploading: false });
      return asset;
    } catch (error) {
      set({ isUploading: false });
      throw error;
    }
  },

  deleteAsset: async (assetId: string) => {
    try {
      const asset = get().assets.find(a => a.id === assetId);
      if (!asset) return;

      // Revoke blob URL
      if (asset.file.url.startsWith('blob:')) {
        URL.revokeObjectURL(asset.file.url);
      }

      await db.deleteAsset(assetId);

      set(state => ({
        assets: state.assets.filter(a => a.id !== assetId),
      }));

      // Update project
      const project = useProjectStore.getState().getActiveProject();
      if (project) {
        useProjectStore.getState().updateProject(project.id, {
          assets: project.assets.filter(a => a.id !== assetId),
        });
      }
    } catch (error) {
      throw error;
    }
  },

  getAsset: (assetId: string) => {
    return get().assets.find(a => a.id === assetId);
  },

  loadAssets: async (projectId: string) => {
    try {
      const assets = await db.getProjectAssets(projectId);
      set({ assets });
    } catch (error) {
      throw error;
    }
  },

  processAssetMetadata: async (asset: Asset): Promise<Asset> => {
    return new Promise((resolve) => {
      const metadata: MediaMetadata = {};

      if (asset.type === 'video') {
        const video = document.createElement('video');
        video.src = asset.file.url;
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
          metadata.duration = video.duration;
          metadata.width = video.videoWidth;
          metadata.height = video.videoHeight;
          metadata.fps = 30; // Default, can be detected with more complex logic
          metadata.hasAudio = true; // Assume true for now

          // Create thumbnail
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 90;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            metadata.thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          }

          resolve({ ...asset, metadata });
        };

        video.onerror = () => {
          resolve(asset);
        };
      } else if (asset.type === 'image') {
        const img = new Image();
        img.src = asset.file.url;

        img.onload = () => {
          metadata.width = img.width;
          metadata.height = img.height;
          metadata.thumbnail = asset.file.url;
          resolve({ ...asset, metadata });
        };

        img.onerror = () => {
          resolve(asset);
        };
      } else if (asset.type === 'audio') {
        const audio = new Audio();
        audio.src = asset.file.url;
        audio.preload = 'metadata';

        audio.onloadedmetadata = () => {
          metadata.duration = audio.duration;
          resolve({ ...asset, metadata });
        };

        audio.onerror = () => {
          resolve(asset);
        };
      } else {
        resolve(asset);
      }
    });
  },
}));
