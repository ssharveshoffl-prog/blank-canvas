import { useState } from 'react';
import { createEntry } from '@/lib/entries';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CreateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}

export function CreateEntryModal({ isOpen, onClose, onCreate }: CreateEntryModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const entry = await createEntry(title.trim(), description.trim() || undefined, user.username);

      if (entry) {
        toast({
          title: "Entry created",
          description: "Your new memory has been started.",
        });
        onCreate();
        handleClose();
      } else {
        throw new Error("Failed to create entry");
      }
    } catch (error) {
      console.error('Create entry error:', error);
      const errorMessage = error instanceof Error ? error.message : "Could not create entry. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg bg-popover border-border shadow-warm-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal text-foreground">
            Create New Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title"
              className={cn(
                "h-12 font-serif text-lg bg-background border-border",
                "placeholder:text-muted-foreground/60",
                "focus:border-ring focus:ring-1 focus:ring-ring"
              )}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className={cn(
                "font-sans text-base bg-background border-border resize-none",
                "placeholder:text-muted-foreground/60",
                "focus:border-ring focus:ring-1 focus:ring-ring"
              )}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="font-sans text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="font-sans bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
