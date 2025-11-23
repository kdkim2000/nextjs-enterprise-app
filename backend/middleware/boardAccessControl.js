/**
 * Board Access Control Middleware
 *
 * 게시판 타입별 권한 체크 및 게시글 접근 제어
 */

const boardTypeService = require('../services/boardTypeService');
const postService = require('../services/postService');

/**
 * 게시판 타입별 쓰기 권한 체크
 * @param {string} boardTypeIdOrCode - Board type ID or code
 * @returns {Function} Express middleware
 */
function checkBoardWritePermission(boardTypeIdOrCode) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Login required'
        });
      }

      // Get board type
      let boardType;
      if (boardTypeIdOrCode.startsWith('BOARD-TYPE-')) {
        boardType = await boardTypeService.getBoardTypeById(boardTypeIdOrCode);
      } else {
        boardType = await boardTypeService.getBoardTypeByCode(boardTypeIdOrCode);
      }

      if (!boardType) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Board type not found'
        });
      }

      // Check board status
      if (boardType.status !== 'active') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'This board is not active'
        });
      }

      // Parse write_roles (JSONB)
      const writeRoles = typeof boardType.write_roles === 'string'
        ? JSON.parse(boardType.write_roles)
        : boardType.write_roles;

      // 공지사항 게시판은 관리자만 작성 가능
      if (boardType.type === 'notice') {
        if (userRole !== 'admin') {
          return res.status(403).json({
            error: 'Permission denied',
            message: 'Only administrators can write to notice boards'
          });
        }
      } else {
        // 일반 게시판은 write_roles 체크
        if (!writeRoles.includes(userRole)) {
          return res.status(403).json({
            error: 'Permission denied',
            message: `Your role (${userRole}) is not allowed to write to this board`
          });
        }
      }

      // Attach board type to request for use in route handlers
      req.boardType = boardType;
      next();
    } catch (error) {
      console.error('Error checking board write permission:', error);
      res.status(500).json({ error: 'Failed to check board write permission' });
    }
  };
}

/**
 * 게시판 읽기 권한 체크
 * @param {string} boardTypeIdOrCode - Board type ID or code
 * @returns {Function} Express middleware
 */
function checkBoardReadPermission(boardTypeIdOrCode) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role || 'guest';

      // Get board type
      let boardType;
      if (boardTypeIdOrCode.startsWith('BOARD-TYPE-')) {
        boardType = await boardTypeService.getBoardTypeById(boardTypeIdOrCode);
      } else {
        boardType = await boardTypeService.getBoardTypeByCode(boardTypeIdOrCode);
      }

      if (!boardType) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Board type not found'
        });
      }

      // Check board status
      if (boardType.status !== 'active') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'This board is not active'
        });
      }

      // Parse read_roles (JSONB)
      const readRoles = typeof boardType.read_roles === 'string'
        ? JSON.parse(boardType.read_roles)
        : boardType.read_roles;

      // Check read permission
      if (!readRoles.includes(userRole)) {
        return res.status(403).json({
          error: 'Permission denied',
          message: `Your role (${userRole}) is not allowed to read this board`
        });
      }

      // Attach board type to request for use in route handlers
      req.boardType = boardType;
      next();
    } catch (error) {
      console.error('Error checking board read permission:', error);
      res.status(500).json({ error: 'Failed to check board read permission' });
    }
  };
}

/**
 * 게시글 수정/삭제 권한 체크
 * @returns {Function} Express middleware
 */
function checkPostEditPermission() {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const postId = req.params.id || req.params.postId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Login required'
        });
      }

      // Get post
      const post = await postService.getPostById(postId);

      if (!post) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Post not found'
        });
      }

      // 관리자는 모든 게시글 수정/삭제 가능
      if (userRole === 'admin') {
        req.post = post;
        return next();
      }

      // 본인의 게시글만 수정/삭제 가능
      if (post.author_id === userId) {
        req.post = post;
        return next();
      }

      return res.status(403).json({
        error: 'Permission denied',
        message: 'You can only edit your own posts'
      });
    } catch (error) {
      console.error('Error checking post edit permission:', error);
      res.status(500).json({ error: 'Failed to check post edit permission' });
    }
  };
}

/**
 * 댓글 수정/삭제 권한 체크
 * @returns {Function} Express middleware
 */
function checkCommentEditPermission() {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const commentId = req.params.id || req.params.commentId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Login required'
        });
      }

      // Get comment
      const commentService = require('../services/commentService');
      const comment = await commentService.getCommentById(commentId);

      if (!comment) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Comment not found'
        });
      }

      // 관리자는 모든 댓글 수정/삭제 가능
      if (userRole === 'admin') {
        req.comment = comment;
        return next();
      }

      // 본인의 댓글만 수정/삭제 가능
      if (comment.author_id === userId) {
        req.comment = comment;
        return next();
      }

      return res.status(403).json({
        error: 'Permission denied',
        message: 'You can only edit your own comments'
      });
    } catch (error) {
      console.error('Error checking comment edit permission:', error);
      res.status(500).json({ error: 'Failed to check comment edit permission' });
    }
  };
}

/**
 * 비밀글 접근 권한 체크
 * @returns {Function} Express middleware
 */
function checkSecretPostAccess() {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const postId = req.params.id || req.params.postId;

      // Get post
      const post = await postService.getPostById(postId);

      if (!post) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Post not found'
        });
      }

      // 비밀글이 아니면 통과
      if (!post.is_secret) {
        req.post = post;
        return next();
      }

      // 로그인 필요
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Login required to view secret posts'
        });
      }

      // 관리자 또는 작성자만 접근 가능
      if (userRole === 'admin' || post.author_id === userId) {
        req.post = post;
        return next();
      }

      return res.status(403).json({
        error: 'Permission denied',
        message: 'This is a secret post'
      });
    } catch (error) {
      console.error('Error checking secret post access:', error);
      res.status(500).json({ error: 'Failed to check secret post access' });
    }
  };
}

/**
 * 게시글 승인 권한 체크 (관리자만)
 * @returns {Function} Express middleware
 */
function checkPostApprovalPermission() {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'Only administrators can approve posts'
      });
    }

    next();
  };
}

module.exports = {
  checkBoardWritePermission,
  checkBoardReadPermission,
  checkPostEditPermission,
  checkCommentEditPermission,
  checkSecretPostAccess,
  checkPostApprovalPermission
};
