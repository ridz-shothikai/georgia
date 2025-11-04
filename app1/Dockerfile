FROM node:20-alpine

WORKDIR /app

# Copy package files from app1 (build context is root)
COPY app1/package*.json ./

# Copy shared directory (build context is root)
COPY shared ./shared

# Configure npm for better reliability
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000

# Install dependencies (using npm install for local file dependencies)
RUN npm install

# Copy app1 source code (build context is root)
COPY app1/ .

# Expose port
EXPOSE 3001

# Default command (overridden by docker-compose)
CMD ["npm", "run", "dev", "-p", "3001"]

