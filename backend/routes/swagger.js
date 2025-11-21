/**
 * Swagger UI Route
 *
 * Serves interactive API documentation using Swagger UI
 *
 * Installation Required:
 * npm install swagger-jsdoc swagger-ui-express
 */

const express = require('express');
const router = express.Router();

// Try to load swagger modules (fail gracefully if not installed)
let swaggerUi, swaggerSpec;

try {
  swaggerUi = require('swagger-ui-express');
  swaggerSpec = require('../swagger.config');
} catch (error) {
  console.warn('Swagger modules not installed. Run: npm install swagger-jsdoc swagger-ui-express');
}

/**
 * Swagger UI Options
 */
const swaggerUIOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Enterprise API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
  },
};

/**
 * Serve Swagger JSON
 */
router.get('/json', (req, res) => {
  if (!swaggerSpec) {
    return res.status(503).json({
      error: 'Swagger not configured',
      message: 'Install swagger-jsdoc and swagger-ui-express',
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * Serve Swagger UI
 */
if (swaggerUi && swaggerSpec) {
  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(swaggerSpec, swaggerUIOptions));
} else {
  router.get('/', (req, res) => {
    res.status(503).send(`
      <html>
        <head>
          <title>API Documentation - Not Configured</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #333; }
            code {
              background: #f0f0f0;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
            .command {
              background: #2d3748;
              color: #48bb78;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
              font-family: 'Courier New', monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📚 API Documentation</h1>
            <p>Swagger documentation is not configured yet.</p>

            <h2>Installation Required:</h2>
            <div class="command">npm install swagger-jsdoc swagger-ui-express</div>

            <h2>Optional (TypeScript support):</h2>
            <div class="command">npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express</div>

            <p>After installation, restart the server to access the interactive API documentation.</p>

            <h3>What you'll get:</h3>
            <ul>
              <li>Interactive API documentation</li>
              <li>Test endpoints directly from browser</li>
              <li>Request/response examples</li>
              <li>Schema validation</li>
              <li>Authentication testing</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  });
}

module.exports = router;
