import { useEffect, useMemo, useState } from 'react';
import { LinkBlock as LinkBlockType } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Link2, ExternalLink, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkBlockProps {
  block: LinkBlockType;
  onUpdate: (url: string, title?: string) => void;
  onDelete: () => void;
  canDelete: boolean;
  isEditMode: boolean;
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    // eslint-disable-next-line no-new
    new URL(withScheme);
    return withScheme;
  } catch {
    return null;
  }
}

export function LinkBlock({ block, onUpdate, onDelete, canDelete, isEditMode }: LinkBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(block.content);
  const [title, setTitle] = useState(block.title || '');

  useEffect(() => {
    setUrl(block.content);
    setTitle(block.title || '');
  }, [block.content, block.title]);

  const normalizedUrl = useMemo(() => normalizeUrl(url), [url]);

  const handleOpen = () => {
    const target = normalizeUrl(block.content);
    if (!target) return;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const handleSave = () => {
    const target = normalizeUrl(url);
    if (!target) return;
    onUpdate(target, title.trim() ? title.trim() : undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUrl(block.content);
    setTitle(block.title || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="group relative bg-secondary/30 rounded-xl p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-sans">Link</p>
        </div>

        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background border-border font-sans"
            placeholder="Title (optional)"
          />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={cn(
              "bg-background border-border font-sans",
              !normalizedUrl && url.trim() ? "border-destructive focus-visible:ring-destructive" : undefined
            )}
            placeholder="https://example.com"
            autoFocus
          />
          {!normalizedUrl && url.trim() && (
            <p className="text-xs text-destructive font-sans">Enter a valid URL.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
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
            disabled={!normalizedUrl}
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
    <div className="group relative bg-secondary/20 rounded-xl p-4 hover:bg-secondary/30 transition-gentle">
      <div
        onClick={() => isEditMode && setIsEditing(true)}
        className={cn(isEditMode && "cursor-pointer")}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent/50 rounded-lg">
            <Link2 className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-foreground text-sm font-medium truncate">
              {block.title || block.content}
            </p>
            <p className="text-xs text-muted-foreground font-sans truncate">
              {block.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="text-muted-foreground hover:text-foreground"
            title="Open link"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
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

