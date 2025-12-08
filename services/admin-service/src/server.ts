/**
 * Admin Service - 관리 마이크로서비스
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

const config = loadAppConfig('admin-service');
const logger = getLogger('admin-service');

const app = express();

app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'admin-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
// TODO: Phase 3에서 구현
// app.use('/admin/users', userRoutes);
// app.use('/admin/roles', roleRoutes);
// app.use('/admin/departments', departmentRoutes);
// app.use('/admin/menus', menuRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port || 3012;

app.listen(PORT, () => {
  logger.info(`Admin Service started on port ${PORT}`);
});

export default app;
