/**
 * Inspection Service - 검사 체크시트 마이크로서비스
 * Templates + Items + Inspections + Sync 모듈 통합
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

// Module Routes
import { templateRoutes } from './modules/templates/routes';
import { itemRoutes } from './modules/items/routes';
import { inspectionRoutes } from './modules/inspections/routes';
import { syncRoutes } from './modules/sync/routes';
import { dashboardRoutes } from './modules/dashboard/routes';

// Swagger
import swaggerSpec from './swagger';

// Load configuration
const config = loadAppConfig('inspection-service');
const logger = getLogger('inspection-service');

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
    service: 'inspection-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    modules: ['templates', 'items', 'inspections', 'sync']
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP inspection_service_up Inspection service status
# TYPE inspection_service_up gauge
inspection_service_up 1
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
  <title>Inspection Service API Documentation</title>
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
// INSPECTION MODULE ROUTES
// ==========================================
app.use('/inspection/templates', templateRoutes);
app.use('/inspection/items', itemRoutes);
app.use('/inspection/executions', inspectionRoutes);
app.use('/inspection/sync', syncRoutes);
app.use('/inspection/dashboard', dashboardRoutes);

// Error Handling
app.use(notFoundHandler as unknown as RequestHandler);
app.use(errorHandler as unknown as ErrorRequestHandler);

// Start server
const PORT = config.port || 3013;

app.listen(PORT, () => {
  logger.info('='.repeat(60));
  logger.info(`Inspection Service started on port ${PORT}`);
  logger.info('='.repeat(60));
  logger.info(`Environment: ${config.env}`);
  logger.info(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  logger.info(`Swagger docs: http://localhost:${PORT}/docs`);
  logger.info('-'.repeat(60));
  logger.info('Loaded Modules:');
  logger.info('  [Templates Module]');
  logger.info('    - /inspection/templates (CRUD)');
  logger.info('  [Items Module]');
  logger.info('    - /inspection/items (CRUD)');
  logger.info('  [Inspections Module]');
  logger.info('    - /inspection/executions (CRUD, execute, submit)');
  logger.info('  [Sync Module]');
  logger.info('    - /inspection/sync (download, upload, status)');
  logger.info('  [Dashboard Module]');
  logger.info('    - /inspection/dashboard (stats, analytics)');
  logger.info('='.repeat(60));
});

export default app;
