import { PdfBlock as PdfBlockType } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfBlockProps {
  block: PdfBlockType;
  onDelete: () => void;
  canDelete: boolean;
}

export function PdfBlock({ block, onDelete, canDelete }: PdfBlockProps) {
  // Build a viewer URL that hides side panels / toolbars where supported
  const pdfUrl = (() => {
    const [base] = block.content.split('#');
    const viewerParams = '#page=1&view=FitH&toolbar=0&navpanes=0';
    return `${base}${viewerParams}`;
  })();

  return (
    <div className="group relative bg-secondary/20 rounded-xl p-4 hover:bg-secondary/30 transition-gentle">
      {/* PDF Viewer - scrollable through all pages */}
      <div className="relative bg-background rounded-lg overflow-hidden" style={{ height: '1000px' }}>
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={block.name}
        />
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
