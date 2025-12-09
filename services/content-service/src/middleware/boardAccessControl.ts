/**
 * Board Access Control Middleware
 */

import { Request, Response, NextFunction } from 'express';
import * as boardTypeService from '../services/boardTypeService';
import * as postService from '../services/postService';
import * as commentService from '../services/commentService';

/**
 * Check board type write permission
 */
export function checkBoardWritePermission(boardTypeIdOrCode: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Login required'
        });
        return;
      }

      // Get board type
      let boardType;
      if (boardTypeIdOrCode.startsWith('BOARD-TYPE-')) {
        boardType = await boardTypeService.getBoardTypeById(boardTypeIdOrCode);
      } else {
        boardType = await boardTypeService.getBoardTypeByCode(boardTypeIdOrCode);
      }

      if (!boardType) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Board type not found'
        });
        return;
      }

      // Check board status
      if (boardType.status !== 'active') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'This board is not active'
        });
        return;
      }

      // Parse write_roles (JSONB)
      const writeRoles = typeof boardType.write_roles === 'string'
        ? JSON.parse(boardType.write_roles)
        : boardType.write_roles || [];

      // Notice boards can only be written by admin
      if (boardType.type === 'notice') {
        if (userRole !== 'admin') {
          res.status(403).json({
            error: 'Permission denied',
            message: 'Only administrators can write to notice boards'
          });
          return;
        }
      } else {
        // Check write_roles for other boards
        if (!writeRoles.includes(userRole)) {
          res.status(403).json({
            error: 'Permission denied',
            message: `Your role (${userRole}) is not allowed to write to this board`
          });
          return;
        }
      }

      // Attach board type to request
      req.boardType = boardType;
      next();
    } catch (error) {
      console.error('Error checking board write permission:', error);
      res.status(500).json({ error: 'Failed to check board write permission' });
    }
  };
}

/**
 * Check board type read permission
 */
export function checkBoardReadPermission(boardTypeIdOrCode: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role || 'guest';

      // Get board type
      let boardType;
      if (boardTypeIdOrCode.startsWith('BOARD-TYPE-')) {
        boardType = await boardTypeService.getBoardTypeById(boardTypeIdOrCode);
      } else {
        boardType = await boardTypeService.getBoardTypeByCode(boardTypeIdOrCode);
      }

      if (!boardType) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Board type not found'
        });
        return;
      }

      // Check board status
      if (boardType.status !== 'active') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'This board is not active'
        });
        return;
      }

      // Parse read_roles (JSONB)
      const readRoles = typeof boardType.read_roles === 'string'
        ? JSON.parse(boardType.read_roles)
        : boardType.read_roles || [];

      // Check read permission
      if (!readRoles.includes(userRole)) {
        res.status(403).json({
          error: 'Permission denied',
          message: `Your role (${userRole}) is not allowed to read this board`
        });
        return;
      }

      // Attach board type to request
      req.boardType = boardType;
      next();
    } catch (error) {
      console.error('Error checking board read permission:', error);
      res.status(500).json({ error: 'Failed to check board read permission' });
    }
  };
}

/**
 * Check post edit permission
 */
export function checkPostEditPermission() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const postId = req.params.id || req.params.postId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Login required'
        });
        return;
      }

      // Get post
      const post = await postService.getPostById(postId);

      if (!post) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Post not found'
        });
        return;
      }

      // Admin can edit all posts
      if (userRole === 'admin') {
        req.post = post;
        next();
        return;
      }

      // Users can only edit their own posts
      if (post.author_id === userId) {
        req.post = post;
        next();
        return;
      }

      res.status(403).json({
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
 * Check comment edit permission
 */
export function checkCommentEditPermission() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const commentId = req.params.id || req.params.commentId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Login required'
        });
        return;
      }

      // Get comment
      const comment = await commentService.getCommentById(commentId);

      if (!comment) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Comment not found'
        });
        return;
      }

      // Admin can edit all comments
      if (userRole === 'admin') {
        req.comment = comment;
        next();
        return;
      }

      // Users can only edit their own comments
      if (comment.author_id === userId) {
        req.comment = comment;
        next();
        return;
      }

      res.status(403).json({
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
 * Check secret post access
 */
export function checkSecretPostAccess() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const postId = req.params.id || req.params.postId;

      // Get post
      const post = await postService.getPostById(postId);

      if (!post) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Post not found'
        });
        return;
      }

      // Not a secret post - allow access
      if (!post.is_secret) {
        req.post = post;
        next();
        return;
      }

      // Login required for secret posts
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Login required to view secret posts'
        });
        return;
      }

      // Admin or author can access secret posts
      if (userRole === 'admin' || post.author_id === userId) {
        req.post = post;
        next();
        return;
      }

      res.status(403).json({
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
 * Check post approval permission (admin only)
 */
export function checkPostApprovalPermission() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      res.status(403).json({
        error: 'Permission denied',
        message: 'Only administrators can approve posts'
      });
      return;
    }

    next();
  };
}
