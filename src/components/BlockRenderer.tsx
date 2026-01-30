import { Block, updateBlock, updateLinkBlock, deleteBlock } from '@/lib/entries';
import { TextBlock } from '@/components/blocks/TextBlock';
import { ImageBlock } from '@/components/blocks/ImageBlock';
import { PdfBlock } from '@/components/blocks/PdfBlock';
import { LinkBlock } from '@/components/blocks/LinkBlock';

interface BlockRendererProps {
  entryId: string;
  block: Block;
  canDelete: boolean;
  isEditMode: boolean;
  onBlocksChange: () => void;
}

export function BlockRenderer({ entryId, block, canDelete, isEditMode, onBlocksChange }: BlockRendererProps) {
  const handleUpdateText = async (content: string) => {
    await updateBlock(entryId, block.id, content);
    onBlocksChange();
  };

  const handleUpdateLink = async (url: string, title?: string) => {
    await updateLinkBlock(entryId, block.id, url, title);
    onBlocksChange();
  };

  const handleDelete = async () => {
    await deleteBlock(entryId, block.id);
    onBlocksChange();
  };

  switch (block.type) {
    case 'text':
      return (
        <TextBlock
          block={block}
          onUpdate={handleUpdateText}
          onDelete={handleDelete}
          canDelete={canDelete && isEditMode}
          isEditMode={isEditMode}
        />
      );
    case 'link':
      return (
        <LinkBlock
          block={block}
          onUpdate={handleUpdateLink}
          onDelete={handleDelete}
          canDelete={canDelete && isEditMode}
          isEditMode={isEditMode}
        />
      );
    case 'image':
      return (
        <ImageBlock
          block={block}
          onDelete={handleDelete}
          canDelete={canDelete && isEditMode}
        />
      );
    case 'pdf':
      return (
        <PdfBlock
          block={block}
          onDelete={handleDelete}
          canDelete={canDelete && isEditMode}
        />
      );
    default:
      return null;
  }
}
