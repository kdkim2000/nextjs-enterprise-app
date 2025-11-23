'use client';

import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Divider,
  Chip,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { BoardType } from '@/app/[locale]/admin/board-types/types';
import { BOARD_TYPE_OPTIONS, CATEGORY_OPTIONS, ROLE_OPTIONS } from '@/app/[locale]/admin/board-types/constants';

export interface BoardTypeFormData extends Partial<BoardType> {
  id?: string;
}

interface BoardTypeFormFieldsProps {
  boardType: BoardTypeFormData | null;
  onChange: (boardType: BoardTypeFormData) => void;
  locale?: string;
}

const BoardTypeFormFields: React.FC<BoardTypeFormFieldsProps> = ({
  boardType,
  onChange,
  locale = 'en'
}) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...boardType, [field]: value });
  };

  const handleSettingsChange = (field: string, value: any) => {
    onChange({
      ...boardType,
      settings: {
        ...boardType?.settings,
        [field]: value
      }
    });
  };

  const handleRolesChange = (field: 'write_roles' | 'read_roles') => (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange(field, typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Code"
            value={boardType?.code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            disabled={!!boardType?.id}
            helperText={boardType?.id ? "Code cannot be changed" : "Unique identifier for the board type"}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Type</InputLabel>
            <Select
              value={boardType?.type || 'normal'}
              onChange={(e) => handleChange('type', e.target.value)}
              label="Type"
            >
              {BOARD_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Name (English)"
            value={boardType?.name_en || ''}
            onChange={(e) => handleChange('name_en', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Name (Korean)"
            value={boardType?.name_ko || ''}
            onChange={(e) => handleChange('name_ko', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Name (Chinese)"
            value={boardType?.name_zh || ''}
            onChange={(e) => handleChange('name_zh', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Name (Vietnamese)"
            value={boardType?.name_vi || ''}
            onChange={(e) => handleChange('name_vi', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={boardType?.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              label="Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              value={boardType?.status || 'active'}
              onChange={(e) => handleChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Descriptions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Descriptions
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (English)"
            value={boardType?.description_en || ''}
            onChange={(e) => handleChange('description_en', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (Korean)"
            value={boardType?.description_ko || ''}
            onChange={(e) => handleChange('description_ko', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (Chinese)"
            value={boardType?.description_zh || ''}
            onChange={(e) => handleChange('description_zh', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (Vietnamese)"
            value={boardType?.description_vi || ''}
            onChange={(e) => handleChange('description_vi', e.target.value)}
          />
        </Grid>

        {/* Permissions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Permissions
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Write Roles</InputLabel>
            <Select
              multiple
              value={boardType?.write_roles || []}
              onChange={handleRolesChange('write_roles')}
              input={<OutlinedInput label="Write Roles" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Read Roles</InputLabel>
            <Select
              multiple
              value={boardType?.read_roles || []}
              onChange={handleRolesChange('read_roles')}
              input={<OutlinedInput label="Read Roles" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Settings */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Board Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={boardType?.settings?.allowComments ?? true}
                  onChange={(e) => handleSettingsChange('allowComments', e.target.checked)}
                />
              }
              label="Allow Comments"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={boardType?.settings?.allowAttachments ?? true}
                  onChange={(e) => handleSettingsChange('allowAttachments', e.target.checked)}
                />
              }
              label="Allow Attachments"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={boardType?.settings?.allowLikes ?? true}
                  onChange={(e) => handleSettingsChange('allowLikes', e.target.checked)}
                />
              }
              label="Allow Likes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={boardType?.settings?.requireApproval ?? false}
                  onChange={(e) => handleSettingsChange('requireApproval', e.target.checked)}
                />
              }
              label="Require Approval"
            />
          </FormGroup>
        </Grid>

        {boardType?.settings?.allowAttachments && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Attachments"
                value={boardType?.settings?.maxAttachments || 5}
                onChange={(e) => handleSettingsChange('maxAttachments', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Attachment Size (MB)"
                value={(boardType?.settings?.maxAttachmentSize || 10485760) / 1048576}
                onChange={(e) => handleSettingsChange('maxAttachmentSize', parseInt(e.target.value) * 1048576)}
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default BoardTypeFormFields;
