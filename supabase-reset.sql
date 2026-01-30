-- ============================================
-- SUPABASE RESET SCRIPT - DANGER: DELETES EVERYTHING
-- ============================================
-- This script will DELETE all data and reset your database
-- Run this ONLY if you want to start completely fresh
-- ============================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access on entries" ON entries;
DROP POLICY IF EXISTS "Allow public insert access on entries" ON entries;
DROP POLICY IF EXISTS "Allow public update access on entries" ON entries;
DROP POLICY IF EXISTS "Allow public delete access on entries" ON entries;

DROP POLICY IF EXISTS "Allow public read access on blocks" ON blocks;
DROP POLICY IF EXISTS "Allow public insert access on blocks" ON blocks;
DROP POLICY IF EXISTS "Allow public update access on blocks" ON blocks;
DROP POLICY IF EXISTS "Allow public delete access on blocks" ON blocks;

DROP POLICY IF EXISTS "Allow public uploads to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to media bucket" ON storage.objects;

-- Step 2: Delete all storage objects in media bucket
DELETE FROM storage.objects WHERE bucket_id = 'media';

-- Step 3: Drop storage bucket (if exists)
DELETE FROM storage.buckets WHERE id = 'media';

-- Step 4: Drop tables (CASCADE will delete dependent objects)
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS entries CASCADE;

-- Step 5: Verify cleanup (optional - comment out if you don't want to see results)
-- SELECT 'Cleanup complete! All tables, policies, and storage have been removed.' AS status;
