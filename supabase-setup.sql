-- ============================================
-- SUPABASE COMPLETE SETUP SCRIPT
-- ============================================
-- This script creates everything from scratch:
-- - Database tables (entries, blocks)
-- - Storage bucket (media)
-- - Row Level Security (RLS) policies
-- - Indexes for performance
-- ============================================

-- ============================================
-- STEP 1: CREATE TABLES
-- ============================================

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'pdf', 'link')),
  content TEXT NOT NULL,
  file_name TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_blocks_entry_id ON blocks(entry_id);
CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(entry_id, position);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_created_by ON entries(created_by);

-- ============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE RLS POLICIES FOR ENTRIES TABLE
-- ============================================

-- Allow anyone to read entries
CREATE POLICY "Allow public read access on entries"
  ON entries FOR SELECT
  USING (true);

-- Allow anyone to insert entries
CREATE POLICY "Allow public insert access on entries"
  ON entries FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update entries
CREATE POLICY "Allow public update access on entries"
  ON entries FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete entries
CREATE POLICY "Allow public delete access on entries"
  ON entries FOR DELETE
  USING (true);

-- ============================================
-- STEP 5: CREATE RLS POLICIES FOR BLOCKS TABLE
-- ============================================

-- Allow anyone to read blocks
CREATE POLICY "Allow public read access on blocks"
  ON blocks FOR SELECT
  USING (true);

-- Allow anyone to insert blocks
CREATE POLICY "Allow public insert access on blocks"
  ON blocks FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update blocks
CREATE POLICY "Allow public update access on blocks"
  ON blocks FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete blocks
CREATE POLICY "Allow public delete access on blocks"
  ON blocks FOR DELETE
  USING (true);

-- ============================================
-- STEP 6: CREATE STORAGE BUCKET FOR MEDIA FILES
-- ============================================

-- Create the media bucket (public = true means files are publicly accessible)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  20971520, -- 20MB limit
  ARRAY['image/*', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/*', 'application/pdf'];

-- ============================================
-- STEP 7: CREATE STORAGE POLICIES FOR MEDIA BUCKET
-- ============================================

-- Allow public uploads to media bucket
CREATE POLICY "Allow public uploads to media bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- Allow public reads from media bucket
CREATE POLICY "Allow public reads from media bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow public deletes from media bucket
CREATE POLICY "Allow public deletes from media bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');

-- Allow public updates to media bucket (for file replacements if needed)
CREATE POLICY "Allow public updates to media bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- ============================================
-- STEP 8: VERIFY SETUP (OPTIONAL)
-- ============================================

-- Uncomment these lines to verify everything was created:
-- SELECT 'entries table created' AS status WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'entries');
-- SELECT 'blocks table created' AS status WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blocks');
-- SELECT 'media bucket created' AS status WHERE EXISTS (SELECT FROM storage.buckets WHERE id = 'media');
-- SELECT COUNT(*) AS policy_count FROM pg_policies WHERE tablename IN ('entries', 'blocks');

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready to use.
-- Tables: entries, blocks
-- Storage: media bucket (public, 20MB limit)
-- RLS: Enabled with public access policies
-- ============================================
