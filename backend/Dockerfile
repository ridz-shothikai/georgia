FROM node:20-alpine

ARG SERVICE_DIR=backend
WORKDIR /app

# Copy package files
COPY ${SERVICE_DIR}/package*.json ./
COPY shared/package.json ./shared/

# Configure npm for better reliability
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000

# Install dependencies (including dev dependencies for nodemon, ts-node, etc.)
RUN npm install

# Copy source files
COPY ${SERVICE_DIR}/ ./
COPY shared/ ./shared/

# Expose port
EXPOSE 5005

# Run dev server
CMD ["npm", "run", "dev"]

