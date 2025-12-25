-- Fix inspection_results table schema
-- Add missing columns required by inspection service

ALTER TABLE inspection_results
ADD COLUMN IF NOT EXISTS offline_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;

-- Comment on columns
COMMENT ON COLUMN inspection_results.offline_created_at IS 'Timestamp when result was created offline';
COMMENT ON COLUMN inspection_results.sync_version IS 'Version number for conflict resolution during sync';
