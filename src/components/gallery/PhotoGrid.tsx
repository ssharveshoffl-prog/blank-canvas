import { useState } from 'react';
import { Photo } from '@/lib/gallery';
import { cn } from '@/lib/utils';
import { Maximize2, FolderPlus, X, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';

interface PhotoGridProps {
  photos: Photo[];
  onAddToAlbum?: (photo: Photo) => void;
  onDeletePhoto?: (photo: Photo) => void;
  showAddToAlbum?: boolean;
}

export function PhotoGrid({ photos, onAddToAlbum, onDeletePhoto, showAddToAlbum = true }: PhotoGridProps) {
  const [expandedPhoto, setExpandedPhoto] = useState<Photo | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const { user } = useAuth();
  const isSarru = user?.username === 'sarru';

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.name || 'photo';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDeleteClick = (photo: Photo) => {
    setPhotoToDelete(photo);
  };

  const handleConfirmDelete = () => {
    if (photoToDelete && onDeletePhoto) {
      onDeletePhoto(photoToDelete);
      setPhotoToDelete(null);
      setExpandedPhoto(null);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
          <span className="text-3xl">📷</span>
        </div>
        <h3 className="font-serif text-lg text-foreground mb-2">No photos yet</h3>
        <p className="text-sm text-muted-foreground">
          Photos added to entries will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl",
              "bg-secondary/30 cursor-pointer",
              "transition-gentle hover:shadow-warm"
            )}
            onClick={() => setExpandedPhoto(photo)}
          >
            <img
              src={photo.content}
              alt={photo.name}
              className={cn(
                "w-full h-full object-cover",
                "transition-gentle group-hover:scale-105"
              )}
              loading="lazy"
            />

            {/* Hover overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent",
              "opacity-0 group-hover:opacity-100 transition-gentle"
            )}>
              {/* Action buttons */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <p className="text-xs text-white/90 font-sans truncate max-w-[60%]">
                  {photo.entryTitle !== '__gallery__' ? photo.entryTitle : 'Gallery'}
                </p>
                <div className="flex gap-1">
                  {showAddToAlbum && onAddToAlbum && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-7 h-7 bg-white/20 backdrop-blur-sm hover:bg-white/40 border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToAlbum(photo);
                      }}
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-white" />
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-7 h-7 bg-white/20 backdrop-blur-sm hover:bg-white/40 border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPhoto(photo);
                    }}
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen photo dialog */}
      <Dialog open={!!expandedPhoto} onOpenChange={() => setExpandedPhoto(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-md border-border">
          <DialogClose className="absolute right-4 top-4 z-10 rounded-full p-2 bg-background/80 hover:bg-background transition-gentle">
            <X className="h-5 w-5" />
          </DialogClose>
          
          {/* Action buttons in fullscreen */}
          <div className="absolute left-4 top-4 z-10 flex gap-2">
            {showAddToAlbum && onAddToAlbum && expandedPhoto && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onAddToAlbum(expandedPhoto);
                }}
                className="bg-background/80 hover:bg-background transition-gentle"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Add to album
              </Button>
            )}
            {/* Download button for all users */}
            {expandedPhoto && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(expandedPhoto)}
                className="bg-background/80 hover:bg-background transition-gentle"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            {/* Delete button for sarru only */}
            {isSarru && expandedPhoto && onDeletePhoto && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDeleteClick(expandedPhoto)}
                className="bg-destructive/80 hover:bg-destructive text-destructive-foreground transition-gentle"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-4 max-h-[95vh] overflow-auto">
            {expandedPhoto && (
              <>
                <img
                  src={expandedPhoto.content}
                  alt={expandedPhoto.name}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
                <p className="mt-3 text-sm text-muted-foreground font-sans">
                  From: {expandedPhoto.entryTitle !== '__gallery__' ? expandedPhoto.entryTitle : 'Gallery'}
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!photoToDelete} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the photo from the gallery, all albums, and storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {photoToDelete && (
            <div className="my-4 flex justify-center">
              <img
                src={photoToDelete.content}
                alt={photoToDelete.name}
                className="max-h-32 rounded-lg object-contain"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
