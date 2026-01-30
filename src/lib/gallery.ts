// Gallery and Album management using Supabase
import { supabase } from './supabase';

export interface Photo {
  id: string;
  content: string; // URL
  name: string;
  entryId: string;
  entryTitle: string;
  createdAt: string;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  coverPhotoUrl?: string;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumWithPhotos extends Album {
  photos: Photo[];
}

// Get all photos (images from blocks table)
export async function getAllPhotos(): Promise<Photo[]> {
  const { data: blocks, error } = await supabase
    .from('blocks')
    .select(`
      id,
      content,
      file_name,
      created_at,
      entry_id,
      entries!inner(title)
    `)
    .eq('type', 'image')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }

  return (blocks || []).map((block: any) => ({
    id: block.id,
    content: block.content,
    name: block.file_name || 'image',
    entryId: block.entry_id,
    entryTitle: block.entries?.title || 'Untitled',
    createdAt: block.created_at,
  }));
}

// Get all albums
export async function getAlbums(): Promise<Album[]> {
  const { data: albums, error: albumsError } = await supabase
    .from('albums')
    .select('*')
    .order('created_at', { ascending: false });

  if (albumsError) {
    console.error('Error fetching albums:', albumsError);
    return [];
  }

  // Get photo counts for each album
  const { data: photoCounts, error: countError } = await supabase
    .from('album_photos')
    .select('album_id');

  if (countError) {
    console.error('Error fetching photo counts:', countError);
  }

  const countMap: Record<string, number> = {};
  (photoCounts || []).forEach((ap: any) => {
    countMap[ap.album_id] = (countMap[ap.album_id] || 0) + 1;
  });

  // Get cover photos
  const coverPhotoIds = (albums || [])
    .filter(a => a.cover_photo_id)
    .map(a => a.cover_photo_id);

  let coverPhotos: Record<string, string> = {};
  if (coverPhotoIds.length > 0) {
    const { data: covers } = await supabase
      .from('blocks')
      .select('id, content')
      .in('id', coverPhotoIds);
    
    (covers || []).forEach((c: any) => {
      coverPhotos[c.id] = c.content;
    });
  }

  return (albums || []).map(album => ({
    id: album.id,
    name: album.name,
    description: album.description || undefined,
    coverPhotoId: album.cover_photo_id || undefined,
    coverPhotoUrl: album.cover_photo_id ? coverPhotos[album.cover_photo_id] : undefined,
    photoCount: countMap[album.id] || 0,
    createdAt: album.created_at,
    updatedAt: album.updated_at,
  }));
}

// Get album with photos
export async function getAlbumWithPhotos(albumId: string): Promise<AlbumWithPhotos | null> {
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('*')
    .eq('id', albumId)
    .maybeSingle();

  if (albumError || !album) {
    console.error('Error fetching album:', albumError);
    return null;
  }

  const { data: albumPhotos, error: photosError } = await supabase
    .from('album_photos')
    .select(`
      block_id,
      position,
      blocks!inner(
        id,
        content,
        file_name,
        created_at,
        entry_id,
        entries!inner(title)
      )
    `)
    .eq('album_id', albumId)
    .order('position', { ascending: true });

  if (photosError) {
    console.error('Error fetching album photos:', photosError);
    return null;
  }

  const photos: Photo[] = (albumPhotos || []).map((ap: any) => ({
    id: ap.blocks.id,
    content: ap.blocks.content,
    name: ap.blocks.file_name || 'image',
    entryId: ap.blocks.entry_id,
    entryTitle: ap.blocks.entries?.title || 'Untitled',
    createdAt: ap.blocks.created_at,
  }));

  let coverPhotoUrl: string | undefined;
  if (album.cover_photo_id) {
    const { data: cover } = await supabase
      .from('blocks')
      .select('content')
      .eq('id', album.cover_photo_id)
      .maybeSingle();
    coverPhotoUrl = cover?.content;
  }

  return {
    id: album.id,
    name: album.name,
    description: album.description || undefined,
    coverPhotoId: album.cover_photo_id || undefined,
    coverPhotoUrl,
    photoCount: photos.length,
    createdAt: album.created_at,
    updatedAt: album.updated_at,
    photos,
  };
}

