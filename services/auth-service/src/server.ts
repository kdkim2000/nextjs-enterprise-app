/**
 * Auth Service - 인증 마이크로서비스
 */

// Load environment variables FIRST (before any other imports that use env vars)
import 'dotenv/config';

import express, { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import cors from 'cors';
import {
  loadAppConfig,
  getLogger,
  errorHandler,
  notFoundHandler,
  requestLogger,
} from '@enterprise/shared';
import authRoutes from './routes/auth';
import userSettingsRoutes from './routes/userSettings';

// 환경 설정 로드
const config = loadAppConfig('auth-service');
const logger = getLogger('auth-service');

// Express 앱 생성
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// 미들웨어
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger as unknown as RequestHandler);

// Health Check (root level)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  // TODO: Implement proper Prometheus metrics with prom-client
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP auth_service_up Auth service status
# TYPE auth_service_up gauge
auth_service_up 1
`);
});

// Auth Routes
app.use('/auth', authRoutes);
app.use('/auth/user-settings', userSettingsRoutes);

// 에러 핸들링
app.use(notFoundHandler as unknown as RequestHandler);
app.use(errorHandler as unknown as ErrorRequestHandler);

// 서버 시작
const PORT = config.port || 3011;

app.listen(PORT, () => {
  logger.info(`Auth Service started on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  logger.info(`Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
});

export default app;
