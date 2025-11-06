import React from 'react';
import { Box, Typography, SvgIconProps } from '@mui/material';
import { Search } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ComponentType<SvgIconProps>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Common empty state component for displaying when no data is available
 */
export default function EmptyState({
  icon: Icon = Search,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        py: 8
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
        <Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 3 : 0 }}>
            {description}
          </Typography>
        )}
        {action && <Box sx={{ mt: 2 }}>{action}</Box>}
      </Box>
    </Box>
  );
}
