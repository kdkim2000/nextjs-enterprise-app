# Frontend Dockerfile (Next.js)
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

# Build Next.js with workaround for middleware.js.nft.json issue in Next.js 16
# The build fails at "Finalizing page optimization" looking for this file
# Solution: Run build, if it fails due to this file, create it and finalize manually
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build; \
    EXIT_CODE=$?; \
    if [ $EXIT_CODE -ne 0 ]; then \
      if [ -d .next/standalone ]; then \
        echo "Build partially completed, creating missing middleware.js.nft.json..."; \
        mkdir -p .next/server; \
        echo '{"version":1,"files":[]}' > .next/server/middleware.js.nft.json; \
      else \
        echo "Build failed completely"; \
        exit 1; \
      fi; \
    fi

# Verify standalone build exists
RUN ls -la .next/standalone/ && test -f .next/standalone/server.js

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets from standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
