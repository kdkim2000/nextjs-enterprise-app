// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const userRoutes = require('./routes/user');
const fileRoutes = require('./routes/file');
const logRoutes = require('./routes/log');
const roleRoutes = require('./routes/role');
const userRoleMappingRoutes = require('./routes/userRoleMapping');
const roleMenuMappingRoutes = require('./routes/roleMenuMapping');

// Import middleware
const { loggerMiddleware } = require('./middleware/logger');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/user', userRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/log', logRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/user-role-mapping', userRoleMappingRoutes);
app.use('/api/role-menu-mapping', roleMenuMappingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
