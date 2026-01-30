import { useState } from 'react';
import { ImageBlock as ImageBlockType } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Trash2, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';

interface ImageBlockProps {
  block: ImageBlockType;
  onDelete: () => void;
  canDelete: boolean;
}

export function ImageBlock({ block, onDelete, canDelete }: ImageBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="group relative bg-secondary/20 rounded-xl p-4 hover:bg-secondary/30 transition-gentle">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={block.content}
            alt={block.name}
            className="w-full h-auto max-h-[500px] object-contain cursor-pointer"
            onClick={() => setIsExpanded(true)}
          />
          
          {/* Expand button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsExpanded(true)}
            className={cn(
              "absolute bottom-3 right-3 opacity-0 group-hover:opacity-100",
              "bg-background/80 backdrop-blur-sm hover:bg-background",
              "transition-gentle"
            )}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className={cn(
              "absolute top-2 right-2 opacity-0 group-hover:opacity-100",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "transition-gentle"
            )}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Expanded view dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-md border-border">
          <DialogClose className="absolute right-4 top-4 z-10 rounded-full p-2 bg-background/80 hover:bg-background transition-gentle">
            <X className="h-5 w-5" />
          </DialogClose>
          <div className="flex items-center justify-center p-4 max-h-[95vh] overflow-auto">
            <img
              src={block.content}
              alt={block.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
