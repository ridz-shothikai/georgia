# Build stage
FROM node:20-alpine AS builder

ARG SERVICE_DIR=backend
WORKDIR /app

# Copy package files
COPY ${SERVICE_DIR}/package*.json ./
COPY ${SERVICE_DIR}/tsconfig.json ./
COPY shared/package.json ./shared/package.json

# Install all dependencies (including dev for build)
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install

# Copy source code
COPY ${SERVICE_DIR}/src ./src
COPY shared ./shared

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/shared/package.json ./shared/package.json

# Install only production dependencies
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5005/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run production server
CMD ["node", "dist/index.js"]
