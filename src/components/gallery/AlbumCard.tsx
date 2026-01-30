import { Album } from '@/lib/gallery';
import { cn } from '@/lib/utils';
import { FolderOpen } from 'lucide-react';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

export function AlbumCard({ album, onClick }: AlbumCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full aspect-[4/3] overflow-hidden rounded-xl",
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
  );
}