// Create a new album
export async function createAlbum(name: string, description?: string): Promise<Album | null> {
  const { data, error } = await supabase
    .from('albums')
    .insert({
      name,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating album:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    photoCount: 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Update album
export async function updateAlbum(
  id: string,
  updates: { name?: string; description?: string; coverPhotoId?: string }
): Promise<boolean> {
  const { error } = await supabase
    .from('albums')
    .update({
      name: updates.name,
      description: updates.description || null,
      cover_photo_id: updates.coverPhotoId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating album:', error);
    return false;
  }

  return true;
}

// Delete album
export async function deleteAlbum(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting album:', error);
    return false;
  }

  return true;
}

// Add photo to album(s)
export async function addPhotoToAlbums(blockId: string, albumIds: string[]): Promise<boolean> {
  if (albumIds.length === 0) return true;

  // Get current max positions for each album
  const { data: existingPositions } = await supabase
    .from('album_photos')
    .select('album_id, position')
    .in('album_id', albumIds)
    .order('position', { ascending: false });

  const maxPositions: Record<string, number> = {};
  (existingPositions || []).forEach((ap: any) => {
    if (maxPositions[ap.album_id] === undefined) {
      maxPositions[ap.album_id] = ap.position;
    }
  });

  const insertData = albumIds.map(albumId => ({
    album_id: albumId,
    block_id: blockId,
    position: (maxPositions[albumId] ?? -1) + 1,
  }));

  const { error } = await supabase
    .from('album_photos')
    .upsert(insertData, { onConflict: 'album_id,block_id' });

  if (error) {
    console.error('Error adding photo to albums:', error);
    return false;
  }

  return true;
}

// Remove photo from album
export async function removePhotoFromAlbum(blockId: string, albumId: string): Promise<boolean> {
  const { error } = await supabase
    .from('album_photos')
    .delete()
    .eq('block_id', blockId)
    .eq('album_id', albumId);

  if (error) {
    console.error('Error removing photo from album:', error);
    return false;
  }

  return true;
}

// Get albums containing a specific photo
export async function getAlbumsForPhoto(blockId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('album_photos')
    .select('album_id')
    .eq('block_id', blockId);

  if (error) {
    console.error('Error fetching albums for photo:', error);
    return [];
  }

  return (data || []).map((ap: any) => ap.album_id);
}

// Upload photo directly to gallery (not tied to an entry)
export async function uploadPhotoToGallery(file: File): Promise<Photo | null> {
  // First we need a "gallery" entry to store standalone photos
  // Check if gallery entry exists, create if not
  let { data: galleryEntry } = await supabase
    .from('entries')
    .select('id')
    .eq('title', '__gallery__')
    .maybeSingle();

  if (!galleryEntry) {
    const { data: newEntry, error: entryError } = await supabase
      .from('entries')
      .insert({
        title: '__gallery__',
        description: 'System entry for standalone gallery photos',
        created_by: 'system',
      })
      .select()
      .single();

    if (entryError) {
      console.error('Error creating gallery entry:', entryError);
      return null;
    }
    galleryEntry = newEntry;
  }

  // Upload file to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `gallery/${Date.now()}.${fileExt}`;

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
    .eq('entry_id', galleryEntry.id)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingBlocks && existingBlocks.length > 0
    ? existingBlocks[0].position + 1
    : 0;

  const { data, error } = await supabase
    .from('blocks')
    .insert({
      entry_id: galleryEntry.id,
      type: 'image',
      content: urlData.publicUrl,
      file_name: file.name,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding photo block:', error);
    return null;
  }

  return {
    id: data.id,
    content: data.content,
    name: data.file_name || 'image',
    entryId: galleryEntry.id,
    entryTitle: 'Gallery',
    createdAt: data.created_at,
  };
}
