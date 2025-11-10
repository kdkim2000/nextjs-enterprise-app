'use client';

import React, { useState } from 'react';
import { Tabs as MuiTabs, Tab as MuiTab, Box, TabsProps as MuiTabsProps } from '@mui/material';

export interface TabItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsProps extends Omit<MuiTabsProps, 'onChange'> {
  tabs: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  orientation?: 'horizontal' | 'vertical';
  centered?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: string;
  currentValue: string;
}

function TabPanel({ children, value, currentValue }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== currentValue}
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
    >
      {value === currentValue && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Tabs({
  tabs,
  value: controlledValue,
  onChange,
  variant = 'standard',
  orientation = 'horizontal',
  centered = false,
  ...rest
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(tabs[0]?.value || '');
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: orientation === 'horizontal' ? 1 : 0, borderColor: 'divider' }}>
        <MuiTabs
          value={value}
          onChange={handleChange}
          variant={variant}
          orientation={orientation}
          centered={centered}
          {...rest}
        >
          {tabs.map((tab) => (
            <MuiTab
              key={tab.value}
              label={tab.label}
              value={tab.value}
              icon={tab.icon}
              iconPosition="start"
              disabled={tab.disabled}
              id={`tab-${tab.value}`}
              aria-controls={`tabpanel-${tab.value}`}
            />
          ))}
        </MuiTabs>
      </Box>
      {tabs.map((tab) => (
        <TabPanel key={tab.value} value={tab.value} currentValue={value}>
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
}
