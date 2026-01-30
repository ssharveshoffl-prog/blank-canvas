import { useState, useRef } from 'react';
import { Plus, Type, Image, FileText, Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { addTextBlock, addFileBlock, addLinkBlock } from '@/lib/entries';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddBlockButtonProps {
  entryId: string;
  onBlockAdded: () => void;
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

export function AddBlockButton({ entryId, onBlockAdded }: AddBlockButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddText = async () => {
    setIsOpen(false);
    await addTextBlock(entryId, '');
    onBlockAdded();
  };

  const handleAddLink = async () => {
    const url = normalizeUrl(linkUrl);
    if (!url) {
      toast({
        title: 'Invalid link',
        description: 'Please enter a valid URL (e.g. https://example.com).',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const block = await addLinkBlock(entryId, url, linkTitle);
      if (block) {
        onBlockAdded();
        setIsLinkDialogOpen(false);
        setLinkUrl('');
        setLinkTitle('');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add the link. Please try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add the link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (file: File, type: 'image' | 'pdf') => {
    // Check file size (max 20MB per file)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 20MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const block = await addFileBlock(entryId, file, type);
      if (block) {
        onBlockAdded();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to upload the file. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process the file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, 'image');
    }
    e.target.value = '';
    setIsOpen(false);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, 'pdf');
    }
    e.target.value = '';
    setIsOpen(false);
  };

  return (
    <>
      <Dialog
        open={isLinkDialogOpen}
        onOpenChange={(open) => {
          setIsLinkDialogOpen(open);
          if (!open) {
            setLinkUrl('');
            setLinkTitle('');
          }
        }}
      >
        <DialogContent className="bg-popover border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add link</DialogTitle>
            <DialogDescription className="font-sans">
              Paste a URL to store it as a link block.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="font-sans bg-background border-border"
              placeholder="Title (optional)"
            />
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="font-sans bg-background border-border"
              placeholder="https://example.com"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsLinkDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLink}
              disabled={isUploading || !normalizeUrl(linkUrl)}
              className="bg-primary text-primary-foreground"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add link'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        onChange={handlePdfChange}
        className="hidden"
      />

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={isUploading}
            className={cn(
              "w-full h-14 border-dashed border-2 border-border/60",
              "text-muted-foreground hover:text-foreground",
              "hover:border-border hover:bg-secondary/30",
              "transition-gentle"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Block
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48 bg-popover border-border">
          <DropdownMenuItem
            onClick={handleAddText}
            className="cursor-pointer py-3"
          >
            <Type className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-sans">Text</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsOpen(false);
              setIsLinkDialogOpen(true);
            }}
            className="cursor-pointer py-3"
          >
            <Link2 className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-sans">Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => imageInputRef.current?.click()}
            className="cursor-pointer py-3"
          >
            <Image className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-sans">Image</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => pdfInputRef.current?.click()}
            className="cursor-pointer py-3"
          >
            <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-sans">PDF</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
