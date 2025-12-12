/**
 * Content Module Routes Index
 */

import { Router } from 'express';
import boardTypeRoutes from './boardType';
import postRoutes from './post';
import commentRoutes from './comment';
import qnaRoutes from './qna';
import helpRoutes from './help';

const router = Router();

// Mount routes
router.use('/board-types', boardTypeRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/qna', qnaRoutes);
router.use('/help', helpRoutes);

export default router;
