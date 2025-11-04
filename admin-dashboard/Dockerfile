# Build stage
FROM node:20-alpine AS builder

ARG SERVICE_DIR=admin-dashboard
WORKDIR /app

# Copy package files
COPY ${SERVICE_DIR}/package*.json ./
COPY shared/package.json ./shared/package.json

# Install all dependencies
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install

# Copy source code
COPY ${SERVICE_DIR}/ ./
COPY shared ./shared

# Build shared package first
RUN cd shared && npm install && npm run build && cd ..

# Build Next.js application
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/shared/package.json ./shared/package.json

# Install only production dependencies
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install --only=production

# Copy built Next.js app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/shared ./shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run production server
CMD ["npm", "start"]
