'use client';

import React, { useState } from 'react';
import {
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Translate as TranslateIcon,
  AccountTree as AccountTreeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import CodeSelect from '@/components/common/CodeSelect';
import UserAutocomplete from '@/components/common/UserAutocomplete';
import DepartmentTreeInline, { Department } from '@/components/common/DepartmentTreeInline';

export interface DepartmentFormData {
  id?: string;
  code: string;
  nameEn: string;
  nameKo: string;
  nameZh: string;
  nameVi: string;
  descriptionEn: string;
  descriptionKo: string;
  descriptionZh: string;
  descriptionVi: string;
  parentId: string;
  managerId: string;
  status: 'active' | 'inactive';
  order: number;
}

export interface DepartmentFormFieldsProps {
  department: DepartmentFormData | null;
  onChange: (department: DepartmentFormData) => void;
  onError?: (error: string) => void;
  departments?: Department[];
  locale?: string;
  labels?: {
    code?: string;
    nameEn?: string;
    nameKo?: string;
    nameZh?: string;
    nameVi?: string;
    descriptionEn?: string;
    descriptionKo?: string;
    descriptionZh?: string;
    descriptionVi?: string;
    parentDepartment?: string;
    manager?: string;
    status?: string;
    order?: string;
    none?: string;
  };
}

export default function DepartmentFormFields({
  department,
  onChange,
  departments = [],
  locale = 'en',
  labels = {}
}: DepartmentFormFieldsProps) {
  const [expanded, setExpanded] = useState<string[]>(['basic', 'names', 'descriptions', 'hierarchy', 'settings']);

  if (!department) return null;

  const handleChange = (field: keyof DepartmentFormData, value: string | number) => {
    onChange({ ...department, [field]: value });
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  const isExpanded = (panel: string) => expanded.includes(panel);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Basic Information */}
      <Accordion
        expanded={isExpanded('basic')}
        onChange={handleAccordionChange('basic')}
        disableGutters
        elevation={0}
        sx={{
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'divider',
          '&:not(:last-child)': { borderBottom: 0 }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
            minHeight: 56
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Basic Information
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={labels.code || 'Code'}
            fullWidth
            required
            value={department.code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            disabled={!!department.id}
            helperText={department.id ? 'Code cannot be changed' : ''}
          />
        </AccordionDetails>
      </Accordion>

      {/* Names (Multi-language) */}
      <Accordion
        expanded={isExpanded('names')}
        onChange={handleAccordionChange('names')}
        disableGutters
        elevation={0}
        sx={{
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'divider',
          '&:not(:last-child)': { borderBottom: 0 }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
            minHeight: 56
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TranslateIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Names (Multi-language)
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={labels.nameEn || 'Name (English)'}
            fullWidth
            required
            value={department.nameEn || ''}
            onChange={(e) => handleChange('nameEn', e.target.value)}
          />
          <TextField
            label={labels.nameKo || 'Name (Korean)'}
            fullWidth
            required
            value={department.nameKo || ''}
            onChange={(e) => handleChange('nameKo', e.target.value)}
          />
          <TextField
            label={labels.nameZh || 'Name (Chinese)'}
            fullWidth
            required
            value={department.nameZh || ''}
            onChange={(e) => handleChange('nameZh', e.target.value)}
          />
          <TextField
            label={labels.nameVi || 'Name (Vietnamese)'}
            fullWidth
            required
            value={department.nameVi || ''}
            onChange={(e) => handleChange('nameVi', e.target.value)}
          />
        </AccordionDetails>
      </Accordion>

      {/* Descriptions (Multi-language) */}
      <Accordion
        expanded={isExpanded('descriptions')}
        onChange={handleAccordionChange('descriptions')}
        disableGutters
        elevation={0}
        sx={{
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'divider',
          '&:not(:last-child)': { borderBottom: 0 }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
            minHeight: 56
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TranslateIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Descriptions (Multi-language)
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={labels.descriptionEn || 'Description (English)'}
            fullWidth
            multiline
            rows={2}
            value={department.descriptionEn || ''}
            onChange={(e) => handleChange('descriptionEn', e.target.value)}
          />
          <TextField
            label={labels.descriptionKo || 'Description (Korean)'}
            fullWidth
            multiline
            rows={2}
            value={department.descriptionKo || ''}
            onChange={(e) => handleChange('descriptionKo', e.target.value)}
          />
          <TextField
            label={labels.descriptionZh || 'Description (Chinese)'}
            fullWidth
            multiline
            rows={2}
            value={department.descriptionZh || ''}
            onChange={(e) => handleChange('descriptionZh', e.target.value)}
          />
          <TextField
            label={labels.descriptionVi || 'Description (Vietnamese)'}
            fullWidth
            multiline
            rows={2}
            value={department.descriptionVi || ''}
            onChange={(e) => handleChange('descriptionVi', e.target.value)}
          />
        </AccordionDetails>
      </Accordion>

      {/* Hierarchy & Management */}
      <Accordion
        expanded={isExpanded('hierarchy')}
        onChange={handleAccordionChange('hierarchy')}
        disableGutters
        elevation={0}
        sx={{
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'divider',
          '&:not(:last-child)': { borderBottom: 0 }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
            minHeight: 56
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountTreeIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Hierarchy & Management
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DepartmentTreeInline
            value={department.parentId || ''}
            onChange={(value) => handleChange('parentId', value)}
            departments={departments}
            locale={locale}
            label={labels.parentDepartment || 'Parent Department'}
            allowNone={true}
            noneLabel={labels.none || 'None (Top Level)'}
            currentDepartmentId={department.id}
          />
          <UserAutocomplete
            value={department.managerId || null}
            onChange={(userId) => handleChange('managerId', userId || '')}
            label={labels.manager || 'Manager'}
            placeholder="Search by username or name..."
            fullWidth
          />
        </AccordionDetails>
      </Accordion>

      {/* Settings */}
      <Accordion
        expanded={isExpanded('settings')}
        onChange={handleAccordionChange('settings')}
        disableGutters
        elevation={0}
        sx={{
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
            minHeight: 56
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Settings
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CodeSelect
            codeType="COMMON_STATUS"
            value={department.status || 'active'}
            onChange={(value) => handleChange('status', value as 'active' | 'inactive')}
            label={labels.status || 'Status'}
            required
          />
          <TextField
            label={labels.order || 'Display Order'}
            type="number"
            fullWidth
            value={department.order || 1}
            onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
            inputProps={{ min: 1 }}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
