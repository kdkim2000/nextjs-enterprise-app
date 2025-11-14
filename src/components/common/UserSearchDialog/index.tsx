'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Avatar,
  Checkbox,
  Alert,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  FilterList,
  Close,
  RestartAlt,
  Check,
  Clear
} from '@mui/icons-material';
import { api } from '@/lib/axios';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  status?: string;
  isActive?: boolean;
}

export interface UserSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (user: User) => void;
  onSelectMultiple?: (users: User[]) => void;
  title?: string;
  selectedUserId?: string | null;
  selectedUserIds?: string[];
  excludedUserIds?: string[];
  locale?: string;
  multiSelect?: boolean;
  showAdvancedSearch?: boolean;
  minSearchLength?: number;
  maxResults?: number;
  filterByStatus?: string;
}

export default function UserSearchDialog({
  open,
  onClose,
  onSelect,
  onSelectMultiple,
  title,
  selectedUserId,
  selectedUserIds = [],
  excludedUserIds = [],
  locale = 'en',
  multiSelect = false,
  showAdvancedSearch = false,
  minSearchLength = 2,
  maxResults = 200,
  filterByStatus = 'active'
}: UserSearchDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    name: '',
    username: '',
    email: '',
    department: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Initialize selected users only when dialog opens
      setSelectedUsers(new Set(selectedUserIds));
    } else {
      // Reset all state when dialog closes
      setUsers([]);
      setQuickSearch('');
      setAdvancedFilters({ name: '', username: '', email: '', department: '' });
      setAdvancedFilterOpen(false);
      setSelectedUser(null);
      setSelectedUsers(new Set());
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Only depend on 'open', selectedUserIds is read on open

  // Compute effective search query
  const effectiveSearch = useMemo(() => {
    if (showAdvancedSearch && advancedFilterOpen) {
      return advancedFilters;
    }
    return {
      name: quickSearch,
      username: quickSearch,
      email: quickSearch,
      department: ''
    };
  }, [quickSearch, advancedFilters, advancedFilterOpen, showAdvancedSearch]);

  // Fetch users when search query changes (minimum N characters)
  useEffect(() => {
    const hasValidSearch = showAdvancedSearch && advancedFilterOpen
      ? Object.values(advancedFilters).some(v => v.trim().length >= minSearchLength)
      : quickSearch.trim().length >= minSearchLength;

    if (open && hasValidSearch) {
      const debounceTimer = setTimeout(() => {
        fetchUsers();
      }, 300); // Debounce search

      return () => clearTimeout(debounceTimer);
    } else if (!hasValidSearch) {
      setUsers([]);
    }
  }, [quickSearch, advancedFilters, advancedFilterOpen, open, minSearchLength, showAdvancedSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const search = effectiveSearch;

      const params: any = {
        limit: maxResults,
        page: 1
      };

      if (filterByStatus) {
        params.status = filterByStatus;
      }

      // Add non-empty search parameters
      if (search.name && search.name.trim()) params.name = search.name.trim();
      if (search.username && search.username.trim()) params.username = search.username.trim();
      if (search.email && search.email.trim()) params.email = search.email.trim();
      if (search.department && search.department.trim()) params.department = [search.department.trim()];

      const response = await api.get('/user', { params });
      const allUsers = response.users || [];
      setUsers(allUsers);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Separate available and excluded users
  const { availableUsers, excludedUsers } = useMemo(() => {
    const available: User[] = [];
    const excluded: User[] = [];

    users.forEach((user) => {
      if (excludedUserIds.includes(user.id)) {
        excluded.push(user);
      } else {
        available.push(user);
      }
    });

    return { availableUsers: available, excludedUsers: excluded };
  }, [users, excludedUserIds]);

  const handleSelectUser = (user: User) => {
    if (multiSelect) {
      // Don't allow selecting excluded users
      if (excludedUserIds.includes(user.id)) {
        return;
      }

      const newSelected = new Set(selectedUsers);
      if (newSelected.has(user.id)) {
        newSelected.delete(user.id);
      } else {
        newSelected.add(user.id);
      }
      setSelectedUsers(newSelected);
    } else {
      setSelectedUser(user);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === availableUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(availableUsers.map((u) => u.id)));
    }
  };

  const handleSearch = () => {
    void fetchUsers();
  };

  const handleConfirm = () => {
    if (multiSelect && onSelectMultiple) {
      const selected = users.filter(u => selectedUsers.has(u.id));
      onSelectMultiple(selected);
    } else if (!multiSelect && selectedUser && onSelect) {
      onSelect(selectedUser);
    }
    handleClose();
  };

  const handleClose = () => {
    setQuickSearch('');
    setAdvancedFilters({ name: '', username: '', email: '', department: '' });
    setAdvancedFilterOpen(false);
    setSelectedUser(null);
    setSelectedUsers(new Set());
    setError(null);
    onClose();
  };

  const searchPlaceholder = locale === 'ko'
    ? `사용자 이름, 이메일, 부서로 검색... (최소 ${minSearchLength}글자)`
    : `Search by name, email, department... (min ${minSearchLength} characters)`;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title || (locale === 'ko' ? '사용자 검색' : 'Search User')}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search Box */}
        {showAdvancedSearch ? (
          <Box sx={{ mb: 2 }}>
            {/* Quick Search Bar - users 페이지와 동일한 패턴 */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder={searchPlaceholder}
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleSearch();
                  }
                }}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: quickSearch && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setQuickSearch('');
                          setUsers([]);
                        }}
                        disabled={loading}
                        edge="end"
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper'
                  }
                }}
              />

              {/* Search Button - Icon Only with Tooltip */}
              <Tooltip title={loading ? (locale === 'ko' ? '검색 중...' : 'Searching...') : (locale === 'ko' ? '검색' : 'Search')} arrow>
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 40,
                      height: 40,
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'action.disabledBackground',
                        color: 'action.disabled'
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} sx={{ color: 'inherit' }} />
                    ) : (
                      <SearchIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>

              {/* Advanced Filter Button - Icon Only with Badge and Tooltip */}
              <Tooltip title={locale === 'ko' ? '상세검색' : 'Advanced Filter'} arrow>
                <IconButton
                  onClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    width: 40,
                    height: 40,
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  <FilterList fontSize="small" />
                  {(advancedFilters.name || advancedFilters.username || advancedFilters.email || advancedFilters.department) && (
                    <Chip
                      label="•"
                      size="small"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        height: 20,
                        minWidth: 20,
                        '& .MuiChip-label': {
                          px: 0.5,
                          fontSize: '0.7rem'
                        }
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

            {/* Advanced Filter Panel */}
            <Collapse in={advancedFilterOpen}>
              <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label={locale === 'ko' ? '이름' : 'Name'}
                    value={advancedFilters.name}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, name: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label={locale === 'ko' ? '사용자명' : 'Username'}
                    value={advancedFilters.username}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, username: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label={locale === 'ko' ? '이메일' : 'Email'}
                    value={advancedFilters.email}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, email: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label={locale === 'ko' ? '부서' : 'Department'}
                    value={advancedFilters.department}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, department: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {/* Close Button */}
                    <Tooltip title={locale === 'ko' ? '닫기' : 'Close'} arrow>
                      <IconButton
                        onClick={() => setAdvancedFilterOpen(false)}
                        size="small"
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            borderColor: 'action.active',
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Clear Button */}
                    <Tooltip title={locale === 'ko' ? '초기화' : 'Clear'} arrow>
                      <span>
                        <IconButton
                          onClick={() => {
                            setAdvancedFilters({ name: '', username: '', email: '', department: '' });
                            setUsers([]);
                          }}
                          disabled={!advancedFilters.name && !advancedFilters.username && !advancedFilters.email && !advancedFilters.department}
                          size="small"
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              borderColor: 'warning.main',
                              bgcolor: 'warning.50'
                            }
                          }}
                        >
                          <RestartAlt fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    {/* Apply Button */}
                    <Tooltip title={locale === 'ko' ? '적용' : 'Apply'} arrow>
                      <IconButton
                        onClick={() => setAdvancedFilterOpen(false)}
                        size="small"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'action.disabledBackground',
                            color: 'action.disabled'
                          }
                        }}
                      >
                        <Check fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Collapse>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder={searchPlaceholder}
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              autoFocus
            />
          </Box>
        )}

        {/* Multi-select controls */}
        {multiSelect && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              mb: 1,
              px: 1
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {locale === 'ko'
                  ? `선택됨: ${selectedUsers.size}명 / 사용 가능: ${availableUsers.length}명`
                  : `Selected: ${selectedUsers.size} / Available: ${availableUsers.length}`}
              </Typography>
              <Button size="small" onClick={handleSelectAll} disabled={availableUsers.length === 0}>
                {selectedUsers.size === availableUsers.length
                  ? locale === 'ko'
                    ? '전체 해제'
                    : 'Deselect All'
                  : locale === 'ko'
                  ? '전체 선택'
                  : 'Select All'}
              </Button>
            </Box>
            {users.length >= maxResults && (
              <Typography variant="caption" color="warning.main" sx={{ fontStyle: 'italic' }}>
                {locale === 'ko'
                  ? `⚠ 검색 결과가 ${maxResults}명으로 제한됩니다. 더 구체적인 검색어를 입력하여 원하는 사용자를 찾으세요.`
                  : `⚠ Search results limited to ${maxResults} users. Use more specific search terms to find desired users.`}
              </Typography>
            )}
          </Box>
        )}

        {/* User List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            {/* Available Users */}
            {availableUsers.map((user) => (
              <ListItem key={user.id} dense disablePadding>
                <ListItemButton onClick={() => handleSelectUser(user)} dense>
                  {multiSelect ? (
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedUsers.has(user.id)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                  ) : (
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500} component="span">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          ({user.username})
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" component="span">
                          {user.email}
                        </Typography>
                        {user.department && (
                          <Chip label={user.department} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            {/* Excluded Users */}
            {excludedUsers.length > 0 && (
              <>
                <ListItem sx={{ bgcolor: 'grey.100', borderTop: '1px solid #e0e0e0' }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    {locale === 'ko' ? '이미 할당됨' : 'Already Assigned'}
                  </Typography>
                </ListItem>
                {excludedUsers.map((user) => (
                  <ListItem key={user.id} dense sx={{ opacity: 0.6 }}>
                    {multiSelect ? (
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox edge="start" checked disabled />
                      </ListItemIcon>
                    ) : (
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                    )}
                    <ListItemText
                      primary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={500} component="span">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="span">
                            ({user.username})
                          </Typography>
                          <Chip
                            label={locale === 'ko' ? '할당됨' : 'Assigned'}
                            size="small"
                            color="success"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        </Box>
                      }
                      secondary={user.email}
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                ))}
              </>
            )}

            {/* Empty states */}
            {users.length === 0 && !loading && !showAdvancedSearch && quickSearch.trim().length === 0 && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" align="center">
                      {locale === 'ko'
                        ? `사용자를 검색하려면 ${minSearchLength}글자 이상 입력하세요`
                        : `Enter at least ${minSearchLength} characters to search users`}
                    </Typography>
                  }
                />
              </ListItem>
            )}

            {users.length === 0 && !loading && showAdvancedSearch && !advancedFilterOpen && quickSearch.trim().length === 0 && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" align="center">
                      {locale === 'ko'
                        ? `사용자를 검색하려면 ${minSearchLength}글자 이상 입력하세요`
                        : `Enter at least ${minSearchLength} characters to search users`}
                    </Typography>
                  }
                />
              </ListItem>
            )}

            {users.length === 0 && !loading && showAdvancedSearch && advancedFilterOpen && Object.values(advancedFilters).every(v => v.trim().length === 0) && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" align="center">
                      {locale === 'ko'
                        ? `필터 조건을 ${minSearchLength}글자 이상 입력하세요`
                        : `Enter at least ${minSearchLength} characters in any filter field`}
                    </Typography>
                  }
                />
              </ListItem>
            )}

            {users.length === 0 && !loading && (
              (showAdvancedSearch && advancedFilterOpen && Object.values(advancedFilters).some(v => v.trim().length >= minSearchLength)) ||
              (!showAdvancedSearch && quickSearch.trim().length >= minSearchLength) ||
              (showAdvancedSearch && !advancedFilterOpen && quickSearch.trim().length >= minSearchLength)
            ) && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" align="center">
                      {locale === 'ko' ? '검색 결과가 없습니다' : 'No users found'}
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {locale === 'ko' ? '취소' : 'Cancel'}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={multiSelect ? selectedUsers.size === 0 : !selectedUser || loading}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : multiSelect ? (
            locale === 'ko' ? `${selectedUsers.size}명 선택` : `Select ${selectedUsers.size} User${selectedUsers.size > 1 ? 's' : ''}`
          ) : (
            locale === 'ko' ? '선택' : 'Select'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
