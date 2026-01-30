import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Entry } from '@/lib/entries';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface DraggableEntryCardProps {
  entry: Entry;
  isSelected: boolean;
  onClick: () => void;
  variant?: 'sidebar' | 'mobile';
}

export function DraggableEntryCard({
  entry,
  isSelected,
  onClick,
  variant = 'sidebar',
}: DraggableEntryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (variant === 'mobile') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative w-full text-left p-4 rounded-xl bg-card/50 border border-border/50",
          "hover:bg-card hover:border-border hover:shadow-warm",
          "transition-gentle",
          isDragging && "opacity-50 shadow-warm-lg scale-[1.02] z-50"
        )}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing",
            "text-muted-foreground/40 hover:text-muted-foreground",
            "opacity-0 group-hover:opacity-100 transition-gentle"
          )}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <button
          onClick={onClick}
          className="w-full text-left pl-4"
        >
          <h3 className="font-serif text-lg text-foreground">
            {entry.title}
          </h3>
          {entry.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {entry.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground/70 mt-2">
            {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
          </p>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative",
        isDragging && "opacity-50 shadow-warm-lg scale-[1.02] z-50"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing",
          "text-muted-foreground/40 hover:text-muted-foreground",
          "opacity-0 group-hover:opacity-100 transition-gentle"
        )}
      >
        <GripVertical className="w-3 h-3" />
      </div>

      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-3 pl-6 rounded-lg transition-gentle",
          "hover:bg-secondary/50",
          isSelected && "bg-secondary"
        )}
      >
        <h3 className="font-serif text-base text-foreground truncate">
          {entry.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(entry.createdAt), 'MMM d, yyyy')}
        </p>
      </button>
    </div>
  );
}
