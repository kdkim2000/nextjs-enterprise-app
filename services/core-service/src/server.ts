/**
 * Core Service - 통합 마이크로서비스
 * Auth + Admin + Common 모듈 통합
 */

// Load environment variables FIRST
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  dotenv.config();
}

import express, { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import cors from 'cors';
import {
  loadAppConfig,
  getLogger,
  errorHandler,
  notFoundHandler,
  requestLogger,
} from '@enterprise/shared';

// Auth Module Routes
import { authRoutes, userSettingsRoutes } from './modules/auth/routes';

// Admin Module Routes
import {
  userRoutes,
  roleRoutes,
  menuRoutes,
  departmentRoutes,
  programRoutes,
  userRoleMappingRoutes,
  roleProgramMappingRoutes
} from './modules/admin/routes';

// Common Module Routes
import {
  codeRoutes,
  codeTypeRoutes,
  attachmentRoutes,
  attachmentTypeRoutes,
  logRoutes,
  logAnalyticsRoutes,
  appSettingsRoutes,
  dashboardRoutes
} from './modules/common/routes';

// Swagger
import swaggerSpec from './swagger';

// Load configuration
const config = loadAppConfig('core-service');
const logger = getLogger('core-service');

// Create Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger as unknown as RequestHandler);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'core-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    modules: ['auth', 'admin', 'common']
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP core_service_up Core service status
# TYPE core_service_up gauge
core_service_up 1
`);
});

// Swagger JSON endpoint
app.get('/docs/json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI HTML
app.get('/docs', (_req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Core Service API Documentation</title>
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

// ==========================================
// AUTH MODULE ROUTES
// ==========================================
app.use('/auth', authRoutes);
app.use('/auth/user-settings', userSettingsRoutes);

// ==========================================
// ADMIN MODULE ROUTES
// ==========================================
app.use('/admin/users', userRoutes);
app.use('/admin/roles', roleRoutes);
app.use('/admin/menus', menuRoutes);
app.use('/admin/departments', departmentRoutes);
app.use('/admin/programs', programRoutes);
app.use('/admin/user-role-mappings', userRoleMappingRoutes);
app.use('/admin/role-program-mappings', roleProgramMappingRoutes);

// ==========================================
// COMMON MODULE ROUTES
// ==========================================
app.use('/common/codes', codeRoutes);
app.use('/common/code-types', codeTypeRoutes);
app.use('/common/attachments', attachmentRoutes);
app.use('/common/attachment-types', attachmentTypeRoutes);
app.use('/common/logs', logRoutes);
app.use('/common/log-analytics', logAnalyticsRoutes);
app.use('/common/app-settings', appSettingsRoutes);
app.use('/common/dashboard', dashboardRoutes);

// Error Handling
app.use(notFoundHandler as unknown as RequestHandler);
app.use(errorHandler as unknown as ErrorRequestHandler);

// Start server
const PORT = config.port || 3011;

app.listen(PORT, () => {
  logger.info('='.repeat(60));
  logger.info(`Core Service started on port ${PORT}`);
  logger.info('='.repeat(60));
  logger.info(`Environment: ${config.env}`);
  logger.info(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  logger.info(`Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
  logger.info(`Swagger docs: http://localhost:${PORT}/docs`);
  logger.info('-'.repeat(60));
  logger.info('Loaded Modules:');
  logger.info('  [Auth Module]');
  logger.info('    - /auth (login, logout, register, refresh, mfa)');
  logger.info('    - /auth/user-settings');
  logger.info('  [Admin Module]');
  logger.info('    - /admin/users');
  logger.info('    - /admin/roles');
  logger.info('    - /admin/menus');
  logger.info('    - /admin/departments');
  logger.info('    - /admin/programs');
  logger.info('    - /admin/user-role-mappings');
  logger.info('    - /admin/role-program-mappings');
  logger.info('  [Common Module]');
  logger.info('    - /common/codes');
  logger.info('    - /common/code-types');
  logger.info('    - /common/attachments');
  logger.info('    - /common/attachment-types');
  logger.info('    - /common/logs');
  logger.info('    - /common/log-analytics');
  logger.info('    - /common/app-settings');
  logger.info('    - /common/dashboard');
  logger.info('='.repeat(60));
});

export default app;
