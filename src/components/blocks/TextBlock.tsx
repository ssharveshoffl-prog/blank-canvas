import { useState, useEffect } from 'react';
import { TextBlock as TextBlockType } from '@/lib/entries';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextBlockProps {
  block: TextBlockType;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  canDelete: boolean;
  isEditMode: boolean;
}

export function TextBlock({ block, onUpdate, onDelete, canDelete, isEditMode }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  const handleSave = () => {
    onUpdate(content);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(block.content);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="group relative bg-secondary/30 rounded-xl p-4 animate-fade-in">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={cn(
            "min-h-[120px] bg-background border-border",
            "font-sans text-foreground text-base leading-relaxed",
            "focus:border-ring focus:ring-1 focus:ring-ring",
            "resize-none"
          )}
          placeholder="Write your thoughts..."
          autoFocus
        />
        <div className="flex items-center justify-end gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-secondary/20 rounded-xl p-6 hover:bg-secondary/30 transition-gentle">
      <div
        onClick={() => isEditMode && setIsEditing(true)}
        className={cn(
          "font-sans text-foreground text-base leading-relaxed whitespace-pre-wrap",
          isEditMode && "cursor-text"
        )}
      >
        {block.content || (
          <span className="text-muted-foreground italic">Click to add text...</span>
        )}
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
  );
}
