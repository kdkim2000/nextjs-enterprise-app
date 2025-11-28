'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import AttachmentUpload from '@/components/common/AttachmentUpload';
import FileUploadZone from '@/components/common/FileUploadZone/FileUploadZone';
import { AttachmentFile } from '@/hooks/useAttachment';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attachment-tabpanel-${index}`}
      aria-labelledby={`attachment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AttachmentComponentsPage() {
  const locale = useCurrentLocale();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    router.push(`/${locale}/dev/components`);
  };

  return (
    <PageContainer>
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={handleBack}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <ArrowBack sx={{ mr: 0.5, fontSize: 16 }} />
            {getLocalizedValue({
              en: 'Component Library',
              ko: '컴포넌트 라이브러리',
              zh: '组件库',
              vi: 'Thư viện thành phần'
            }, locale)}
          </Link>
          <Typography color="text.primary">
            {getLocalizedValue({
              en: 'Attachments',
              ko: '첨부파일',
              zh: '附件',
              vi: 'Tệp đính kèm'
            }, locale)}
          </Typography>
        </Breadcrumbs>
      </Box>

      <PageHeader
        title={getLocalizedValue({
          en: 'Attachment Components',
          ko: '첨부파일 컴포넌트',
          zh: '附件组件',
          vi: 'Thành phần tệp đính kèm'
        }, locale)}
        description={getLocalizedValue({
          en: 'File upload components with attachment type integration',
          ko: '첨부파일 유형과 통합된 파일 업로드 컴포넌트',
          zh: '与附件类型集成的文件上传组件',
          vi: 'Thành phần tải lên tệp với tích hợp loại tệp đính kèm'
        }, locale)}
      />

      <Paper sx={{ width: '100%', mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="AttachmentUpload" />
            <Tab label="FileUploadZone" />
            <Tab label="useAttachment Hook" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AttachmentUploadTest locale={locale} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <FileUploadZoneTest locale={locale} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <UseAttachmentHookTest locale={locale} />
        </TabPanel>
      </Paper>
    </PageContainer>
  );
}

// ==========================================
// AttachmentUpload Test Section
// ==========================================

interface AttachmentUploadTestProps {
  locale: string;
}

function AttachmentUploadTest({ locale }: AttachmentUploadTestProps) {
  const [attachmentTypeCode, setAttachmentTypeCode] = useState('BOARD_GENERAL');
  const [referenceType, setReferenceType] = useState('test');
  const [referenceId, setReferenceId] = useState('test-001');
  const [autoFetch, setAutoFetch] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showDownload, setShowDownload] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [compact, setCompact] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<AttachmentFile[]>([]);
  const [lastAttachmentId, setLastAttachmentId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleUploadComplete = (attachmentId: string, files: AttachmentFile[]) => {
    setLastAttachmentId(attachmentId);
    setUploadedFiles(files);
    setLastError(null);
  };

  const handleFilesChange = (files: AttachmentFile[]) => {
    setUploadedFiles(files);
  };

  const handleError = (error: string) => {
    setLastError(error);
  };

  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" gutterBottom>
        AttachmentUpload Component
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {getLocalizedValue({
          en: 'A comprehensive file upload component that integrates with attachment types. Supports drag & drop, file validation, progress tracking, and more.',
          ko: '첨부파일 유형과 통합된 포괄적인 파일 업로드 컴포넌트입니다. 드래그 앤 드롭, 파일 검증, 진행률 추적 등을 지원합니다.',
          zh: '与附件类型集成的综合文件上传组件。支持拖放、文件验证、进度跟踪等功能。',
          vi: 'Thành phần tải lên tệp toàn diện tích hợp với các loại tệp đính kèm. Hỗ trợ kéo và thả, xác thực tệp, theo dõi tiến trình, v.v.'
        }, locale)}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Card sx={{ flex: 1 }}>
          <CardHeader
            title={getLocalizedValue({ en: 'Configuration', ko: '설정', zh: '配置', vi: 'Cấu hình' }, locale)}
            titleTypographyProps={{ variant: 'subtitle1' }}
          />
          <CardContent>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Attachment Type Code</InputLabel>
                <Select
                  value={attachmentTypeCode}
                  label="Attachment Type Code"
                  onChange={(e) => setAttachmentTypeCode(e.target.value)}
                >
                  <MenuItem value="BOARD_GENERAL">BOARD_GENERAL (게시판 첨부)</MenuItem>
                  <MenuItem value="PROFILE_IMAGE">PROFILE_IMAGE (프로필 이미지)</MenuItem>
                  <MenuItem value="DOCUMENT">DOCUMENT (문서)</MenuItem>
                  <MenuItem value="IMAGE_ONLY">IMAGE_ONLY (이미지 전용)</MenuItem>
                  <MenuItem value="TEMP_UPLOAD">TEMP_UPLOAD (임시 업로드)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Reference Type"
                size="small"
                fullWidth
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value)}
                helperText="e.g., post, comment, user"
              />

              <TextField
                label="Reference ID"
                size="small"
                fullWidth
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                helperText="e.g., post-123, user-456"
              />

              <Divider />

              <FormControlLabel
                control={<Switch checked={autoFetch} onChange={(e) => setAutoFetch(e.target.checked)} />}
                label="Auto Fetch Existing"
              />
              <FormControlLabel
                control={<Switch checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />}
                label="Show Preview"
              />
              <FormControlLabel
                control={<Switch checked={showDownload} onChange={(e) => setShowDownload(e.target.checked)} />}
                label="Show Download"
              />
              <FormControlLabel
                control={<Switch checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />}
                label="Disabled"
              />
              <FormControlLabel
                control={<Switch checked={compact} onChange={(e) => setCompact(e.target.checked)} />}
                label="Compact Mode"
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 2 }}>
          <CardHeader
            title={getLocalizedValue({ en: 'Preview', ko: '미리보기', zh: '预览', vi: 'Xem trước' }, locale)}
            titleTypographyProps={{ variant: 'subtitle1' }}
          />
          <CardContent>
            <AttachmentUpload
              attachmentTypeCode={attachmentTypeCode}
              referenceType={referenceType}
              referenceId={referenceId}
              locale={locale}
              autoFetch={autoFetch}
              showPreview={showPreview}
              showDownload={showDownload}
              disabled={disabled}
              compact={compact}
              onUploadComplete={handleUploadComplete}
              onChange={handleFilesChange}
              onError={handleError}
              helperText={getLocalizedValue({
                en: 'Drag and drop files or click to browse',
                ko: '파일을 드래그 앤 드롭하거나 클릭하여 찾아보세요',
                zh: '拖放文件或点击浏览',
                vi: 'Kéo và thả tệp hoặc nhấp để duyệt'
              }, locale)}
            />
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ mt: 3 }}>
        <CardHeader
          title={getLocalizedValue({ en: 'Results / Events', ko: '결과 / 이벤트', zh: '结果 / 事件', vi: 'Kết quả / Sự kiện' }, locale)}
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
        <CardContent>
          {lastError && <Alert severity="error" sx={{ mb: 2 }}>Error: {lastError}</Alert>}
          {lastAttachmentId && <Alert severity="success" sx={{ mb: 2 }}>Attachment ID: {lastAttachmentId}</Alert>}

          <Typography variant="subtitle2" gutterBottom>
            Uploaded Files ({uploadedFiles.length}):
          </Typography>

          {uploadedFiles.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {uploadedFiles.map((file) => (
                <Chip
                  key={file.id}
                  label={`${file.originalFilename} (${(file.fileSize / 1024).toFixed(1)} KB)`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No files uploaded yet
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardHeader
          title={getLocalizedValue({ en: 'Usage Example', ko: '사용 예제', zh: '使用示例', vi: 'Ví dụ sử dụng' }, locale)}
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
        <CardContent>
          <Box
            component="pre"
            sx={{
              p: 2,
              backgroundColor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
{`import AttachmentUpload from '@/components/common/AttachmentUpload';

<AttachmentUpload
  attachmentTypeCode="BOARD_GENERAL"
  referenceType="post"
  referenceId="post-123"
  locale="ko"
  autoFetch={true}
  showPreview={true}
  showDownload={true}
  onUploadComplete={(attachmentId, files) => {
    console.log('Uploaded:', attachmentId, files);
  }}
  onChange={(files) => {
    console.log('Files changed:', files);
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
/>`}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

// ==========================================
// FileUploadZone Test Section
// ==========================================

interface FileUploadZoneTestProps {
  locale: string;
}

function FileUploadZoneTest({ locale }: FileUploadZoneTestProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [maxFiles, setMaxFiles] = useState(5);
  const [maxSize, setMaxSize] = useState(10);
  const [showPreview, setShowPreview] = useState(true);
  const [disabled, setDisabled] = useState(false);

  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" gutterBottom>
        FileUploadZone Component
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {getLocalizedValue({
          en: 'A simpler file upload zone component for basic use cases. Does not integrate with attachment types.',
          ko: '기본 사용 사례를 위한 간단한 파일 업로드 영역 컴포넌트입니다. 첨부파일 유형과 통합되지 않습니다.',
          zh: '用于基本用例的简单文件上传区域组件。不与附件类型集成。',
          vi: 'Thành phần vùng tải lên tệp đơn giản cho các trường hợp sử dụng cơ bản. Không tích hợp với các loại tệp đính kèm.'
        }, locale)}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Card sx={{ flex: 1 }}>
          <CardHeader
            title={getLocalizedValue({ en: 'Configuration', ko: '설정', zh: '配置', vi: 'Cấu hình' }, locale)}
            titleTypographyProps={{ variant: 'subtitle1' }}
          />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Max Files"
                type="number"
                size="small"
                fullWidth
                value={maxFiles}
                onChange={(e) => setMaxFiles(parseInt(e.target.value) || 1)}
              />

              <TextField
                label="Max Size (MB)"
                type="number"
                size="small"
                fullWidth
                value={maxSize}
                onChange={(e) => setMaxSize(parseInt(e.target.value) || 1)}
              />

              <Divider />

              <FormControlLabel
                control={<Switch checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />}
                label="Show Preview"
              />
              <FormControlLabel
                control={<Switch checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />}
                label="Disabled"
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 2 }}>
          <CardHeader
            title={getLocalizedValue({ en: 'Preview', ko: '미리보기', zh: '预览', vi: 'Xem trước' }, locale)}
            titleTypographyProps={{ variant: 'subtitle1' }}
          />
          <CardContent>
            <FileUploadZone
              value={files}
              onChange={setFiles}
              maxFiles={maxFiles}
              maxSize={maxSize * 1024 * 1024}
              showPreview={showPreview}
              disabled={disabled}
            />
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ mt: 3 }}>
        <CardHeader
          title={getLocalizedValue({ en: 'Selected Files', ko: '선택된 파일', zh: '已选择的文件', vi: 'Các tệp đã chọn' }, locale)}
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Files ({files.length}):
          </Typography>

          {files.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {files.map((file, index) => (
                <Chip
                  key={index}
                  label={`${file.file.name} (${(file.file.size / 1024).toFixed(1)} KB)`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No files selected yet
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardHeader
          title={getLocalizedValue({ en: 'Usage Example', ko: '사용 예제', zh: '使用示例', vi: 'Ví dụ sử dụng' }, locale)}
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
        <CardContent>
          <Box
            component="pre"
            sx={{
              p: 2,
              backgroundColor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
{`import FileUploadZone from '@/components/common/FileUploadZone/FileUploadZone';

const [files, setFiles] = useState([]);

<FileUploadZone
  value={files}
  onChange={setFiles}
  maxFiles={5}
  maxSize={10 * 1024 * 1024} // 10MB
  showPreview={true}
  disabled={false}
  helperText="Drag and drop files here"
/>`}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

// ==========================================
// useAttachment Hook Test Section
// ==========================================

interface UseAttachmentHookTestProps {
  locale: string;
}

function UseAttachmentHookTest({ locale }: UseAttachmentHookTestProps) {
  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" gutterBottom>
        useAttachment Hook
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {getLocalizedValue({
          en: 'A React hook for managing attachments programmatically. Provides state management, file upload, validation, and API integration.',
          ko: '프로그래밍 방식으로 첨부파일을 관리하기 위한 React 훅입니다. 상태 관리, 파일 업로드, 유효성 검사 및 API 통합을 제공합니다.',
          zh: '用于以编程方式管理附件的React钩子。提供状态管理、文件上传、验证和API集成。',
          vi: 'React hook để quản lý tệp đính kèm theo chương trình. Cung cấp quản lý trạng thái, tải lên tệp, xác thực và tích hợp API.'
        }, locale)}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Card>
        <CardHeader
          title="Hook API"
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
        <CardContent>
          <Box
            component="pre"
            sx={{
              p: 2,
              backgroundColor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
{`import { useAttachment } from '@/hooks/useAttachment';

const {
  // State
  attachment,        // Current attachment group
  attachmentType,    // Attachment type settings
  uploading,         // Upload in progress
  uploadProgress,    // Array of upload progress items
  loading,           // Loading existing attachments
  error,             // Error message

  // Actions
  fetchAttachmentType,   // Fetch attachment type settings
  fetchAttachments,      // Fetch existing attachments
  uploadFiles,           // Upload files
  deleteFile,            // Delete single file
  deleteAttachment,      // Delete entire attachment group
  downloadFile,          // Download file
  updateReference,       // Link attachment to a record
  validateFile,          // Validate file before upload

  // Setters
  setAttachment,
  setError
} = useAttachment({
  attachmentTypeCode: 'BOARD_GENERAL',
  referenceType: 'post',
  referenceId: 'post-123',
  onUploadComplete: (result) => {
    console.log('Upload complete:', result);
  },
  onError: (error) => {
    console.error('Upload error:', error);
  }
});`}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardHeader
          title={getLocalizedValue({ en: 'Features', ko: '기능', zh: '功能', vi: 'Tính năng' }, locale)}
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
        <CardContent>
          <Stack spacing={1}>
            {[
              { en: 'File validation against attachment type settings', ko: '첨부파일 유형 설정에 따른 파일 유효성 검사' },
              { en: 'Upload progress tracking', ko: '업로드 진행률 추적' },
              { en: 'File checksum calculation for duplicate detection', ko: '중복 감지를 위한 파일 체크섬 계산' },
              { en: 'Automatic attachment group management', ko: '자동 첨부 그룹 관리' },
              { en: 'Reference linking (post, comment, user, etc.)', ko: '참조 연결 (게시글, 댓글, 사용자 등)' },
              { en: 'Download with original filename restoration', ko: '원본 파일명 복원 다운로드' },
              { en: 'Soft delete support', ko: '소프트 삭제 지원' }
            ].map((feature, index) => (
              <Typography key={index} variant="body2">
                • {getLocalizedValue(feature, locale)}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardHeader
          title={getLocalizedValue({ en: 'Related Files', ko: '관련 파일', zh: '相关文件', vi: 'Các tệp liên quan' }, locale)}
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              • src/hooks/useAttachment.ts
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              • src/components/common/AttachmentUpload/index.tsx
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              • backend/services/attachmentService.js
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              • backend/routes/attachment.js
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              • migration/add_attachments.sql
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
