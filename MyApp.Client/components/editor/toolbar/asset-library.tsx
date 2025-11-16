'use client';

import { useRef } from 'react';
import { useAssetStore } from '@/lib/stores/asset-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Upload, Image, Video, Music, Trash2 } from 'lucide-react';

interface AssetLibraryProps {
  projectId: string;
}

export function AssetLibrary({ projectId }: AssetLibraryProps) {
  const { assets, uploadAsset, deleteAsset, isUploading } = useAssetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      try {
        await uploadAsset(files[i], projectId);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Delete this asset?')) {
      await deleteAsset(assetId);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Assets</h2>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full mb-4"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload Files'}
      </Button>

      <Separator className="mb-4 bg-slate-700" />

      <div className="space-y-2">
        {assets.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No assets yet</p>
            <p className="text-xs mt-1">Upload videos, images, or audio</p>
          </div>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-500/50 transition-all"
            >
              <div className="aspect-video bg-black flex items-center justify-center border-b border-slate-700">
                {asset.metadata.thumbnail ? (
                  <img
                    src={asset.metadata.thumbnail}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500">{getAssetIcon(asset.type)}</div>
                )}
              </div>
              <div className="p-2 bg-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-white">{asset.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      {getAssetIcon(asset.type)}
                      <span className="capitalize">{asset.type}</span>
                      {asset.metadata.duration && (
                        <>
                          <span>•</span>
                          <span>{Math.floor(asset.metadata.duration)}s</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Draggable handle */}
              <div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('assetId', asset.id);
                  e.dataTransfer.setData('assetType', asset.type);
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
