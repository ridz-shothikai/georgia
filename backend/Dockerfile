FROM node:20-alpine AS builder

ARG SERVICE_DIR=backend
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

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/shared/package.json ./shared/package.json

# Install all dependencies (including dev dependencies for nodemon, ts-node, etc.)
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install

# Copy source files (needed for dev mode)
COPY --from=builder /app/src ./src
COPY --from=builder /app/shared ./shared

# Expose port
EXPOSE 5005

# Run dev server
CMD ["npm", "run", "dev"]

