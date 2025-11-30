-- Migration: Add is_applied column to app_settings table
-- Purpose: Separate "ready" (setting is configured) from "applied" (setting is active in app)
--
-- is_ready: Setting value is properly configured and ready to use
-- is_applied: Setting is actively being used by the application

-- Add is_applied column
ALTER TABLE app_settings
ADD COLUMN IF NOT EXISTS is_applied BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN app_settings.is_applied IS 'Whether this setting is actively applied to the application';
COMMENT ON COLUMN app_settings.is_ready IS 'Whether this setting value is properly configured and ready to use';

-- Update existing ready settings to also be applied (backward compatibility)
UPDATE app_settings SET is_applied = is_ready WHERE is_applied IS NULL OR is_applied = false;

-- Create index for faster queries on applied settings
CREATE INDEX IF NOT EXISTS idx_app_settings_is_applied ON app_settings(is_applied);

-- Verification query
SELECT key, is_ready, is_applied FROM app_settings ORDER BY category, display_order;
