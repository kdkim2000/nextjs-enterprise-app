'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import DepartmentTreeSelect, { Department } from '@/components/common/DepartmentTreeSelect';
import DepartmentTreeInline from '@/components/common/DepartmentTreeInline';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';

// Mock department data
const mockDepartments: Department[] = [
  { id: 'D001', code: 'CORP', parent_id: null, name: { en: 'Corporation', ko: '전사', zh: '公司', vi: 'Tập đoàn' }, level: 0 },
  { id: 'D002', code: 'DEV', parent_id: 'D001', name: { en: 'Development', ko: '개발부', zh: '开发部', vi: 'Phát triển' }, level: 1 },
  { id: 'D003', code: 'DEV-FE', parent_id: 'D002', name: { en: 'Frontend Team', ko: '프론트엔드팀', zh: '前端团队', vi: 'Frontend' }, level: 2 },
  { id: 'D004', code: 'DEV-BE', parent_id: 'D002', name: { en: 'Backend Team', ko: '백엔드팀', zh: '后端团队', vi: 'Backend' }, level: 2 },
  { id: 'D005', code: 'DEV-QA', parent_id: 'D002', name: { en: 'QA Team', ko: 'QA팀', zh: 'QA团队', vi: 'QA' }, level: 2 },
  { id: 'D006', code: 'HR', parent_id: 'D001', name: { en: 'Human Resources', ko: '인사부', zh: '人力资源', vi: 'Nhân sự' }, level: 1 },
  { id: 'D007', code: 'HR-REC', parent_id: 'D006', name: { en: 'Recruitment', ko: '채용팀', zh: '招聘', vi: 'Tuyển dụng' }, level: 2 },
  { id: 'D008', code: 'HR-TRA', parent_id: 'D006', name: { en: 'Training', ko: '교육팀', zh: '培训', vi: 'Đào tạo' }, level: 2 },
  { id: 'D009', code: 'SALES', parent_id: 'D001', name: { en: 'Sales', ko: '영업부', zh: '销售部', vi: 'Kinh doanh' }, level: 1 },
  { id: 'D010', code: 'SALES-DOM', parent_id: 'D009', name: { en: 'Domestic Sales', ko: '국내영업팀', zh: '国内销售', vi: 'Nội địa' }, level: 2 },
  { id: 'D011', code: 'SALES-INT', parent_id: 'D009', name: { en: 'International Sales', ko: '해외영업팀', zh: '国际销售', vi: 'Quốc tế' }, level: 2 },
];

export default function DepartmentTreeSelectPage() {
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedDept2, setSelectedDept2] = useState<string>('D003');
  const [inlineDept, setInlineDept] = useState<string>('');

  return (
    <PageContainer fullHeight={false}>
      <PageHeader useMenu showBreadcrumb />

      <Stack spacing={4}>
        {/* Header */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            DepartmentTreeSelect Component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A tree-based department selection component with hierarchical navigation,
            search functionality, and multi-language support.
          </Typography>
        </Paper>

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dialog Mode (DepartmentTreeSelect)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click the input to open a dialog with the department tree.
          </Typography>

          <DepartmentTreeSelect
            value={selectedDept}
            onChange={setSelectedDept}
            departments={mockDepartments}
            locale="en"
            label="Select Department"
          />

          {selectedDept && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight={600}>
                Selected: {selectedDept}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* With Initial Value */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Initial Value
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pre-selected department with the tree auto-expanded.
          </Typography>

          <DepartmentTreeSelect
            value={selectedDept2}
            onChange={setSelectedDept2}
            departments={mockDepartments}
            locale="ko"
            label="부서 선택"
            required
          />
        </Paper>

        {/* Inline Mode */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Inline Mode (DepartmentTreeInline)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Displays the tree directly in the page without a dialog.
          </Typography>

          <Box sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
            <DepartmentTreeInline
              value={inlineDept}
              onChange={setInlineDept}
              departments={mockDepartments}
              locale="en"
            />
          </Box>

          {inlineDept && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight={600}>
                Selected: {inlineDept}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Error State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error State
          </Typography>

          <DepartmentTreeSelect
            value=""
            onChange={() => {}}
            departments={mockDepartments}
            locale="en"
            label="Department"
            required
            error
            helperText="Department is required"
          />
        </Paper>

        {/* Disabled State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Disabled State
          </Typography>

          <DepartmentTreeSelect
            value="D003"
            onChange={() => {}}
            departments={mockDepartments}
            locale="en"
            label="Department"
            disabled
          />
        </Paper>

        <Divider />

        {/* Props Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Props Reference
          </Typography>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Prop</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Type</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Default</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Description</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {[
                { prop: 'value', type: 'string', default: '-', desc: 'Selected department ID' },
                { prop: 'onChange', type: '(value: string) => void', default: '-', desc: 'Callback when selection changes' },
                { prop: 'departments', type: 'Department[]', default: '-', desc: 'Array of department data' },
                { prop: 'locale', type: "'en' | 'ko' | 'zh' | 'vi'", default: "'en'", desc: 'Language for department names' },
                { prop: 'label', type: 'string', default: "'Department'", desc: 'Input label' },
                { prop: 'required', type: 'boolean', default: 'false', desc: 'Mark as required' },
                { prop: 'disabled', type: 'boolean', default: 'false', desc: 'Disable selection' },
                { prop: 'error', type: 'boolean', default: 'false', desc: 'Error state' },
                { prop: 'helperText', type: 'string', default: '-', desc: 'Helper/error text' },
              ].map((row, index) => (
                <Box component="tr" key={index} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Box component="td" sx={{ p: 1 }}><code>{row.prop}</code></Box>
                  <Box component="td" sx={{ p: 1 }}><code>{row.type}</code></Box>
                  <Box component="td" sx={{ p: 1 }}>{row.default}</Box>
                  <Box component="td" sx={{ p: 1 }}>{row.desc}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Department Interface */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Department Interface
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: 13 }}>
            <pre style={{ margin: 0 }}>
{`interface Department {
  id: string;
  code: string;
  parent_id: string | null;
  name: {
    en: string;
    ko: string;
    zh: string;
    vi: string;
  };
  level: number;
}`}
            </pre>
          </Box>
        </Paper>

        {/* Usage Example */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Usage Example
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: 13 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`import DepartmentTreeSelect from '@/components/common/DepartmentTreeSelect';

const [departmentId, setDepartmentId] = useState('');

// Fetch departments from API
const { data: departments } = useQuery('departments', fetchDepartments);

<DepartmentTreeSelect
  value={departmentId}
  onChange={setDepartmentId}
  departments={departments || []}
  locale={currentLocale}
  label="Department"
  required
/>`}
            </pre>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
