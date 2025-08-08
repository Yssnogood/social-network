-- Add image_path column to groups table
ALTER TABLE groups ADD COLUMN image_path TEXT;

-- Add image_path column to events table  
ALTER TABLE events ADD COLUMN image_path TEXT;