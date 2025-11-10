'use client';

import React from 'react';
import {
  Card as MuiCard,
  CardHeader,
  CardContent,
  CardActions,
  CardMedia,
  Divider,
  CardProps as MuiCardProps,
  Avatar,
  IconButton
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

export interface CardProps extends MuiCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  image?: string;
  imageHeight?: number;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  showDivider?: boolean;
  hoverable?: boolean;
  children?: React.ReactNode;
}

export default function Card({
  title,
  subtitle,
  avatar,
  action,
  image,
  imageHeight = 140,
  content,
  actions,
  showDivider = false,
  hoverable = false,
  children,
  sx,
  ...rest
}: CardProps) {
  return (
    <MuiCard
      sx={{
        ...(hoverable && {
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }),
        ...sx
      }}
      {...rest}
    >
      {(title || subtitle || avatar || action) && (
        <>
          <CardHeader
            avatar={avatar}
            action={action}
            title={title}
            subheader={subtitle}
          />
          {showDivider && <Divider />}
        </>
      )}

      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={typeof title === 'string' ? title : 'Card image'}
        />
      )}

      {(content || children) && (
        <CardContent>
          {content || children}
        </CardContent>
      )}

      {actions && (
        <>
          {showDivider && <Divider />}
          <CardActions>
            {actions}
          </CardActions>
        </>
      )}
    </MuiCard>
  );
}
