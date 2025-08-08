-- Remove image_path column from events table
ALTER TABLE events DROP COLUMN image_path;

-- Remove image_path column from groups table
ALTER TABLE groups DROP COLUMN image_path;