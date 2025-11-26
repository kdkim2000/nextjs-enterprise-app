'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  Article,
  Comment,
  ThumbUp,
  Visibility,
  AttachFile
} from '@mui/icons-material';
import { BoardType } from '@/app/[locale]/admin/board-types/types';

interface BoardTypeStatsDialogProps {
  open: boolean;
  boardType: BoardType | null;
  onClose: () => void;
}

// Helper function to get stat value from different possible field names
// API returns: total_posts, total_comments, total_likes, total_views, total_attachments
// Also supports: post_count, comment_count, etc.
const getStatValue = (boardType: any, statName: string): number => {
  const value =
    boardType[`total_${statName}`] ||
    boardType[`${statName.slice(0, -1)}_count`] ||  // posts -> post_count
    boardType[statName] ||
    0;
  return parseInt(value) || 0;
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <Box
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      bgcolor: 'action.hover',
      borderRadius: 1
    }}
  >
    <Box sx={{ color, mb: 1 }}>{icon}</Box>
    <Typography variant="h4" gutterBottom>
      {value.toLocaleString()}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const BoardTypeStatsDialog: React.FC<BoardTypeStatsDialogProps> = ({
  open,
  boardType,
  onClose
}) => {
  if (!boardType) return null;

  const locale = 'en'; // You can get this from context or props
  const nameField = `name_${locale}` as keyof BoardType;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Board Statistics: {(boardType[nameField] as string) || boardType.name_en}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Summary */}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Code: <strong>{boardType.code}</strong> | Type:{' '}
            <strong>{boardType.type === 'notice' ? 'Notice Board' : 'Normal Board'}</strong>
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Stats Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<Article fontSize="large" />}
                label="Total Posts"
                value={getStatValue(boardType, 'posts')}
                color="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<Comment fontSize="large" />}
                label="Total Comments"
                value={getStatValue(boardType, 'comments')}
                color="secondary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<ThumbUp fontSize="large" />}
                label="Total Likes"
                value={getStatValue(boardType, 'likes')}
                color="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<Visibility fontSize="large" />}
                label="Total Views"
                value={getStatValue(boardType, 'views')}
                color="info.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<AttachFile fontSize="large" />}
                label="Total Attachments"
                value={getStatValue(boardType, 'attachments')}
                color="warning.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  bgcolor: 'action.hover',
                  borderRadius: 1
                }}
              >
                <Typography variant="h4" gutterBottom>
                  {getStatValue(boardType, 'posts') > 0
                    ? (getStatValue(boardType, 'comments') / getStatValue(boardType, 'posts')).toFixed(1)
                    : '0.0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comments per Post
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Additional Info */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Settings:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Comments: {boardType.settings?.allowComments ? 'Enabled' : 'Disabled'}
              <br />
              • Attachments: {boardType.settings?.allowAttachments ? 'Enabled' : 'Disabled'}
              {boardType.settings?.allowAttachments && (
                <>
                  {' '}
                  (Max: {boardType.settings?.maxAttachments || 5} files,{' '}
                  {((boardType.settings?.maxAttachmentSize || 10485760) / 1048576).toFixed(0)}MB each)
                </>
              )}
              <br />
              • Likes: {boardType.settings?.allowLikes ? 'Enabled' : 'Disabled'}
              <br />
              • Approval: {boardType.settings?.requireApproval ? 'Required' : 'Not Required'}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Permissions:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Write Roles: {(boardType.write_roles || boardType.writeRoles)?.join(', ') || 'None'}
              <br />
              • Read Roles: {(boardType.read_roles || boardType.readRoles)?.join(', ') || 'None'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BoardTypeStatsDialog;
