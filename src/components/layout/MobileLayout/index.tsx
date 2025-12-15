'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import MobileHeader, { MOBILE_HEADER_HEIGHT } from '../MobileHeader';
import MobileDrawer from '../MobileDrawer';
import MobileBottomNavigation, { BOTTOM_NAV_HEIGHT } from '../MobileBottomNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Fixed height for scroll to work
        overflow: 'hidden', // Prevent outer scroll
        backgroundColor: 'background.default',
      }}
    >
      {/* Fixed Header */}
      <MobileHeader onMenuOpen={handleDrawerOpen} />

      {/* Swipeable Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onOpen={handleDrawerOpen}
        onClose={handleDrawerClose}
      />

      {/* Main Content Area - Scrollable */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          mt: `${MOBILE_HEADER_HEIGHT}px`,
          mb: `${BOTTOM_NAV_HEIGHT}px`,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        }}
      >
        {children}
      </Box>

      {/* Fixed Bottom Navigation */}
      <MobileBottomNavigation onMenuOpen={handleDrawerOpen} />
    </Box>
  );
}
