FROM node:20-alpine AS builder

ARG SERVICE_DIR=admin-dashboard
WORKDIR /app

# Copy package files
COPY ${SERVICE_DIR}/package*.json ./
COPY shared/package.json ./shared/

# Configure npm for better reliability
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000

# Install dependencies
RUN npm install

# Copy source files
COPY ${SERVICE_DIR}/ ./
COPY shared/ ./shared/

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/shared/package.json ./shared/package.json

# Install all dependencies (including dev dependencies for Next.js dev mode)
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install

# Copy source files (needed for dev mode)
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/postcss.config.* ./
COPY --from=builder /app/tailwind.config.* ./
COPY --from=builder /app/shared ./shared

# Expose port
EXPOSE 3000

# Run dev server on port 3000 (nginx expects this)
CMD ["npm", "run", "dev", "--", "-p", "3000"]

