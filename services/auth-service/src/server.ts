/**
 * Auth Service - 인증 마이크로서비스
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

// 환경 설정 로드
const config = loadAppConfig('auth-service');
const logger = getLogger('auth-service');

// Express 앱 생성
const app = express();

// 미들웨어
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
// TODO: Phase 2에서 구현
// app.use('/auth', authRoutes);

// 에러 핸들링
app.use(notFoundHandler);
app.use(errorHandler);

// 서버 시작
const PORT = config.port || 3011;

app.listen(PORT, () => {
  logger.info(`Auth Service started on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
});

export default app;
