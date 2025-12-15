'use client';

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  FormControlLabel,
  Checkbox,
  Box,
  Typography
} from '@mui/material';
import {
  Smartphone as SmartphoneIcon,
  DesktopWindows as DesktopIcon
} from '@mui/icons-material';
import { MenuItem as MenuItemType } from '@/types/menu';
import { MenuFormData } from '@/app/[locale]/admin/menus/types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import IconSelect from '@/components/common/IconSelect';

export interface MenuFormFieldsProps {
  menu: MenuFormData | null;
  onChange: (menu: MenuFormData) => void;
  allMenus: MenuItemType[];
  locale: string;
   
  t: any;
}

export default function MenuFormFields({
  menu,
  onChange,
  allMenus,
  locale,
  t
}: MenuFormFieldsProps) {
  if (!menu) return null;

  const handleChange = (field: keyof MenuFormData, value: string | number | boolean | null) => {
    onChange({ ...menu, [field]: value });
  };

  return (
    <Stack spacing={3}>
      {/* Menu Code */}
      <TextField
        label={t('menuManagement.menuCode')}
        fullWidth
        required
        value={menu.code || ''}
        onChange={(e) => handleChange('code', e.target.value)}
      />

      {/* Menu Name (English) */}
      <TextField
        label={t('menuManagement.menuNameEn')}
        fullWidth
        required
        value={menu.nameEn || ''}
        onChange={(e) => handleChange('nameEn', e.target.value)}
      />

      {/* Menu Name (Korean) */}
      <TextField
        label={t('menuManagement.menuNameKo')}
        fullWidth
        required
        value={menu.nameKo || ''}
        onChange={(e) => handleChange('nameKo', e.target.value)}
      />

      {/* Menu Name (Chinese) */}
      <TextField
        label="Menu Name (Chinese)"
        fullWidth
        value={menu.nameZh || ''}
        onChange={(e) => handleChange('nameZh', e.target.value)}
        placeholder="中文菜单名称"
      />

      {/* Menu Name (Vietnamese) */}
      <TextField
        label="Menu Name (Vietnamese)"
        fullWidth
        value={menu.nameVi || ''}
        onChange={(e) => handleChange('nameVi', e.target.value)}
        placeholder="Tên menu tiếng Việt"
      />

      {/* Path */}
      <TextField
        label={t('menuManagement.path')}
        fullWidth
        required
        value={menu.path || ''}
        onChange={(e) => handleChange('path', e.target.value)}
        helperText="e.g., /dashboard/settings"
      />

      {/* Icon */}
      <IconSelect
        value={menu.icon || 'Dashboard'}
        onChange={(value) => handleChange('icon', value)}
        label={t('menuManagement.icon')}
      />

      <Divider />

      {/* Order */}
      <TextField
        label={t('menuManagement.order')}
        type="number"
        fullWidth
        value={menu.order || 0}
        onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
      />

      {/* Level */}
      <TextField
        label={t('menuManagement.level')}
        type="number"
        fullWidth
        value={menu.level || 0}
        onChange={(e) => handleChange('level', parseInt(e.target.value) || 0)}
      />

      {/* Parent Menu */}
      <FormControl fullWidth>
        <InputLabel>{t('menuManagement.parent')}</InputLabel>
        <Select
          value={menu.parentId || ''}
          label={t('menuManagement.parent')}
          onChange={(e) => handleChange('parentId', e.target.value || null)}
        >
          <MenuItem value="">{t('menuManagement.rootMenu')}</MenuItem>
          {allMenus
            .filter(m => !menu.id || m.id !== menu.id)
            .map(menuItem => (
              <MenuItem key={menuItem.id} value={menuItem.id}>
                {getLocalizedValue(menuItem.name, locale)}
              </MenuItem>
            ))
          }
        </Select>
      </FormControl>

      {/* Program ID */}
      <TextField
        label={t('menuManagement.programId')}
        fullWidth
        value={menu.programId || ''}
        onChange={(e) => handleChange('programId', e.target.value)}
        helperText="Program identifier (optional)"
      />

      <Divider />

      {/* Visibility Settings */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          {locale === 'ko' ? '표시 설정' : 'Visibility Settings'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={menu.desktopEnabled ?? true}
                onChange={(e) => handleChange('desktopEnabled', e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DesktopIcon fontSize="small" />
                <span>{locale === 'ko' ? '데스크톱' : 'Desktop'}</span>
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={menu.mobileEnabled ?? true}
                onChange={(e) => handleChange('mobileEnabled', e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SmartphoneIcon fontSize="small" />
                <span>{locale === 'ko' ? '모바일' : 'Mobile'}</span>
              </Box>
            }
          />
        </Box>
      </Box>

      <Divider />

      {/* Description (English) */}
      <TextField
        label={t('menuManagement.descriptionEn')}
        fullWidth
        multiline
        rows={2}
        value={menu.descriptionEn || ''}
        onChange={(e) => handleChange('descriptionEn', e.target.value)}
      />

      {/* Description (Korean) */}
      <TextField
        label={t('menuManagement.descriptionKo')}
        fullWidth
        multiline
        rows={2}
        value={menu.descriptionKo || ''}
        onChange={(e) => handleChange('descriptionKo', e.target.value)}
      />

      {/* Description (Chinese) */}
      <TextField
        label="Description (Chinese)"
        fullWidth
        multiline
        rows={2}
        value={menu.descriptionZh || ''}
        onChange={(e) => handleChange('descriptionZh', e.target.value)}
        placeholder="中文描述"
      />

      {/* Description (Vietnamese) */}
      <TextField
        label="Description (Vietnamese)"
        fullWidth
        multiline
        rows={2}
        value={menu.descriptionVi || ''}
        onChange={(e) => handleChange('descriptionVi', e.target.value)}
        placeholder="Mô tả tiếng Việt"
      />
    </Stack>
  );
}
