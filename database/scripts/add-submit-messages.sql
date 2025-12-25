-- Add missing submit message codes
INSERT INTO messages (id, code, category, type, message_en, message_ko, message_zh, message_vi, status, created_at, updated_at) VALUES
('msg_submit_success', 'COMMON_SUBMIT_SUCCESS', 'COMMON', 'SUCCESS', 'Successfully submitted.', '제출되었습니다.', '提交成功。', 'Đã gửi thành công.', 'active', NOW(), NOW()),
('msg_submit_fail', 'COMMON_SUBMIT_FAIL', 'COMMON', 'ERROR', 'Failed to submit.', '제출에 실패했습니다.', '提交失败。', 'Gửi không thành công.', 'active', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
