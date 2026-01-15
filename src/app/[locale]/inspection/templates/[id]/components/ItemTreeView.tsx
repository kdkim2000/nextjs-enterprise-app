'use client';

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckBox as CheckBoxIcon,
  TextFields as TextIcon,
  Numbers as NumbersIcon,
  ListAlt as SelectIcon,
  PhotoCamera as PhotoIcon,
  Draw as SignatureIcon,
  CalendarToday as DateIcon,
  AccessTime as TimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { ChecksheetItem, ItemType } from '../types';

export interface ItemTreeViewProps {
  items: ChecksheetItem[];
  locale?: string;
  onEdit?: (item: ChecksheetItem) => void;
  onDelete?: (itemId: string) => void;
  onAddChild?: (parentId: string) => void;
  editable?: boolean;
}

const getItemTypeIcon = (type: ItemType) => {
  switch (type) {
    case 'checkbox':
      return <CheckBoxIcon fontSize="small" />;
    case 'text':
      return <TextIcon fontSize="small" />;
    case 'number':
      return <NumbersIcon fontSize="small" />;
    case 'select':
      return <SelectIcon fontSize="small" />;
    case 'photo':
      return <PhotoIcon fontSize="small" />;
    case 'signature':
      return <SignatureIcon fontSize="small" />;
    case 'date':
      return <DateIcon fontSize="small" />;
    case 'time':
      return <TimeIcon fontSize="small" />;
    default:
      return <CheckBoxIcon fontSize="small" />;
  }
};

const getItemTypeLabel = (type: ItemType, locale: string): string => {
  const labels: Record<ItemType, Record<string, string>> = {
    checkbox: { ko: '체크박스', en: 'Checkbox' },
    text: { ko: '텍스트', en: 'Text' },
    number: { ko: '숫자', en: 'Number' },
    select: { ko: '선택', en: 'Select' },
    photo: { ko: '사진', en: 'Photo' },
    signature: { ko: '서명', en: 'Signature' },
    date: { ko: '날짜', en: 'Date' },
    time: { ko: '시간', en: 'Time' },
  };
  return labels[type]?.[locale] || labels[type]?.['en'] || type;
};

interface ItemTreeNodeProps {
  item: ChecksheetItem;
  locale: string;
  onEdit?: (item: ChecksheetItem) => void;
  onDelete?: (itemId: string) => void;
  onAddChild?: (parentId: string) => void;
  editable?: boolean;
  depth?: number;
}

const ItemTreeNode: React.FC<ItemTreeNodeProps> = ({
  item,
  locale,
  onEdit,
  onDelete,
  onAddChild,
  editable = true,
  depth = 0,
}) => {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <>
      <ListItem
        sx={{
          pl: 2 + depth * 3,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        {/* Expand/Collapse button for items with children */}
        {hasChildren ? (
          <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ mr: 1 }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        ) : (
          <Box sx={{ width: 32, mr: 1 }} />
        )}

        {/* Drag handle */}
        {editable && (
          <ListItemIcon sx={{ minWidth: 32 }}>
            <DragIcon fontSize="small" sx={{ color: 'text.disabled', cursor: 'grab' }} />
          </ListItemIcon>
        )}

        {/* Item type icon */}
        <ListItemIcon sx={{ minWidth: 36 }}>
          <Tooltip title={getItemTypeLabel(item.item_type, locale)}>
            {getItemTypeIcon(item.item_type)}
          </Tooltip>
        </ListItemIcon>

        {/* Item content */}
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {item.item_code}
              </Typography>
              <Typography variant="body2">{item.item_name}</Typography>
              {item.required && (
                <Chip
                  label={getLocalizedValue({ en: 'Required', ko: '필수' }, locale)}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
            </Box>
          }
          secondary={item.description}
        />

        {/* Actions */}
        {editable && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={getLocalizedValue({ en: 'Add Child Item', ko: '하위 항목 추가' }, locale)}>
              <IconButton size="small" onClick={() => onAddChild?.(item.id)}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={getLocalizedValue({ en: 'Edit', ko: '수정' }, locale)}>
              <IconButton size="small" onClick={() => onEdit?.(item)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={getLocalizedValue({ en: 'Delete', ko: '삭제' }, locale)}>
              <IconButton size="small" color="error" onClick={() => onDelete?.(item.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </ListItem>

      {/* Children */}
      {hasChildren && (
        <Collapse in={expanded}>
          {item.children!.map((child) => (
            <ItemTreeNode
              key={child.id}
              item={child}
              locale={locale}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              editable={editable}
              depth={depth + 1}
            />
          ))}
        </Collapse>
      )}
    </>
  );
};

export default function ItemTreeView({
  items,
  locale = 'ko',
  onEdit,
  onDelete,
  onAddChild,
  editable = true,
}: ItemTreeViewProps) {
  if (items.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          {getLocalizedValue(
            { en: 'No items yet. Click "Add Item" to create one.', ko: '항목이 없습니다. "항목 추가"를 클릭하여 생성하세요.' },
            locale
          )}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined">
      <List disablePadding>
        {items.map((item) => (
          <ItemTreeNode
            key={item.id}
            item={item}
            locale={locale}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            editable={editable}
          />
        ))}
      </List>
    </Paper>
  );
}
