-- Add missing COMMON_UPDATE_FAIL message
INSERT INTO messages (id, code, category, type, message_en, message_ko, status, created_at, updated_at)
VALUES (
  'msg-update-fail-001',
  'COMMON_UPDATE_FAIL',
  'common',
  'error',
  'Update failed.',
  '수정에 실패했습니다.',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (code) DO NOTHING;
