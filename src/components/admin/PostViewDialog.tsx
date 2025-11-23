'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
  Grid,
  Paper
} from '@mui/material';
import {
  PushPin,
  Lock,
  CheckCircle,
  Visibility,
  ThumbUp,
  Comment,
  AttachFile,
  CalendarToday,
  Person
} from '@mui/icons-material';
import { Post } from '@/app/[locale]/admin/posts/types';

interface PostViewDialogProps {
  open: boolean;
  post: Post | null;
  onClose: () => void;
  onEdit?: (post: Post) => void;
}

const PostViewDialog: React.FC<PostViewDialogProps> = ({ open, post, onClose, onEdit }) => {
  if (!post) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {post.title}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {post.is_pinned && (
              <Chip
                icon={<PushPin fontSize="small" />}
                label="Pinned"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {post.is_secret && (
              <Chip
                icon={<Lock fontSize="small" />}
                label="Secret"
                size="small"
                color="default"
                variant="outlined"
              />
            )}
            {!post.is_approved && (
              <Chip
                icon={<CheckCircle fontSize="small" />}
                label="Pending"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Metadata */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Author
                  </Typography>
                  <Typography variant="body2">
                    {post.author_name || post.author_username || post.author_id}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(post.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 1.5 }} />

          {/* Statistics */}
          <Grid container spacing={1}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility fontSize="small" color="action" />
                <Typography variant="body2">
                  {post.view_count?.toLocaleString() || 0} views
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ThumbUp fontSize="small" color="action" />
                <Typography variant="body2">
                  {post.like_count?.toLocaleString() || 0} likes
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Comment fontSize="small" color="action" />
                <Typography variant="body2">
                  {post.comment_count?.toLocaleString() || 0} comments
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachFile fontSize="small" color="action" />
                <Typography variant="body2">
                  {post.attachment_count?.toLocaleString() || 0} files
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Board Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Board: <strong>{post.board_type_name || post.board_type_code || post.board_type_id}</strong>
          </Typography>
        </Box>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Tags
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {post.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Content */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Content
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: 1,
              '& img': {
                maxWidth: '100%',
                height: 'auto'
              }
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        {onEdit && (
          <Button onClick={() => onEdit(post)} variant="outlined">
            Edit
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostViewDialog;
