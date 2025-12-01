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

# Build Next.js - create middleware.js.nft.json before build to prevent error
ENV NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p .next/server && echo '{"version":1,"files":[]}' > .next/server/middleware.js.nft.json
RUN npm run build

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
