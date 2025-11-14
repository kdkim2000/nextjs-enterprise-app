'use client';

import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import Split from 'react-split';
import './split.css';

interface MasterDetailLayoutProps {
  master: ReactNode;
  detail: ReactNode;
  masterSize?: number;
  detailSize?: number;
  minMasterSize?: number;
  minDetailSize?: number;
  gutterSize?: number;
}

export default function MasterDetailLayout({
  master,
  detail,
  masterSize = 30,
  detailSize = 70,
  minMasterSize = 200,
  minDetailSize = 400,
  gutterSize = 10
}: MasterDetailLayoutProps) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }}>
      <Split
        sizes={[masterSize, detailSize]}
        minSize={[minMasterSize, minDetailSize]}
        gutterSize={gutterSize}
        direction="horizontal"
        className="split"
        style={{ height: '100%', width: '100%' }}
      >
        <Box className="split-flex">
          {master}
        </Box>
        <Box className="split-flex">
          {detail}
        </Box>
      </Split>
    </Box>
  );
}
