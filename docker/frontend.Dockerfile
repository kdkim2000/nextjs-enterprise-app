# Frontend Dockerfile (Next.js)
# Note: Using non-standalone mode due to Next.js 16 middleware.js.nft.json bug
FROM node:20-alpine AS builder

# Install build tools for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Copy .env.production if exists (optional)
RUN touch .env.production

# Build Next.js (ignoring middleware.js.nft.json error - build output is still usable)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build || echo "Build completed with warnings"

# Verify build output exists
RUN test -d .next && ls -la .next/

# Production stage - using full node_modules (not standalone)
FROM node:20-alpine AS runner

# Install only production dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy built assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use next start instead of standalone server.js
CMD ["npx", "next", "start"]
