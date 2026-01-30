// Entry and Block storage using Supabase
import { supabase } from './supabase';

export type BlockType = 'text' | 'image' | 'pdf' | 'link';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
}

export interface LinkBlock {
  id: string;
  type: 'link';
  content: string; // URL
  title?: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  content: string; // storage URL
  name: string;
}

export interface PdfBlock {
  id: string;
  type: 'pdf';
  content: string; // storage URL
  name: string;
}

export type Block = TextBlock | LinkBlock | ImageBlock | PdfBlock;

export interface Entry {
  id: string;
  title: string;
  description?: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Database types
interface DbEntry {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DbBlock {
  id: string;
  entry_id: string;
  type: string;
  content: string;
  file_name: string | null;
  position: number;
  created_at: string;
}

// Transform database entry to app entry
function transformEntry(dbEntry: DbEntry, blocks: Block[]): Entry {
  return {
    id: dbEntry.id,
    title: dbEntry.title,
    description: dbEntry.description || undefined,
    blocks,
    createdAt: dbEntry.created_at,
    updatedAt: dbEntry.updated_at,
    createdBy: dbEntry.created_by,
  };
}

// Transform database block to app block
function transformBlock(dbBlock: DbBlock): Block {
  if (dbBlock.type === 'text') {
    return {
      id: dbBlock.id,
      type: 'text',
      content: dbBlock.content,
    };
  } else if (dbBlock.type === 'link') {
    return {
      id: dbBlock.id,
      type: 'link',
      content: dbBlock.content,
      title: dbBlock.file_name || undefined,
    };
  } else if (dbBlock.type === 'image') {
    return {
      id: dbBlock.id,
      type: 'image',
      content: dbBlock.content,
      name: dbBlock.file_name || 'image',
    };
  } else if (dbBlock.type === 'pdf') {
    return {
      id: dbBlock.id,
      type: 'pdf',
      content: dbBlock.content,
      name: dbBlock.file_name || 'document.pdf',
    };
  } else {
    // Fallback: treat unknown block types as text to avoid crashing the UI
    return {
      id: dbBlock.id,
      type: 'text',
      content: dbBlock.content,
    };
  }
}

export async function getEntries(): Promise<Entry[]> {
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (entriesError) {
    console.error('Error fetching entries:', entriesError);
    return [];
  }

  const { data: allBlocks, error: blocksError } = await supabase
    .from('blocks')
    .select('*')
    .order('position', { ascending: true });

  if (blocksError) {
    console.error('Error fetching blocks:', blocksError);
    return [];
  }

  // Group blocks by entry_id
  const blocksByEntry = (allBlocks || []).reduce((acc, block) => {
    if (!acc[block.entry_id]) {
      acc[block.entry_id] = [];
    }
    acc[block.entry_id].push(transformBlock(block));
    return acc;
  }, {} as Record<string, Block[]>);

  return (entries || []).map(entry => 
    transformEntry(entry, blocksByEntry[entry.id] || [])
  );
}

export async function getEntry(id: string): Promise<Entry | null> {
  const { data: entry, error: entryError } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (entryError || !entry) {
    console.error('Error fetching entry:', entryError);
    return null;
  }

  const { data: blocks, error: blocksError } = await supabase
    .from('blocks')
    .select('*')
    .eq('entry_id', id)
    .order('position', { ascending: true });

  if (blocksError) {
    console.error('Error fetching blocks:', blocksError);
    return null;
  }

  return transformEntry(entry, (blocks || []).map(transformBlock));
}

export async function createEntry(
  title: string, 
  description: string | undefined, 
  createdBy: string
): Promise<Entry | null> {
  const { data, error } = await supabase
    .from('entries')
    .insert({
      title,
      description: description || null,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating entry:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }

  return transformEntry(data, []);
}

export async function updateEntry(
  id: string, 
  updates: Partial<Pick<Entry, 'title' | 'description'>>
): Promise<Entry | null> {
  const { error } = await supabase
    .from('entries')
    .update({
      title: updates.title,
      description: updates.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating entry:', error);
    return null;
  }

  return getEntry(id);
}

export async function deleteEntry(id: string): Promise<boolean> {
  // First, delete all files from storage for this entry's blocks
  const { data: blocks } = await supabase
    .from('blocks')
    .select('content, type')
    .eq('entry_id', id);

  if (blocks) {
    const filePaths = blocks
      .filter((b) => b.type === 'image' || b.type === 'pdf')
      .map(b => {
        // Extract path from URL
        const url = b.content;
        const match = url.match(/\/media\/(.+)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

    if (filePaths.length > 0) {
      await supabase.storage.from('media').remove(filePaths);
    }
  }

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting entry:', error);
    return false;
  }

  return true;
}

export async function addTextBlock(entryId: string, content: string): Promise<Block | null> {
  // Get current max position
  const { data: existingBlocks } = await supabase
    .from('blocks')
    .select('position')
    .eq('entry_id', entryId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingBlocks && existingBlocks.length > 0 
    ? existingBlocks[0].position + 1 
    : 0;

  const { data, error } = await supabase
    .from('blocks')
    .insert({
      entry_id: entryId,
      type: 'text',
      content,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding text block:', error);
    return null;
  }

  // Update entry's updated_at
  await supabase
    .from('entries')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', entryId);

  return transformBlock(data);
}

export async function addLinkBlock(
  entryId: string,
  url: string,
  title?: string
): Promise<Block | null> {
  // Get current max position
  const { data: existingBlocks } = await supabase
    .from('blocks')
    .select('position')
    .eq('entry_id', entryId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingBlocks && existingBlocks.length > 0
    ? existingBlocks[0].position + 1
    : 0;

  const { data, error } = await supabase
    .from('blocks')
    .insert({
      entry_id: entryId,
      type: 'link',
      content: url,
      file_name: title?.trim() ? title.trim() : null,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding link block:', error);
    return null;
  }

  // Update entry's updated_at
  await supabase
    .from('entries')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', entryId);

  return transformBlock(data);
}

export async function addFileBlock(
  entryId: string, 
  file: File, 
  type: 'image' | 'pdf'
): Promise<Block | null> {
  // Upload file to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${entryId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  // Get current max position
  const { data: existingBlocks } = await supabase
    .from('blocks')
    .select('position')
    .eq('entry_id', entryId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingBlocks && existingBlocks.length > 0 
    ? existingBlocks[0].position + 1 
    : 0;

  const { data, error } = await supabase
    .from('blocks')
    .insert({
      entry_id: entryId,
      type,
      content: urlData.publicUrl,
      file_name: file.name,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding file block:', error);
    return null;
  }

  // Update entry's updated_at
  await supabase
    .from('entries')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', entryId);

  return transformBlock(data);
}

export async function updateBlock(
  entryId: string, 
  blockId: string, 
  content: string
): Promise<boolean> {
  const { error } = await supabase
    .from('blocks')
    .update({ content })
    .eq('id', blockId);

  if (error) {
    console.error('Error updating block:', error);
    return false;
  }

  // Update entry's updated_at
  await supabase
    .from('entries')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', entryId);

  return true;
}

export async function updateLinkBlock(
  entryId: string,
  blockId: string,
  url: string,
  title?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('blocks')
    .update({
      content: url,
      file_name: title?.trim() ? title.trim() : null,
    })
    .eq('id', blockId);

  if (error) {
    console.error('Error updating link block:', error);
    return false;
  }

  await supabase
    .from('entries')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', entryId);

  return true;
}

export async function deleteBlock(entryId: string, blockId: string): Promise<boolean> {
  // First get the block to check if it has a file
  const { data: block } = await supabase
    .from('blocks')
    .select('content, type')
    .eq('id', blockId)
    .maybeSingle();

  if (block && (block.type === 'image' || block.type === 'pdf')) {
    // Extract path and delete from storage
    const url = block.content;
    const match = url.match(/\/media\/(.+)$/);
    if (match) {
      await supabase.storage.from('media').remove([match[1]]);
    }
  }

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', blockId);

  if (error) {
    console.error('Error deleting block:', error);
    return false;
  }

  // Update entry's updated_at
  await supabase
    .from('entries')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', entryId);

  return true;
}
