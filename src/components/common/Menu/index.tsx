'use client';

import React, { useState } from 'react';
import {
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  MenuProps as MuiMenuProps
} from '@mui/material';

export interface MenuItemType {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  color?: 'default' | 'error' | 'warning' | 'success';
}

export interface MenuProps extends Omit<MuiMenuProps, 'open'> {
  items: MenuItemType[];
  anchorEl?: HTMLElement | null;
  open?: boolean;
  onClose?: () => void;
  trigger?: React.ReactElement;
}

export default function Menu({
  items,
  anchorEl: controlledAnchorEl,
  open: controlledOpen,
  onClose,
  trigger,
  ...rest
}: MenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = controlledOpen !== undefined ? controlledOpen : Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (onClose) {
      onClose();
    }
  };

  const handleItemClick = (item: MenuItemType) => {
    if (item.onClick) {
      item.onClick();
    }
    handleClose();
  };

  return (
    <>
      {trigger && React.cloneElement(trigger, { onClick: handleClick })}
      <MuiMenu
        anchorEl={controlledAnchorEl || anchorEl}
        open={open}
        onClose={handleClose}
        {...rest}
      >
        {items.flatMap((item, index) => {
          const elements = [
            <MenuItem
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              sx={{
                ...(item.color && item.color !== 'default' && {
                  color: `${item.color}.main`
                })
              }}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ];

          if (item.divider && index < items.length - 1) {
            elements.push(<Divider key={`${item.id}-divider`} />);
          }

          return elements;
        })}
      </MuiMenu>
    </>
  );
}
