/**
 * Communication Module Routes Index
 */

import { Router } from 'express';
import mailRoutes from './mail';
import messageRoutes from './message';
import conversationRoutes from './conversation';

const router = Router();

// Mount routes
router.use('/mail', mailRoutes);
router.use('/messages', messageRoutes);
router.use('/conversations', conversationRoutes);

export default router;
