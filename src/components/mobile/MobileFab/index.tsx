'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Fab, Zoom, Box } from '@mui/material';
import { BOTTOM_NAV_HEIGHT } from '@/components/layout/MobileBottomNavigation';

export interface MobileFabProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  color?: 'primary' | 'secondary' | 'default' | 'inherit';
  position?: 'bottom-right' | 'bottom-center';
  extended?: boolean;
  hide?: boolean;
  hideOnScroll?: boolean;
}

export default function MobileFab({
  icon,
  onClick,
  label,
  color = 'primary',
  position = 'bottom-right',
  extended = false,
  hide = false,
  hideOnScroll = true,
}: MobileFabProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    if (!hideOnScroll) return;

    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down
      setIsVisible(false);
    } else {
      // Scrolling up
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY, hideOnScroll]);

  useEffect(() => {
    if (hideOnScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll, hideOnScroll]);

  const positionStyles = {
    'bottom-right': {
      right: 16,
      left: 'auto',
    },
    'bottom-center': {
      right: 'auto',
      left: '50%',
      transform: 'translateX(-50%)',
    },
  };

  return (
    <Zoom in={!hide && isVisible}>
      <Box
        sx={{
          position: 'fixed',
          bottom: BOTTOM_NAV_HEIGHT + 16,
          zIndex: (theme) => theme.zIndex.fab,
          ...positionStyles[position],
        }}
      >
        {extended && label ? (
          <Fab
            variant="extended"
            color={color}
            onClick={onClick}
            sx={{
              gap: 1,
            }}
          >
            {icon}
            {label}
          </Fab>
        ) : (
          <Fab
            color={color}
            onClick={onClick}
            aria-label={label}
          >
            {icon}
          </Fab>
        )}
      </Box>
    </Zoom>
  );
}
