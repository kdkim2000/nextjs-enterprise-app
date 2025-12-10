/**
 * Content Service - 콘텐츠 마이크로서비스
 * BoardType, Post, Comment, Q&A, Help 관리 담당
 */

// Load environment variables FIRST
import * as dotenv from 'dotenv';
import * as path from 'path';

// Explicitly load .env file
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
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
import {
  boardTypeRoutes,
  postRoutes,
  commentRoutes,
  qnaRoutes,
  helpRoutes
} from './routes';
import swaggerSpec from './swagger';

// 환경 설정 로드
const config = loadAppConfig('content-service');
const logger = getLogger('content-service');

// Express 앱 생성
const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger as unknown as RequestHandler);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'content-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP content_service_up Content service status
# TYPE content_service_up gauge
content_service_up 1
`);
});

// Swagger
app.get('/docs/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/docs', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Content Service API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/docs/json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout'
    });
  </script>
</body>
</html>
  `);
});

// Content Routes
app.use('/content/board-types', boardTypeRoutes);
app.use('/content/posts', postRoutes);
app.use('/content/comments', commentRoutes);
app.use('/content/qna', qnaRoutes);
app.use('/content/help', helpRoutes);

// 에러 핸들링
app.use(notFoundHandler as unknown as RequestHandler);
app.use(errorHandler as unknown as ErrorRequestHandler);

// 서버 시작
const PORT = config.port || 3013;

app.listen(PORT, () => {
  logger.info(`Content Service started on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  logger.info(`Swagger docs: http://localhost:${PORT}/docs`);
});

export default app;
