# App Service Dockerfile
# Unified service: Content + Communication modules
# Production Build

FROM node:20-alpine AS base

# Builder stage - includes devDependencies for compilation
FROM base AS builder
WORKDIR /app

# Copy and build shared library first
COPY shared /shared
WORKDIR /shared
RUN npm install && npm run build

# Copy service files and install ALL dependencies (including dev)
WORKDIR /app
COPY services/app-service/package.json services/app-service/package-lock.json* ./

# Install dependencies and link shared package
RUN npm install && \
    rm -rf node_modules/@enterprise/shared && \
    mkdir -p node_modules/@enterprise && \
    ln -s /shared node_modules/@enterprise/shared

# Copy source
COPY services/app-service/src ./src
COPY services/app-service/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 service

# Copy shared library (only dist needed)
COPY --from=builder --chown=service:nodejs /shared /shared

# Copy built files
COPY --from=builder --chown=service:nodejs /app/dist ./dist
COPY --from=builder --chown=service:nodejs /app/package.json ./

# Install production dependencies only and link shared
RUN npm install --omit=dev && \
    rm -rf node_modules/@enterprise/shared && \
    mkdir -p node_modules/@enterprise && \
    ln -s /shared node_modules/@enterprise/shared

# Create uploads directory
RUN mkdir -p uploads && chown service:nodejs uploads

USER service

EXPOSE 3012

CMD ["node", "dist/server.js"]
