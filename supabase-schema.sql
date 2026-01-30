-- Supabase Database Schema for Our Shared Infinity
-- Run this SQL in your Supabase SQL Editor to create the required tables

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blocks_entry_id ON blocks(entry_id);
CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(entry_id, position);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for entries table
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
  USING (true);

-- Allow anyone to delete entries
CREATE POLICY "Allow public delete access on entries"
  ON entries FOR DELETE
  USING (true);

-- Create policies for blocks table
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
  USING (true);

-- Allow anyone to delete blocks
CREATE POLICY "Allow public delete access on blocks"
  ON blocks FOR DELETE
  USING (true);

-- Create storage bucket for media files (images and PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow public uploads
CREATE POLICY "Allow public uploads to media bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- Create storage policy to allow public reads
CREATE POLICY "Allow public reads from media bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Create storage policy to allow public deletes
CREATE POLICY "Allow public deletes from media bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');
