'use client';

/**
 * DataShell — the standard wrapper for any DataGrid surface.
 *
 * Replaces the ad-hoc `<Paper><Box sx={{p:2}}><Toolbar /></Box><DataGrid /></Paper>` pattern.
 *
 * Provides:
 *   - Sticky toolbar with filter chips + search + density toggle (slots)
 *   - Tab strip (slot) — "All / Active / Suspended" type segmenters
 *   - DataGrid container with hairline border
 *   - Footer slot — pagination, selection count, bulk-action bar
 *
 * USAGE
 *   <DataShell
 *     tabs={<Tabs ... />}
 *     toolbar={<>
 *       <SearchInput />
 *       <DensityToggle />
 *     </>}
 *     selection={selectedRows.length > 0 && <BulkActions count={selectedRows.length} />}
 *   >
 *     <DataGridPremium {...gridProps} />
 *   </DataShell>
 */

import React from 'react';
import { Box } from '@mui/material';

export interface DataShellProps {
  tabs?: React.ReactNode;
  toolbar?: React.ReactNode;
  selection?: React.ReactNode;
  children: React.ReactNode;
}

export default function DataShell({ tabs, toolbar, selection, children }: DataShellProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: 1,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {tabs && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          {tabs}
        </Box>
      )}

      {toolbar && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'surface.sunken',
          }}
        >
          {toolbar}
        </Box>
      )}

      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {children}
      </Box>

      {selection && (
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.default',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {selection}
        </Box>
      )}
    </Box>
  );
}
