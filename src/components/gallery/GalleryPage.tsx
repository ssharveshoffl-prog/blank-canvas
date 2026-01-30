import { useState, useEffect, useRef } from 'react';
import { Photo, Album, getAllPhotos, getAlbums, getAlbumWithPhotos, uploadPhotoToGallery, deletePhoto, AlbumWithPhotos } from '@/lib/gallery';
import { PhotoGrid } from './PhotoGrid';
import { AlbumCard } from './AlbumCard';
import { AlbumPicker } from './AlbumPicker';
import { CreateAlbumModal } from './CreateAlbumModal';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, ImagePlus, FolderPlus, Loader2, X } from 'lucide-react';
import { InfinityMark } from '@/components/InfinityMark';
import { toast } from '@/hooks/use-toast';

type GalleryView = 'all' | 'albums' | 'album-detail';

interface GalleryPageProps {
  onClose: () => void;
}

export function GalleryPage({ onClose }: GalleryPageProps) {
  const [view, setView] = useState<GalleryView>('all');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithPhotos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Album picker state
  const [albumPickerPhoto, setAlbumPickerPhoto] = useState<Photo | null>(null);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [photosData, albumsData] = await Promise.all([
      getAllPhotos(),
      getAlbums(),
    ]);
    setPhotos(photosData);
    setAlbums(albumsData);
    setIsLoading(false);
  };

  const handleOpenAlbum = async (album: Album) => {
    setIsLoading(true);
    const albumWithPhotos = await getAlbumWithPhotos(album.id);
    if (albumWithPhotos) {
      setSelectedAlbum(albumWithPhotos);
      setView('album-detail');
    }
    setIsLoading(false);
  };

  const handleBackFromAlbum = () => {
    setSelectedAlbum(null);
    setView('albums');
    loadData(); // Refresh data
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        await uploadPhotoToGallery(file);
      }
    }
    await loadData();
    setIsUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddToAlbum = (photo: Photo) => {
    setAlbumPickerPhoto(photo);
  };

  const handleDeletePhoto = async (photo: Photo) => {
    const success = await deletePhoto(photo);
    if (success) {
      toast({
        title: 'Photo deleted',
        description: 'The photo has been permanently removed.',
      });
      await loadData();
      // Also refresh album if viewing album detail
      if (selectedAlbum) {
        const refreshedAlbum = await getAlbumWithPhotos(selectedAlbum.id);
        setSelectedAlbum(refreshedAlbum);
      }
    } else {
      toast({
        title: 'Delete failed',
        description: 'Could not delete the photo. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAlbumCreated = async () => {
    await loadData();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="shrink-0 p-4 md:p-6 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={view === 'album-detail' ? handleBackFromAlbum : onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl text-foreground">
                {view === 'album-detail' && selectedAlbum
                  ? selectedAlbum.name
                  : 'Gallery'}
              </h1>
              {view !== 'album-detail' && (
                <p className="text-sm text-muted-foreground font-sans">
                  {photos.length} photo{photos.length !== 1 ? 's' : ''} • {albums.length} album{albums.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ImagePlus className="w-4 h-4 mr-2" />
              )}
              Add photo
            </Button>
            {view !== 'album-detail' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateAlbumOpen(true)}
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New album
              </Button>
            )}
          </div>
        </div>

        {/* Tab navigation (only show when not in album detail) */}
        {view !== 'album-detail' && (
          <div className="flex gap-1 mt-4">
            <Button
              variant={view === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('all')}
              className="font-sans"
            >
              All Photos
            </Button>
            <Button
              variant={view === 'albums' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('albums')}
              className="font-sans"
            >
              Albums
            </Button>
          </div>
        )}
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <InfinityMark className="w-12 h-6 animate-infinity-breathe" tone="pink" />
            </div>
          ) : (
            <>
              {view === 'all' && (
                <PhotoGrid
                  photos={photos}
                  onAddToAlbum={handleAddToAlbum}
                  onDeletePhoto={handleDeletePhoto}
                  showAddToAlbum
                />
              )}

              {view === 'albums' && (
                <div className="space-y-6">
                  {albums.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                        <span className="text-3xl">📁</span>
                      </div>
                      <h3 className="font-serif text-lg text-foreground mb-2">No albums yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create albums to organize your memories
                      </p>
                      <Button onClick={() => setIsCreateAlbumOpen(true)}>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Create first album
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {albums.map((album) => (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          onClick={() => handleOpenAlbum(album)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {view === 'album-detail' && selectedAlbum && (
                <PhotoGrid
                  photos={selectedAlbum.photos}
                  onAddToAlbum={handleAddToAlbum}
                  onDeletePhoto={handleDeletePhoto}
                  showAddToAlbum
                />
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Album picker modal */}
      {albumPickerPhoto && (
        <AlbumPicker
          isOpen={!!albumPickerPhoto}
          onClose={() => {
            setAlbumPickerPhoto(null);
            loadData(); // Refresh after closing
          }}
          photoId={albumPickerPhoto.id}
          photoUrl={albumPickerPhoto.content}
        />
      )}

      {/* Create album modal */}
      <CreateAlbumModal
        isOpen={isCreateAlbumOpen}
        onClose={() => setIsCreateAlbumOpen(false)}
        onCreated={handleAlbumCreated}
      />
    </div>
  );
}
