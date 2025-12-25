# Backend Dockerfile
# This project uses root package.json for backend dependencies
FROM node:20-alpine

WORKDIR /app

# Install build tools for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package*.json ./

# Install all dependencies (backend uses root node_modules)
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Environment variables (override at runtime)
ENV NODE_ENV=production
ENV BACKEND_PORT=3001

WORKDIR /app/backend

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
