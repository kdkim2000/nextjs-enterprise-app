import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Tooltip
} from '@mui/material';
import { FilterList, ExpandMore, ExpandLess, Search, RestartAlt, Check, Close } from '@mui/icons-material';
import { useI18n } from '@/lib/i18n/client';

interface SearchFilterPanelProps {
  title?: string;
  activeFilterCount: number;
  onSearch?: () => void;
  onClear?: () => void;
  onApply?: () => void;
  onClose?: () => void;
  searching?: boolean;
  disabled?: boolean;
  defaultExpanded?: boolean;
  mode?: 'standalone' | 'advanced';
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  showHeader?: boolean;
  children: React.ReactNode;
}

/**
 * Common search/filter panel component with collapsible functionality
 */
export default function SearchFilterPanel({
  title = 'Search / Filter',
  activeFilterCount,
  onSearch,
  onClear,
  onApply,
  onClose,
  searching = false,
  disabled = false,
  defaultExpanded = false,
  mode = 'standalone',
  expanded: controlledExpanded,
  onExpandedChange,
  showHeader = true,
  children
}: SearchFilterPanelProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggleExpanded = () => {
    const newExpanded = !expanded;
    if (isControlled && onExpandedChange) {
      onExpandedChange(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  };

  const t = useI18n();

  return (
    <Paper sx={{ mb: 1, flexShrink: 0 }}>
      {showHeader && (
        <Box
          sx={{
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            bgcolor: expanded ? 'action.hover' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={handleToggleExpanded}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              {title}
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={`${activeFilterCount} active`}
                size="small"
                color="primary"
              />
            )}
          </Box>
          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      )}

      <Collapse in={expanded}>
        <Box sx={{ p: 1.5, pt: showHeader ? 0 : 1.5 }}>
          {children}

          {/* Action Buttons - Icon Only with Tooltips */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
            {mode === 'standalone' ? (
              <>
                {/* Clear Button */}
                <Tooltip title={t('common.clear')} arrow>
                  <span>
                    <IconButton
                      onClick={onClear}
                      disabled={activeFilterCount === 0 && !searching || disabled}
                      size="small"
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'warning.main',
                          bgcolor: 'warning.50'
                        }
                      }}
                    >
                      <RestartAlt fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Search Button */}
                <Tooltip title={searching ? t('common.searching') : t('common.search')} arrow>
                  <span>
                    <IconButton
                      onClick={onSearch}
                      disabled={searching || disabled}
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled'
                        }
                      }}
                    >
                      <Search fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            ) : (
              <>
                {/* Close Button */}
                <Tooltip title={t('common.close')} arrow>
                  <span>
                    <IconButton
                      onClick={onClose}
                      disabled={disabled}
                      size="small"
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'action.active',
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Clear Button */}
                <Tooltip title={t('common.clear')} arrow>
                  <span>
                    <IconButton
                      onClick={onClear}
                      disabled={activeFilterCount === 0 || disabled}
                      size="small"
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'warning.main',
                          bgcolor: 'warning.50'
                        }
                      }}
                    >
                      <RestartAlt fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Apply Button */}
                <Tooltip title={t('common.apply')} arrow>
                  <span>
                    <IconButton
                      onClick={onApply}
                      disabled={disabled}
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled'
                        }
                      }}
                    >
                      <Check fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
