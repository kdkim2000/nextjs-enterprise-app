/**
 * Communication Service - 커뮤니케이션 마이크로서비스
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

const config = loadAppConfig('communication-service');
const logger = getLogger('communication-service');

const app = express();

app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'communication-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
// TODO: Phase 4에서 구현
// app.use('/comm/mail', mailRoutes);
// app.use('/comm/messages', messageRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port || 3014;

app.listen(PORT, () => {
  logger.info(`Communication Service started on port ${PORT}`);
});

export default app;
