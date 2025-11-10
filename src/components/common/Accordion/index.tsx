'use client';

import React, { useState } from 'react';
import {
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  expanded?: string | string[];
  onChange?: (id: string, isExpanded: boolean) => void;
  multiple?: boolean;
  defaultExpanded?: string | string[];
}

export default function Accordion({
  items,
  expanded: controlledExpanded,
  onChange,
  multiple = false,
  defaultExpanded
}: AccordionProps) {
  const [internalExpanded, setInternalExpanded] = useState<string | string[]>(
    defaultExpanded || (multiple ? [] : '')
  );

  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const isExpanded = (id: string): boolean => {
    if (Array.isArray(expanded)) {
      return expanded.includes(id);
    }
    return expanded === id;
  };

  const handleChange = (id: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    if (onChange) {
      onChange(id, isExpanded);
    } else {
      if (multiple) {
        const currentExpanded = Array.isArray(internalExpanded) ? internalExpanded : [];
        const newExpanded = isExpanded
          ? [...currentExpanded, id]
          : currentExpanded.filter((item) => item !== id);
        setInternalExpanded(newExpanded);
      } else {
        setInternalExpanded(isExpanded ? id : '');
      }
    }
  };

  return (
    <Box>
      {items.map((item) => (
        <MuiAccordion
          key={item.id}
          expanded={isExpanded(item.id)}
          onChange={handleChange(item.id)}
          disabled={item.disabled}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              {item.icon}
              <Typography sx={{ flexGrow: 1 }}>{item.title}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {item.content}
          </AccordionDetails>
        </MuiAccordion>
      ))}
    </Box>
  );
}
