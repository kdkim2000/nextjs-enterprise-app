/**
 * Common Service - 공통 마이크로서비스
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

const config = loadAppConfig('common-service');
const logger = getLogger('common-service');

const app = express();

app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'common-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
// TODO: Phase 4에서 구현
// app.use('/common/codes', codeRoutes);
// app.use('/common/code-types', codeTypeRoutes);
// app.use('/common/attachments', attachmentRoutes);
// app.use('/common/logs', logRoutes);
// app.use('/common/settings', settingsRoutes);
// app.use('/common/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port || 3015;

app.listen(PORT, () => {
  logger.info(`Common Service started on port ${PORT}`);
});

export default app;
