/**
 * Communication Service - 커뮤니케이션 마이크로서비스
 * Mail, Messages, Conversation 관리 담당
 */

// Load environment variables FIRST
import * as dotenv from 'dotenv';
import * as path from 'path';

// Explicitly load .env file
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  // Try from current working directory
  dotenv.config();
}
console.log('Environment loaded:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  PORT: process.env.PORT,
});

import express, { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import cors from 'cors';
import {
  loadAppConfig,
  getLogger,
  errorHandler,
  notFoundHandler,
  requestLogger,
} from '@enterprise/shared';
import { mailRoutes, messageRoutes, conversationRoutes } from './routes';

// 환경 설정 로드
const config = loadAppConfig('communication-service');
const logger = getLogger('communication-service');

// Express 앱 생성
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// 미들웨어
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger as unknown as RequestHandler);

// Health Check (root level)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'communication-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP communication_service_up Communication service status
# TYPE communication_service_up gauge
communication_service_up 1
`);
});

// Communication Routes
app.use('/comm/mail', mailRoutes);
app.use('/comm/messages', messageRoutes);
app.use('/comm/conversations', conversationRoutes);

// 에러 핸들링
app.use(notFoundHandler as unknown as RequestHandler);
app.use(errorHandler as unknown as ErrorRequestHandler);

// 서버 시작
const PORT = config.port || 3014;

app.listen(PORT, () => {
  logger.info(`Communication Service started on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

export default app;
