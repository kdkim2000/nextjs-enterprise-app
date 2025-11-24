import React, { useState } from 'react';
import { Box, Button, IconButton, Tooltip, Chip } from '@mui/material';
import { CheckCircle, CheckCircleOutline, ThumbUp, ThumbUpOutlined } from '@mui/icons-material';

interface AnswerActionsProps {
  commentId: string;
  isAccepted: boolean;
  canAcceptAnswer: boolean;
  helpfulCount: number;
  isHelpful: boolean;
  onAccept: (commentId: string) => Promise<void>;
  onUnaccept: (commentId: string) => Promise<void>;
  onToggleHelpful: () => Promise<void>;
}

/**
 * AnswerActions - 답변 액션 컴포넌트
 *
 * @param commentId - Comment ID
 * @param isAccepted - Whether this answer is accepted
 * @param canAcceptAnswer - Whether current user can accept answers
 * @param helpfulCount - Number of helpful marks
 * @param isHelpful - Whether current user marked as helpful
 * @param onAccept - Accept answer handler
 * @param onUnaccept - Unaccept answer handler
 * @param onToggleHelpful - Toggle helpful handler
 *
 * @example
 * ```tsx
 * <AnswerActions
 *   commentId={comment.id}
 *   isAccepted={comment.is_accepted}
 *   canAcceptAnswer={canAcceptAnswer}
 *   helpfulCount={comment.helpful_count}
 *   isHelpful={isHelpful}
 *   onAccept={acceptAnswer}
 *   onUnaccept={unacceptAnswer}
 *   onToggleHelpful={toggleHelpful}
 * />
 * ```
 */
export function AnswerActions({
  commentId,
  isAccepted,
  canAcceptAnswer,
  helpfulCount,
  isHelpful,
  onAccept,
  onUnaccept,
  onToggleHelpful
}: AnswerActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setLoading(true);
      if (isAccepted) {
        await onUnaccept(commentId);
      } else {
        await onAccept(commentId);
      }
    } catch (error) {
      console.error('Error toggling accept:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async () => {
    try {
      setLoading(true);
      await onToggleHelpful();
    } catch (error) {
      console.error('Error toggling helpful:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
      {/* Accept Answer Button (only for question author/admin) */}
      {canAcceptAnswer && (
        <Tooltip title={isAccepted ? 'Unaccept Answer' : 'Accept as Best Answer'}>
          <Button
            size="small"
            variant={isAccepted ? 'contained' : 'outlined'}
            color={isAccepted ? 'success' : 'inherit'}
            startIcon={isAccepted ? <CheckCircle /> : <CheckCircleOutline />}
            onClick={handleAccept}
            disabled={loading}
          >
            {isAccepted ? 'Accepted' : 'Accept'}
          </Button>
        </Tooltip>
      )}

      {/* Accepted Badge (for non-authors) */}
      {isAccepted && !canAcceptAnswer && (
        <Chip
          label="Accepted Answer"
          color="success"
          size="small"
          icon={<CheckCircle />}
        />
      )}

      {/* Helpful Button */}
      <Tooltip title="Mark as helpful">
        <Button
          size="small"
          variant={isHelpful ? 'contained' : 'outlined'}
          color={isHelpful ? 'primary' : 'inherit'}
          startIcon={isHelpful ? <ThumbUp /> : <ThumbUpOutlined />}
          onClick={handleHelpful}
          disabled={loading}
        >
          Helpful ({helpfulCount})
        </Button>
      </Tooltip>
    </Box>
  );
}
