'use client';

import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
  ButtonProps,
} from '@mui/material';
import {
  Download as DownloadIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export type ExportFormat = 'excel' | 'pdf' | 'print';

export interface ExportButtonProps extends Omit<ButtonProps, 'onClick' | 'variant'> {
  onExport: (format: ExportFormat) => Promise<void> | void;
  formats?: ExportFormat[];
  locale?: string;
  variant?: 'button' | 'icon' | 'menu';
  buttonVariant?: 'text' | 'contained' | 'outlined';
  label?: string;
}

export default function ExportButton({
  onExport,
  formats = ['excel'],
  locale = 'ko',
  variant = 'button',
  label,
  ...buttonProps
}: ExportButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (formats.length === 1) {
      handleExport(formats[0]);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      setLoading(true);
      setLoadingFormat(format);
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
      setLoadingFormat(null);
      handleClose();
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'excel':
        return <ExcelIcon />;
      case 'pdf':
        return <PdfIcon />;
      case 'print':
        return <PrintIcon />;
      default:
        return <DownloadIcon />;
    }
  };

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case 'excel':
        return getLocalizedValue({ en: 'Excel', ko: 'Excel' }, locale);
      case 'pdf':
        return getLocalizedValue({ en: 'PDF', ko: 'PDF' }, locale);
      case 'print':
        return getLocalizedValue({ en: 'Print', ko: '인쇄' }, locale);
      default:
        return format;
    }
  };

  const buttonLabel = label || getLocalizedValue({ en: 'Export', ko: '내보내기' }, locale);

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={buttonLabel}>
          <IconButton onClick={handleClick} disabled={loading} {...(buttonProps as React.ComponentProps<typeof IconButton>)}>
            {loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          </IconButton>
        </Tooltip>
        {formats.length > 1 && (
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            {formats.map((format) => (
              <MenuItem
                key={format}
                onClick={() => handleExport(format)}
                disabled={loadingFormat === format}
              >
                <ListItemIcon>
                  {loadingFormat === format ? <CircularProgress size={20} /> : getFormatIcon(format)}
                </ListItemIcon>
                <ListItemText>{getFormatLabel(format)}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        )}
      </>
    );
  }

  if (variant === 'menu') {
    return (
      <>
        <Button
          onClick={handleClick}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          disabled={loading}
          {...buttonProps}
        >
          {buttonLabel}
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          {formats.map((format) => (
            <MenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={loadingFormat === format}
            >
              <ListItemIcon>
                {loadingFormat === format ? <CircularProgress size={20} /> : getFormatIcon(format)}
              </ListItemIcon>
              <ListItemText>{getFormatLabel(format)}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Default button variant
  return (
    <Button
      onClick={handleClick}
      startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
      disabled={loading}
      {...buttonProps}
    >
      {buttonLabel}
    </Button>
  );
}
