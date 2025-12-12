/**
 * App Service - 통합 애플리케이션 마이크로서비스
 * Content (BoardType, Post, Comment, Q&A, Help) + Communication (Mail, Messages, Conversation) 담당
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

import express, { ErrorRequestHandler, RequestHandler } from 'express';
import cors from 'cors';
import {
  loadAppConfig,
  getLogger,
  errorHandler,
  notFoundHandler,
  requestLogger,
} from '@enterprise/shared';

// Module routes
import { contentRoutes } from './modules/content';
import { communicationRoutes } from './modules/communication';

// Swagger
import swaggerSpec from './swagger';

// 환경 설정 로드
const config = loadAppConfig('app-service');
const logger = getLogger('app-service');

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
    service: 'app-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    modules: ['content', 'communication']
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP app_service_up App service status
# TYPE app_service_up gauge
app_service_up 1

# HELP app_service_modules Active modules in app service
# TYPE app_service_modules gauge
app_service_modules{module="content"} 1
app_service_modules{module="communication"} 1
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
  <title>App Service API Documentation</title>
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

// ==================== Content Module Routes ====================
// BoardType, Post, Comment, Q&A, Help
app.use('/content', contentRoutes);

// ==================== Communication Module Routes ====================
// Mail, Messages, Conversations
app.use('/comm', communicationRoutes);

// 에러 핸들링
app.use(notFoundHandler as unknown as RequestHandler);
app.use(errorHandler as unknown as ErrorRequestHandler);

// 서버 시작
const PORT = config.port || 3012;

app.listen(PORT, () => {
  logger.info(`App Service started on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  logger.info(`Modules: content, communication`);
  logger.info(`Swagger docs: http://localhost:${PORT}/docs`);
});

export default app;
