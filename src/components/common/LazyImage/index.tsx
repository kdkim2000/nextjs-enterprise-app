'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton, BoxProps } from '@mui/material';
import { BrokenImage as BrokenImageIcon } from '@mui/icons-material';

export interface LazyImageProps extends Omit<BoxProps, 'component'> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  placeholderSrc?: string;
  fallbackIcon?: React.ReactNode;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  borderRadius?: number | string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Lazy loading image component with placeholder and error handling
 * Uses Intersection Observer for efficient loading
 */
export default function LazyImage({
  src,
  alt,
  width = '100%',
  height = 'auto',
  placeholderSrc,
  fallbackIcon,
  objectFit = 'cover',
  borderRadius = 0,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  sx,
  ...boxProps
}: LazyImageProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    setLoadingState('loading');

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setLoadingState('loaded');
      onLoad?.();
    };

    img.onerror = () => {
      setLoadingState('error');
      onError?.();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src, onLoad, onError]);

  const containerStyle = {
    width,
    height,
    borderRadius,
    overflow: 'hidden',
    position: 'relative' as const,
    ...sx,
  };

  // Idle or loading state - show placeholder/skeleton
  if (loadingState === 'idle' || loadingState === 'loading') {
    return (
      <Box ref={imgRef} sx={containerStyle} {...boxProps}>
        {placeholderSrc ? (
          <Box
            component="img"
            src={placeholderSrc}
            alt={alt}
            sx={{
              width: '100%',
              height: '100%',
              objectFit,
              filter: 'blur(10px)',
              transform: 'scale(1.1)',
            }}
          />
        ) : (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation="wave"
            sx={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
      </Box>
    );
  }

  // Error state - show fallback
  if (loadingState === 'error') {
    return (
      <Box
        ref={imgRef}
        sx={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
        }}
        {...boxProps}
      >
        {fallbackIcon || <BrokenImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />}
      </Box>
    );
  }

  // Loaded state - show image
  return (
    <Box ref={imgRef} sx={containerStyle} {...boxProps}>
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: '100%',
          height: '100%',
          objectFit,
          opacity: loadingState === 'loaded' ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </Box>
  );
}
