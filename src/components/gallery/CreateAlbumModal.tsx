import { useState } from 'react';
import { createAlbum } from '@/lib/gallery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateAlbumModal({ isOpen, onClose, onCreated }: CreateAlbumModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    const album = await createAlbum(name.trim(), description.trim() || undefined);
    setIsCreating(false);

    if (album) {
      toast({
        title: 'Album created',
        description: `"${album.name}" is ready for your memories`,
      });
      setName('');
      setDescription('');
      onCreated();
      onClose();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create album',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Create album</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="album-name" className="font-sans">Name</Label>
            <Input
              id="album-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer 2024"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="album-description" className="font-sans">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="album-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What memories does this album hold?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
              {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create album
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
