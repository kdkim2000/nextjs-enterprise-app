-- ==========================================
-- REQUIRED: Attachment Types
-- 첨부파일 유형 정의
-- ==========================================

-- Attachment Types (첨부파일 유형)
INSERT INTO attachment_types (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, storage_path, max_file_size, max_files, allowed_extensions, is_active, created_at, updated_at)
VALUES
    ('ATT-TYPE-001', 'BOARD_GENERAL', 'Board Attachment', '게시판 첨부', '公告板附件', 'Tệp đính kèm',
     'General board attachments', '일반 게시판 첨부파일',
     '/board', 10485760, 10, '["jpg","jpeg","png","gif","pdf","doc","docx","xls","xlsx","ppt","pptx","zip","txt"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('ATT-TYPE-002', 'PROFILE_IMAGE', 'Profile Image', '프로필 이미지', '头像图片', 'Ảnh hồ sơ',
     'User profile images', '사용자 프로필 이미지',
     '/profile', 5242880, 1, '["jpg","jpeg","png","gif"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('ATT-TYPE-003', 'DOCUMENT', 'Document', '문서', '文档', 'Tài liệu',
     'Document attachments', '문서 첨부파일',
     '/documents', 52428800, 20, '["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","hwp"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('ATT-TYPE-004', 'IMAGE_ONLY', 'Image Only', '이미지 전용', '仅图片', 'Chỉ hình ảnh',
     'Image only attachments', '이미지 전용 첨부파일',
     '/images', 10485760, 10, '["jpg","jpeg","png","gif","bmp","webp","svg"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('ATT-TYPE-005', 'TEMP_UPLOAD', 'Temporary Upload', '임시 업로드', '临时上传', 'Tải lên tạm thời',
     'Temporary file uploads', '임시 파일 업로드',
     '/temp', 10485760, 5, '["jpg","jpeg","png","gif","pdf","doc","docx","xls","xlsx","zip"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('ATT-TYPE-006', 'MAIL_ATTACHMENT', 'Mail Attachment', '메일 첨부', '邮件附件', 'Đính kèm thư',
     'Mail message attachments', '메일 메시지 첨부파일',
     '/mail', 26214400, 10, '["jpg","jpeg","png","gif","pdf","doc","docx","xls","xlsx","ppt","pptx","zip","txt"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
