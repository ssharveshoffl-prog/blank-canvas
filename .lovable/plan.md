

## Plan: Connect Gallery Photo Delete to Backend

This plan will wire up the delete button in the gallery so that when sarru clicks delete, the photo is permanently removed from both the database and Supabase Storage.

---

### What Will Happen

When sarru clicks the delete button on a photo in the gallery:
1. A confirmation dialog will appear to prevent accidental deletions
2. If confirmed, the photo will be deleted from:
   - **Supabase Storage** (the actual image file)
   - **Database `blocks` table** (the record)
   - **Any albums** containing the photo (the `album_photos` references)
3. The gallery will refresh to show the updated photo list

---

### Changes Overview

| File | Change |
|------|--------|
| `src/lib/gallery.ts` | Add new `deletePhoto` function |
| `src/components/gallery/GalleryPage.tsx` | Add delete handler and pass to PhotoGrid |
| `src/components/gallery/PhotoGrid.tsx` | Add confirmation dialog before delete |

---

### Technical Details

#### 1. Add `deletePhoto` function to gallery.ts

Create a new function that:
- First removes the photo from all albums (delete from `album_photos` table)
- Then calls the existing `deleteBlock` function from `entries.ts` which handles:
  - Deleting the file from Supabase Storage
  - Deleting the record from the `blocks` table

```typescript
export async function deletePhoto(photo: Photo): Promise<boolean> {
  // Remove from all albums first
  await supabase
    .from('album_photos')
    .delete()
    .eq('block_id', photo.id);

  // Use existing deleteBlock which handles storage + db deletion
  return await deleteBlock(photo.entryId, photo.id);
}
```

#### 2. Update GalleryPage.tsx

- Import the new `deletePhoto` function
- Create a `handleDeletePhoto` async function
- Pass it to the `PhotoGrid` component
- Refresh data after deletion
- Show a success toast notification

#### 3. Update PhotoGrid.tsx

- Add an `AlertDialog` confirmation before deleting
- Show photo preview in the confirmation dialog
- Warn that deletion is permanent and will remove from all albums

---

### No SQL Changes Needed

Your existing RLS policies already allow public deletes on the `blocks` and `album_photos` tables, so no Supabase changes are required.

