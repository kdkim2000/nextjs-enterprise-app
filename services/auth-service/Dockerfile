# Auth Service Dockerfile
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
COPY services/auth-service/package.json services/auth-service/package-lock.json* ./

# Install dependencies and link shared package
RUN npm install && \
    rm -rf node_modules/@enterprise/shared && \
    mkdir -p node_modules/@enterprise && \
    ln -s /shared node_modules/@enterprise/shared

# Copy source
COPY services/auth-service/src ./src
COPY services/auth-service/tsconfig.json ./

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

USER service

EXPOSE 3011

CMD ["node", "dist/server.js"]
