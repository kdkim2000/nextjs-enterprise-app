// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import database
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const userRoutes = require('./routes/user');
const userSettingsRoutes = require('./routes/userSettings');
const fileRoutes = require('./routes/file');
const logRoutes = require('./routes/log');
const roleRoutes = require('./routes/role');
const userRoleMappingRoutes = require('./routes/userRoleMapping');
const roleMenuMappingRoutes = require('./routes/roleMenuMapping');
const roleProgramMappingRoutes = require('./routes/roleProgramMapping');
const programRoutes = require('./routes/program');
const helpRoutes = require('./routes/help');
const departmentRoutes = require('./routes/department');
const codeRoutes = require('./routes/code');
const codeTypeRoutes = require('./routes/codeType');
const messageRoutes = require('./routes/message');
const swaggerRoutes = require('./routes/swagger');

// Board system routes
const boardTypeRoutes = require('./routes/boardType');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const attachmentRoutes = require('./routes/attachment');
const qnaRoutes = require('./routes/qna');

// Import middleware
const { loggerMiddleware } = require('./middleware/logger');
const { errorHandler, notFoundHandler, attachResponseHelpers } = require('./middleware/errorHandler');
const {
  securityHeaders,
  preventNoSQLInjection,
  xssProtection,
  limitRequestSize,
  hideServerInfo,
} = require('./middleware/security');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
// 1. Security headers (first)
app.use(hideServerInfo);
app.use(securityHeaders);

// 2. Response helpers
app.use(attachResponseHelpers);

// 3. CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost on any port
    if (origin.match(/^http:\/\/localhost:\d+$/) ||
        origin.match(/^http:\/\/127\.0\.0\.1:\d+$/) ||
        origin.match(/^http:\/\/\[::1\]:\d+$/)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// 4. Request size limiting
app.use(limitRequestSize(10)); // 10MB limit

// 5. Body parsing with size limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 6. Security protection middleware
app.use(xssProtection);
app.use(preventNoSQLInjection);

// 7. Logging
app.use(loggerMiddleware);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/log', logRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/user-role-mapping', userRoleMappingRoutes);
app.use('/api/role-menu-mapping', roleMenuMappingRoutes);
app.use('/api/role-program-mapping', roleProgramMappingRoutes);
app.use('/api/program', programRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/code-type', codeTypeRoutes);
app.use('/api/message', messageRoutes);

// Board system routes
app.use('/api/board-type', boardTypeRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/attachment', attachmentRoutes);
app.use('/api/qna', qnaRoutes);

// API Documentation
app.use('/api-docs', swaggerRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    const poolStatus = db.getPoolStatus();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        pool: poolStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Database connection test and server start
console.log('='.repeat(70));
console.log('Starting Backend Server');
console.log('='.repeat(70));

db.testConnection()
  .then(() => {
    console.log('✓ Database connected successfully');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Database: ${process.env.DB_NAME || 'enterprise_app'}`);
    console.log(`  User: ${process.env.DB_USER || 'postgres'}`);

    app.listen(PORT, () => {
      console.log('\n✓ Server running successfully');
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  API: http://localhost:${PORT}/api`);
      console.log(`  Health: http://localhost:${PORT}/health`);
      console.log('='.repeat(70));
    });
  })
  .catch((error) => {
    console.error('\n✗ Database connection failed:');
    console.error(`  ${error.message}`);
    console.error('\n  Please check:');
    console.error('  1. PostgreSQL service is running');
    console.error('  2. Database credentials in backend/.env are correct');
    console.error('  3. Database exists and schema is created');
    console.error('  4. Migration has been run (node migration/migrate.js)');
    console.error('='.repeat(70));
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠ SIGINT received: Shutting down gracefully...');
  await db.closePool();
  console.log('✓ Database connections closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⚠ SIGTERM received: Shutting down gracefully...');
  await db.closePool();
  console.log('✓ Database connections closed');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('✗ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
