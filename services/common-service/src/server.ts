/**
 * Common Service - 공통 마이크로서비스
 */

// Load environment variables FIRST
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });
// Fallback to current directory
if (!process.env.DB_HOST) {
  dotenv.config();
}

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  loadAppConfig,
  getLogger,
} from '@enterprise/shared';
import {
  codeRouter,
  codeTypeRouter,
  attachmentRouter,
  attachmentTypeRouter,
  logRouter,
  appSettingsRouter,
  dashboardRouter
} from './routes';

const config = loadAppConfig('common-service');
const logger = getLogger('common-service');

const app = express();

app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  logger.info(`→ ${req.method} ${req.path}`);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`← ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'common-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/common/codes', codeRouter);
app.use('/common/code-types', codeTypeRouter);
app.use('/common/attachments', attachmentRouter);
app.use('/common/attachment-types', attachmentTypeRouter);
app.use('/common/logs', logRouter);
app.use('/common/app-settings', appSettingsRouter);
app.use('/common/dashboard', dashboardRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    code: 'NOT_FOUND',
  });
});

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

const PORT = config.port || 3015;

app.listen(PORT, () => {
  logger.info(`Common Service started on port ${PORT}`);
  logger.info(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  logger.info(`Available endpoints:`);
  logger.info(`  - /common/codes`);
  logger.info(`  - /common/code-types`);
  logger.info(`  - /common/attachments`);
  logger.info(`  - /common/attachment-types`);
  logger.info(`  - /common/logs`);
  logger.info(`  - /common/app-settings`);
  logger.info(`  - /common/dashboard`);
});

export default app;
