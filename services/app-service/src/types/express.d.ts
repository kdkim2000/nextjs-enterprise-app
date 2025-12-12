/**
 * Express Request 타입 확장
 */

import { JwtPayload } from '@enterprise/shared';
import { BoardType, Post, Comment } from '../modules/content/types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { type?: string };
      boardType?: BoardType;
      post?: Post;
      comment?: Comment;
    }
  }
}
