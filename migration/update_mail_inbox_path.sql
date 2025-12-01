-- Update mail inbox menu path from /mail to /mail/inbox
UPDATE menus SET path = '/mail/inbox' WHERE path = '/mail' AND name_ko = '받은메일함';

-- Verify the update
SELECT id, name_ko, name_en, path FROM menus WHERE path LIKE '/mail%' OR path LIKE '/admin/mail%';
