# Content Service Dockerfile
# Production Build

FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy shared library first
COPY shared /shared
WORKDIR /shared
RUN npm ci --only=production && npm run build

# Copy service package files
WORKDIR /app
COPY services/content-service/package.json services/content-service/package-lock.json* ./
RUN npm ci --only=production

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy shared library
COPY --from=deps /shared /shared

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY services/content-service .

# Build TypeScript
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 service

# Copy shared library
COPY --from=deps --chown=service:nodejs /shared /shared

# Copy necessary files
COPY --from=builder --chown=service:nodejs /app/dist ./dist
COPY --from=builder --chown=service:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=service:nodejs /app/package.json ./

USER service

EXPOSE 3013

CMD ["node", "dist/server.js"]
