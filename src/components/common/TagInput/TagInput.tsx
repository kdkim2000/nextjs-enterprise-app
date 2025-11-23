'use client';

import React, { useState, KeyboardEvent } from 'react';
import {
  Box,
  Chip,
  TextField,
  Stack,
  Paper,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { Add } from '@mui/icons-material';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  allowDuplicates?: boolean;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  label,
  placeholder = 'Type and press Enter to add tags',
  maxTags = 10,
  maxLength = 20,
  disabled = false,
  error = false,
  helperText,
  allowDuplicates = false,
  suggestions = []
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Check max length
    if (newValue.length <= maxLength) {
      setInputValue(newValue);
      setInputError('');
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault();
      addTag(inputValue.trim());
    } else if (event.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(value.length - 1);
    }
  };

  const addTag = (tag: string) => {
    setInputError('');

    // Check max tags
    if (value.length >= maxTags) {
      setInputError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    // Check duplicates
    if (!allowDuplicates && value.includes(tag)) {
      setInputError('Tag already exists');
      return;
    }

    // Add tag
    onChange([...value, tag]);
    setInputValue('');
  };

  const removeTag = (index: number) => {
    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!value.includes(suggestion) && value.length < maxTags) {
      addTag(suggestion);
    }
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontWeight: 500 }}
        >
          {label}
        </Typography>
      )}

      {/* Tags Display and Input */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderColor: error ? 'error.main' : 'divider',
          backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
          '&:focus-within': error
            ? {
                borderColor: 'error.main',
                boxShadow: `0 0 0 1px ${theme.palette.error.main}`
              }
            : {
                borderColor: 'primary.main',
                boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
              }
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          {/* Display Tags */}
          {value.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={disabled ? undefined : () => removeTag(index)}
              size="small"
              sx={{ mb: 0.5 }}
            />
          ))}

          {/* Input Field */}
          {value.length < maxTags && (
            <TextField
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder={value.length === 0 ? placeholder : ''}
              disabled={disabled}
              variant="standard"
              size="small"
              sx={{
                flex: 1,
                minWidth: 120,
                '& .MuiInput-root': {
                  '&:before, &:after': {
                    display: 'none'
                  }
                },
                '& .MuiInputBase-input': {
                  padding: 0,
                  fontSize: '0.875rem'
                }
              }}
              InputProps={{
                disableUnderline: true
              }}
            />
          )}
        </Stack>
      </Paper>

      {/* Error Message */}
      {(inputError || (error && helperText)) && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 0.5, px: 1.75, display: 'block' }}
        >
          {inputError || helperText}
        </Typography>
      )}

      {/* Helper Text */}
      {!error && !inputError && helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, px: 1.75, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}

      {/* Tags Counter */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, px: 1.75, display: 'block' }}
      >
        {value.length} / {maxTags} tags
      </Typography>

      {/* Suggestions */}
      {suggestions.length > 0 && value.length < maxTags && (
        <Box sx={{ mt: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block', px: 1.75 }}
          >
            Suggested tags:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ px: 1.75 }}>
            {suggestions
              .filter((s) => !value.includes(s))
              .slice(0, 5)
              .map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  variant="outlined"
                  onClick={() => handleSuggestionClick(suggestion)}
                  clickable
                  disabled={disabled}
                  icon={<Add fontSize="small" />}
                  sx={{
                    mb: 0.5,
                    borderStyle: 'dashed',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                />
              ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default TagInput;
