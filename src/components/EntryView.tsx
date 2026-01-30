import { useState, useEffect } from 'react';
import { Entry, getEntry, updateEntry, deleteEntry } from '@/lib/entries';
import { useAuth } from '@/contexts/AuthContext';
import { BlockRenderer } from '@/components/BlockRenderer';
import { AddBlockButton } from '@/components/AddBlockButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Edit2, Check, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfinityMark } from '@/components/InfinityMark';

interface EntryViewProps {
  entryId: string;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export function EntryView({ entryId, onClose, onUpdate, onDelete }: EntryViewProps) {
  const { isAdmin } = useAuth();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEntry = async () => {
    const data = await getEntry(entryId);
    if (data) {
      setEntry(data);
      setEditTitle(data.title);
      setEditDescription(data.description || '');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const handleSaveHeader = async () => {
    if (!entry) return;
    await updateEntry(entry.id, {
      title: editTitle,
      description: editDescription || undefined,
    });
    await loadEntry();
    onUpdate();
    setIsEditingHeader(false);
  };

  const handleCancelEdit = () => {
    if (!entry) return;
    setEditTitle(entry.title);
    setEditDescription(entry.description || '');
    setIsEditingHeader(false);
  };

  const handleDelete = async () => {
    if (!entry) return;
    setIsDeleting(true);
    await deleteEntry(entry.id);
    onDelete();
    onClose();
  };

  const handleBlocksChange = () => {
    loadEntry();
    onUpdate();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <InfinityMark className="w-16 h-8 animate-pulse" tone="pink" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Entry not found</p>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col h-full", isDeleting && "animate-fade-out")}>
      {/* Header */}
      <header className="shrink-0 p-6 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground md:hidden"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {isEditingHeader ? (
          <div className="space-y-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-serif text-2xl h-12 bg-background border-border"
              placeholder="Entry title"
              autoFocus
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="font-sans text-base bg-background border-border resize-none"
              placeholder="Description (optional)"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveHeader}
                disabled={!editTitle.trim()}
                className="bg-primary text-primary-foreground"
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground pr-20">
              {entry.title}
            </h1>
            {entry.description && (
              <p className="mt-3 font-sans text-muted-foreground text-base leading-relaxed">
                {entry.description}
              </p>
            )}
            
            {/* Edit mode toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                "absolute top-0 right-20 opacity-0 group-hover:opacity-100",
                "text-muted-foreground hover:text-foreground",
                "transition-gentle font-sans text-sm"
              )}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {isEditMode ? 'Done' : 'Edit'}
            </Button>

            {/* Edit header button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingHeader(true)}
              className={cn(
                "absolute top-0 right-8 opacity-0 group-hover:opacity-100",
                "text-muted-foreground hover:text-foreground",
                "transition-gentle"
              )}
            >
              <Edit2 className="w-4 h-4" />
            </Button>

            {/* Delete button - admin only */}
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute top-0 right-0 opacity-0 group-hover:opacity-100",
                      "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                      "transition-gentle"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-popover border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif text-xl">Delete this entry?</AlertDialogTitle>
                    <AlertDialogDescription className="font-sans">
                      This will permanently delete "{entry.title}" and all its contents. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </header>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Blocks */}
        {entry.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            entryId={entry.id}
            block={block}
            canDelete={isAdmin}
            isEditMode={isEditMode}
            onBlocksChange={handleBlocksChange}
          />
        ))}

        {/* Add Block Button - only show in edit mode */}
        {isEditMode && (
          <AddBlockButton
            entryId={entry.id}
            onBlockAdded={handleBlocksChange}
          />
        )}
      </div>
    </div>
  );
}
