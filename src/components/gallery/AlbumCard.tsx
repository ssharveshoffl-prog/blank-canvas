import { Album } from '@/lib/gallery';
import { cn } from '@/lib/utils';
import { FolderOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
  onDelete?: () => void;
}

export function AlbumCard({ album, onClick, onDelete }: AlbumCardProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          "w-full aspect-[4/3] overflow-hidden rounded-xl",
          "bg-secondary/30 text-left",
          "transition-gentle hover:shadow-warm hover:scale-[1.02]"
        )}
      >
        {/* Cover image or placeholder */}
        {album.coverPhotoUrl ? (
          <img
            src={album.coverPhotoUrl}
            alt={album.name}
            className={cn(
              "w-full h-full object-cover",
              "transition-gentle group-hover:scale-105"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Overlay with album info */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent",
          "flex flex-col justify-end p-4"
        )}>
          <h3 className="font-serif text-lg text-white truncate">
            {album.name}
          </h3>
          <p className="text-xs text-white/70 font-sans mt-1">
            {album.photoCount} {album.photoCount === 1 ? 'memory' : 'memories'}
          </p>
        </div>
      </button>

      {/* Delete button (only visible on hover for sarru) */}
      {onDelete && (
        <Button
          variant="secondary"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={cn(
            "absolute top-2 right-2 w-8 h-8",
            "bg-destructive/80 hover:bg-destructive text-destructive-foreground",
            "opacity-0 group-hover:opacity-100 transition-gentle"
          )}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
