import { useState, useEffect } from 'react';
import { Album, getAlbums, createAlbum, addPhotoToAlbums, getAlbumsForPhoto } from '@/lib/gallery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Plus, FolderOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlbumPickerProps {
  isOpen: boolean;
  onClose: () => void;
  photoId: string;
  photoUrl?: string;
}

export function AlbumPicker({ isOpen, onClose, photoId, photoUrl }: AlbumPickerProps) {
  const { toast } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbums, setSelectedAlbums] = useState<Set<string>>(new Set());
  const [existingAlbums, setExistingAlbums] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, photoId]);

  const loadData = async () => {
    setIsLoading(true);
    const [albumsData, photoAlbums] = await Promise.all([
      getAlbums(),
      getAlbumsForPhoto(photoId),
    ]);
    setAlbums(albumsData);
    setExistingAlbums(new Set(photoAlbums));
    setSelectedAlbums(new Set(photoAlbums));
    setIsLoading(false);
  };

  const handleToggleAlbum = (albumId: string) => {
    const newSelected = new Set(selectedAlbums);
    if (newSelected.has(albumId)) {
      newSelected.delete(albumId);
    } else {
      newSelected.add(albumId);
    }
    setSelectedAlbums(newSelected);
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    
    const album = await createAlbum(newAlbumName.trim());
    if (album) {
      setAlbums([album, ...albums]);
      setSelectedAlbums(new Set([...selectedAlbums, album.id]));
      setNewAlbumName('');
      setIsCreatingNew(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Find new albums to add (not already existing)
    const newAlbumsToAdd = [...selectedAlbums].filter(id => !existingAlbums.has(id));
    
    if (newAlbumsToAdd.length > 0) {
      const success = await addPhotoToAlbums(photoId, newAlbumsToAdd);
      if (success) {
        toast({
          title: 'Photo added to albums',
          description: `Added to ${newAlbumsToAdd.length} album(s)`,
        });
      }
    }
    
    setIsSaving(false);
    onClose();
  };

  const hasChanges = [...selectedAlbums].some(id => !existingAlbums.has(id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Add to album</DialogTitle>
        </DialogHeader>

        {/* Photo preview */}
        {photoUrl && (
          <div className="w-full h-32 rounded-lg overflow-hidden bg-secondary/30 mb-4">
            <img
              src={photoUrl}
              alt="Selected photo"
              className="w-full h-full object-cover"
            />
          </div>
        )}

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
                  <label
                    key={album.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                      "hover:bg-secondary/50 transition-gentle",
                      selectedAlbums.has(album.id) && "bg-secondary/30"
                    )}
                  >
                    <Checkbox
                      checked={selectedAlbums.has(album.id)}
                      onCheckedChange={() => handleToggleAlbum(album.id)}
                      disabled={existingAlbums.has(album.id)}
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {album.coverPhotoUrl ? (
                        <img
                          src={album.coverPhotoUrl}
                          alt=""
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                          <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-foreground truncate">
                          {album.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {album.photoCount} photo{album.photoCount !== 1 ? 's' : ''}
                          {existingAlbums.has(album.id) && ' • Already added'}
                        </p>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Save button */}
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {hasChanges ? 'Save changes' : 'Done'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
