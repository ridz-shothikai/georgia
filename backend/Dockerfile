FROM node:20-alpine

ARG SERVICE_DIR=backend
WORKDIR /app

# Copy package files first
COPY ${SERVICE_DIR}/package*.json ./
COPY ${SERVICE_DIR}/tsconfig.json ./
COPY shared/package.json ./shared/package.json

# Configure npm for better reliability
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000

# Install dependencies (including dev dependencies for nodemon, ts-node, etc.)
RUN npm install

# Copy source files and shared code
COPY ${SERVICE_DIR}/src ./src
COPY shared ./shared

# Expose port
EXPOSE 5005

# Run dev server
CMD ["npm", "run", "dev"]

