-- Migration: Update help.program_id to use programs.code instead of programs.id
-- This script updates the help table to reference programs by their code field
-- Generated: 2025-11-24

-- Step 1: Show current state before migration
SELECT 'Current help entries before migration:' as status;
SELECT h.id, h.program_id, h.title, h.language
FROM help h
ORDER BY h.program_id, h.language;

-- Step 2: Delete duplicate entries (keep only Korean ones from our recent insert)
-- Delete old entries that used incorrect program_ids
DELETE FROM help
WHERE id IN (
    'help-1762650973934',  -- PROG-USER-LIST (old)
    'help-1762691172641',  -- PROG-USER-LIST (old ko)
    'help-1762960000001',  -- PROG-USER-MGMT (old en)
    'help-1762960000002',  -- PROG-USER-MGMT (old ko)
    'help-1762960000003',  -- PROG-SETTINGS (old en)
    'help-1762960000004',  -- PROG-SETTINGS (old ko)
    'help-1762960000005',  -- PROG-ROLE-MGMT (old en)
    'help-1762960000006',  -- PROG-ROLE-MGMT (old ko)
    'help-1762960000007',  -- PROG-MENU-MGMT (old en)
    'help-1762960000008',  -- PROG-MENU-MGMT (old ko)
    'help-1762960000009',  -- PROG-DEPT-MGMT (old en)
    'help-1762960000010',  -- PROG-DEPT-MGMT (old ko)
    'help-1762960000011',  -- PROG-HELP-MGMT (old en)
    'help-1762960000012',  -- PROG-HELP-MGMT (old ko)
    'help-1762960000013',  -- PROG-LOGS (old en)
    'help-1762960000014'   -- PROG-LOGS (old ko)
);

SELECT 'Deleted old duplicate entries' as status;

-- Step 3: Update help.program_id from programs.id to programs.code
-- For entries where program_id matches programs.id, update to programs.code
UPDATE help h
SET program_id = p.code
FROM programs p
WHERE h.program_id = p.id
  AND h.program_id != p.code;  -- Only update if they are different

SELECT 'Updated help.program_id to use programs.code' as status;

-- Step 4: Verify the changes
SELECT 'Verification: help entries after migration' as status;
SELECT
    p.code as program_code,
    p.name_ko as program_name,
    COUNT(CASE WHEN h.language = 'ko' THEN 1 END) as korean_help_count,
    COUNT(CASE WHEN h.language = 'en' THEN 1 END) as english_help_count
FROM programs p
LEFT JOIN help h ON p.code = h.program_id
GROUP BY p.code, p.name_ko
ORDER BY p.code;

-- Step 5: Check for any orphaned help entries (not matching any program code)
SELECT 'Orphaned help entries (if any):' as status;
SELECT h.id, h.program_id, h.title, h.language
FROM help h
WHERE NOT EXISTS (
    SELECT 1 FROM programs p WHERE p.code = h.program_id
);

-- Step 6: Final summary
SELECT 'Migration completed successfully!' as status;
SELECT
    COUNT(*) as total_help_entries,
    COUNT(DISTINCT program_id) as unique_programs,
    COUNT(CASE WHEN language = 'ko' THEN 1 END) as korean_entries,
    COUNT(CASE WHEN language = 'en' THEN 1 END) as english_entries
FROM help;
