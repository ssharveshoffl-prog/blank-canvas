import { useState, useEffect } from 'react';
import { Album, getAlbums, createAlbum } from '@/lib/gallery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus, FolderOpen, Loader2, ImagePlus } from 'lucide-react';

interface MultiSelectAlbumPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlbum: (albumId: string) => void;
  photoCount: number;
}

export function MultiSelectAlbumPicker({ 
  isOpen, 
  onClose, 
  onSelectAlbum, 
  photoCount 
}: MultiSelectAlbumPickerProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAlbums();
    }
  }, [isOpen]);

  const loadAlbums = async () => {
    setIsLoading(true);
    const albumsData = await getAlbums();
    setAlbums(albumsData);
    setIsLoading(false);
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    
    const album = await createAlbum(newAlbumName.trim());
    if (album) {
      onSelectAlbum(album.id);
      setNewAlbumName('');
      setIsCreatingNew(false);
    }
  };

  const handleSelectAlbum = (albumId: string) => {
    onSelectAlbum(albumId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Add {photoCount} photo{photoCount !== 1 ? 's' : ''} to album
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Create new album */}
            {isCreatingNew ? (
              <div className="flex gap-2">
                <Input
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="Album name..."
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateAlbum();
                    if (e.key === 'Escape') setIsCreatingNew(false);
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleCreateAlbum}
                  disabled={!newAlbumName.trim()}
                >
                  Create
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsCreatingNew(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create new album
              </Button>
            )}

            {/* Album list */}
            <div className="max-h-64 overflow-y-auto space-y-1">
              {albums.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No albums yet. Create one above!
                </p>
              ) : (
                albums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => handleSelectAlbum(album.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left",
                      "hover:bg-secondary/50 transition-gentle"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {album.coverPhotoUrl ? (
                        <img
                          src={album.coverPhotoUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-foreground truncate">
                          {album.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {album.photoCount} photo{album.photoCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <ImagePlus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
