/**
 * Content Service - 콘텐츠 마이크로서비스
 */

import express from 'express';
import cors from 'cors';
import {
  loadAppConfig,
  getLogger,
  errorHandler,
  notFoundHandler,
  requestLogger,
} from '@enterprise/shared';

const config = loadAppConfig('content-service');
const logger = getLogger('content-service');

const app = express();

app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'content-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
// TODO: Phase 4에서 구현
// app.use('/content/board-types', boardTypeRoutes);
// app.use('/content/posts', postRoutes);
// app.use('/content/comments', commentRoutes);
// app.use('/content/qna', qnaRoutes);
// app.use('/content/help', helpRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port || 3013;

app.listen(PORT, () => {
  logger.info(`Content Service started on port ${PORT}`);
});

export default app;
