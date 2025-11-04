FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Configure npm for better reliability
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000

# Install dependencies (no lock file present, use install)
RUN npm install

# Expose port
EXPOSE 5005
# Default command (will be overridden by docker-compose for dev)
CMD ["npm", "run", "dev"]

