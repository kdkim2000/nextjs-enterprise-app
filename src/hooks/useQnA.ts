import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface QnAData {
  question_status: 'unanswered' | 'answered' | 'resolved';
  accepted_answer_id: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  answer_count: number;
}

interface QnAStats {
  total_questions: number;
  unanswered: number;
  answered: number;
  resolved: number;
  with_accepted_answer: number;
  avg_answers_per_question: number;
}

/**
 * useQnA - Q&A 기능 관리 Hook
 *
 * @param postId - Post ID
 * @param authorId - Post author ID (for permission checks)
 * @returns Q&A data and operations
 *
 * @example
 * ```tsx
 * function PostDetail({ post }) {
 *   const { qnaData, canAcceptAnswer, acceptAnswer, unacceptAnswer } = useQnA(post.id, post.author_id);
 *
 *   return (
 *     <>
 *       {canAcceptAnswer && (
 *         <Button onClick={() => acceptAnswer(commentId)}>Accept Answer</Button>
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useQnA(postId?: string, authorId?: string) {
  const { user } = useAuth();
  const [qnaData, setQnaData] = useState<QnAData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current user can accept answers (post author or admin)
  const canAcceptAnswer = user && authorId && (user.id === authorId || user.role === 'admin');

  // Fetch Q&A data for a post
  useEffect(() => {
    if (!postId) return;

    const fetchQnAData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/qna/post/${postId}`);

        if (response.success && response.data) {
          setQnaData(response.data);
        } else {
          // Post might not be a Q&A post, that's okay
          setQnaData(null);
        }
      } catch (err: any) {
        console.error('Error fetching Q&A data:', err);
        setError(err.message || 'Failed to fetch Q&A data');
      } finally {
        setLoading(false);
      }
    };

    fetchQnAData();
  }, [postId]);

  // Accept an answer
  const acceptAnswer = async (commentId: string) => {
    if (!postId || !commentId) {
      throw new Error('Missing postId or commentId');
    }

    try {
      const response = await apiClient.post('/qna/accept-answer', {
        postId,
        commentId
      });

      if (response.success) {
        // Update local state
        setQnaData({
          question_status: 'resolved',
          accepted_answer_id: commentId,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id || null,
          answer_count: qnaData?.answer_count || 0
        });
        return true;
      } else {
        throw new Error(response.error || 'Failed to accept answer');
      }
    } catch (err: any) {
      console.error('Error accepting answer:', err);
      throw err;
    }
  };

  // Unaccept an answer
  const unacceptAnswer = async (commentId: string) => {
    if (!postId || !commentId) {
      throw new Error('Missing postId or commentId');
    }

    try {
      const response = await apiClient.post('/qna/unaccept-answer', {
        postId,
        commentId
      });

      if (response.success) {
        // Determine new status based on answer count
        const newStatus = qnaData && qnaData.answer_count > 0 ? 'answered' : 'unanswered';

        setQnaData({
          question_status: newStatus,
          accepted_answer_id: null,
          resolved_at: null,
          resolved_by: null,
          answer_count: qnaData?.answer_count || 0
        });
        return true;
      } else {
        throw new Error(response.error || 'Failed to unaccept answer');
      }
    } catch (err: any) {
      console.error('Error unaccepting answer:', err);
      throw err;
    }
  };

  return {
    qnaData,
    loading,
    error,
    canAcceptAnswer,
    acceptAnswer,
    unacceptAnswer
  };
}

/**
 * useAnswerHelpful - 답변 도움됨 표시 Hook
 *
 * @param commentId - Comment ID
 * @returns Helpful status and toggle function
 *
 * @example
 * ```tsx
 * function AnswerItem({ comment }) {
 *   const { isHelpful, helpfulCount, toggleHelpful } = useAnswerHelpful(comment.id);
 *
 *   return (
 *     <Button onClick={toggleHelpful}>
 *       {isHelpful ? 'Unhelpful' : 'Helpful'} ({helpfulCount})
 *     </Button>
 *   );
 * }
 * ```
 */
export function useAnswerHelpful(commentId?: string) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Toggle helpful status
  const toggleHelpful = async () => {
    if (!commentId) return;

    try {
      setLoading(true);

      const response = isHelpful
        ? await apiClient.delete(`/qna/helpful/${commentId}`)
        : await apiClient.post(`/qna/helpful/${commentId}`);

      if (response.success) {
        setIsHelpful(!isHelpful);
        setHelpfulCount((response as any).helpfulCount || 0);
      }
    } catch (err: any) {
      console.error('Error toggling helpful:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    isHelpful,
    helpfulCount,
    toggleHelpful,
    loading
  };
}

/**
 * useQnAStats - Q&A 통계 Hook
 *
 * @param boardTypeId - Board type ID
 * @returns Q&A statistics
 *
 * @example
 * ```tsx
 * function BoardHeader({ boardTypeId }) {
 *   const { stats } = useQnAStats(boardTypeId);
 *
 *   return (
 *     <Box>
 *       <Typography>Total: {stats?.total_questions}</Typography>
 *       <Typography>Unanswered: {stats?.unanswered}</Typography>
 *       <Typography>Resolved: {stats?.resolved}</Typography>
 *     </Box>
 *   );
 * }
 * ```
 */
export function useQnAStats(boardTypeId?: string) {
  const [stats, setStats] = useState<QnAStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardTypeId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/qna/stats/${boardTypeId}`);

        if (response.success && (response as any).stats) {
          setStats((response as any).stats);
        }
      } catch (err: any) {
        console.error('Error fetching Q&A stats:', err);
        setError(err.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [boardTypeId]);

  return {
    stats,
    loading,
    error
  };
}
