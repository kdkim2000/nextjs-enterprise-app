import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface BoardType {
  id: string;
  code: string;
  type: 'normal' | 'notice' | 'qna';
  writeRoles: string[];
  readRoles: string[];
  status: string;
  settings: {
    allowComments?: boolean;
    allowAttachments?: boolean;
    allowLikes?: boolean;
    requireApproval?: boolean;
  };
}

interface BoardPermissions {
  canRead: boolean;
  canWrite: boolean;
  canComment: boolean;
  canAttach: boolean;
  canLike: boolean;
  requiresApproval: boolean;
  loading: boolean;
  error: string | null;
  boardType: BoardType | null;
}

/**
 * useBoardPermissions - 게시판 권한 관리 Hook
 *
 * @param boardTypeIdOrCode - Board type ID or code
 * @returns Board permissions and settings
 *
 * @example
 * ```tsx
 * function BoardPage() {
 *   const { canWrite, canRead, canComment, boardType } = useBoardPermissions('NOTICE');
 *
 *   return (
 *     <>
 *       {canRead && <PostList />}
 *       {canWrite && <Button onClick={handleWrite}>Write Post</Button>}
 *       {canComment && <CommentSection />}
 *     </>
 *   );
 * }
 * ```
 */
export function useBoardPermissions(boardTypeIdOrCode?: string): BoardPermissions {
  const { user } = useAuth();
  const [boardType, setBoardType] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardTypeIdOrCode) {
      setBoardType(null);
      return;
    }

    const fetchBoardType = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine if it's an ID or code
        // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (8-4-4-4-12)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(boardTypeIdOrCode);
        const isLegacyId = boardTypeIdOrCode.startsWith('BOARD-TYPE-');

        const endpoint = (isUUID || isLegacyId)
          ? `/board-type/${boardTypeIdOrCode}`
          : `/board-type/code/${boardTypeIdOrCode}`;

        const response = await apiClient.get(endpoint);

        if (response.success && response.data) {
          setBoardType(response.data);
        } else {
          setError(response.error || 'Failed to fetch board type');
        }
      } catch (err: any) {
        console.error('Error fetching board type:', err);
        setError(err.message || 'Failed to fetch board type');
      } finally {
        setLoading(false);
      }
    };

    fetchBoardType();
  }, [boardTypeIdOrCode]);

  const permissions = useMemo(() => {
    if (!boardType || !user) {
      return {
        canRead: false,
        canWrite: false,
        canComment: false,
        canAttach: false,
        canLike: false,
        requiresApproval: false
      };
    }

    const userRole = user.role;

    // Check read permission
    const canRead = boardType.readRoles?.includes(userRole) ?? false;

    // Check write permission
    let canWrite = boardType.writeRoles?.includes(userRole) ?? false;

    // Notice boards: only admin can write
    if (boardType.type === 'notice') {
      canWrite = userRole === 'admin';
    }

    // Check feature permissions based on board settings
    const canComment = canRead && (boardType.settings?.allowComments ?? true);
    const canAttach = canWrite && (boardType.settings?.allowAttachments ?? true);
    const canLike = canRead && (boardType.settings?.allowLikes ?? true);
    const requiresApproval = boardType.settings?.requireApproval ?? false;

    return {
      canRead,
      canWrite,
      canComment,
      canAttach,
      canLike,
      requiresApproval
    };
  }, [boardType, user]);

  return {
    ...permissions,
    loading,
    error,
    boardType
  };
}

/**
 * usePostPermissions - 게시글 권한 관리 Hook
 *
 * @param post - Post object with authorId
 * @returns Post edit/delete permissions
 *
 * @example
 * ```tsx
 * function PostDetail({ post }) {
 *   const { canEdit, canDelete } = usePostPermissions(post);
 *
 *   return (
 *     <>
 *       {canEdit && <Button onClick={handleEdit}>Edit</Button>}
 *       {canDelete && <Button onClick={handleDelete}>Delete</Button>}
 *     </>
 *   );
 * }
 * ```
 */
export function usePostPermissions(post?: { authorId: string }) {
  const { user } = useAuth();

  return useMemo(() => {
    if (!post || !user) {
      return {
        canEdit: false,
        canDelete: false,
        isAuthor: false
      };
    }

    const isAuthor = post.authorId === user.id;
    const isAdmin = user.role === 'admin';

    return {
      canEdit: isAuthor || isAdmin,
      canDelete: isAuthor || isAdmin,
      isAuthor
    };
  }, [post, user]);
}

/**
 * useCommentPermissions - 댓글 권한 관리 Hook
 *
 * @param comment - Comment object with authorId
 * @returns Comment edit/delete permissions
 *
 * @example
 * ```tsx
 * function CommentItem({ comment }) {
 *   const { canEdit, canDelete } = useCommentPermissions(comment);
 *
 *   return (
 *     <>
 *       {canEdit && <Button onClick={handleEdit}>Edit</Button>}
 *       {canDelete && <Button onClick={handleDelete}>Delete</Button>}
 *     </>
 *   );
 * }
 * ```
 */
export function useCommentPermissions(comment?: { authorId: string }) {
  const { user } = useAuth();

  return useMemo(() => {
    if (!comment || !user) {
      return {
        canEdit: false,
        canDelete: false,
        isAuthor: false
      };
    }

    const isAuthor = comment.authorId === user.id;
    const isAdmin = user.role === 'admin';

    return {
      canEdit: isAuthor || isAdmin,
      canDelete: isAuthor || isAdmin,
      isAuthor
    };
  }, [comment, user]);
}
