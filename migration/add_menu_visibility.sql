-- ==========================================
-- Add Mobile/Desktop Visibility to Menus
-- ==========================================

-- Add mobile_enabled and desktop_enabled columns
ALTER TABLE menus ADD COLUMN IF NOT EXISTS mobile_enabled BOOLEAN DEFAULT true;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS desktop_enabled BOOLEAN DEFAULT true;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_menus_mobile_enabled ON menus(mobile_enabled);
CREATE INDEX IF NOT EXISTS idx_menus_desktop_enabled ON menus(desktop_enabled);

-- Update existing menus with sensible defaults
-- Admin-only menus: desktop only
UPDATE menus SET mobile_enabled = false WHERE path LIKE '/admin/%' AND path NOT IN (
    '/admin/boards',
    '/admin/posts'
);

-- Keep these menus available on mobile
UPDATE menus SET mobile_enabled = true WHERE path IN (
    '/dashboard',
    '/dashboard/settings',
    '/boards'
) OR path LIKE '/boards/%';

-- All parent menus (no program_id) should follow their children
-- This will be handled by application logic

-- Verify changes
SELECT code, path, mobile_enabled, desktop_enabled
FROM menus
ORDER BY level, "order";
