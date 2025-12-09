/**
 * Admin Service - 관리 마이크로서비스
 * User, Role, Menu 관리 담당
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
  JWT_SECRET: process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'NOT SET',
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
import { userRoutes, roleRoutes, menuRoutes, departmentRoutes, userRoleMappingRoutes, programRoutes, roleProgramMappingRoutes } from './routes';

// 환경 설정 로드
const config = loadAppConfig('admin-service');
const logger = getLogger('admin-service');

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
    service: 'admin-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP admin_service_up Admin service status
# TYPE admin_service_up gauge
admin_service_up 1
`);
});

// Admin Routes
app.use('/admin/users', userRoutes);
app.use('/admin/roles', roleRoutes);
app.use('/admin/menus', menuRoutes);
app.use('/admin/departments', departmentRoutes);
app.use('/admin/user-role-mappings', userRoleMappingRoutes);
app.use('/admin/programs', programRoutes);
app.use('/admin/role-program-mappings', roleProgramMappingRoutes);

// 에러 핸들링
app.use(notFoundHandler as unknown as RequestHandler);
app.use(errorHandler as unknown as ErrorRequestHandler);

// 서버 시작
const PORT = config.port || 3012;

app.listen(PORT, () => {
  logger.info(`Admin Service started on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

export default app;
