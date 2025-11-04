FROM node:20-alpine

ARG SERVICE_DIR=admin-dashboard
WORKDIR /app

ENV NODE_ENV=development

# Copy package files
COPY ${SERVICE_DIR}/package*.json ./
COPY shared/package.json ./shared/

# Configure npm for better reliability
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000

# Install dependencies (including dev dependencies for Next.js dev mode)
RUN npm install

# Copy source files
COPY ${SERVICE_DIR}/ ./
COPY shared/ ./shared/

# Expose port
EXPOSE 3000

# Run dev server on port 3000 (nginx expects this)
CMD ["npm", "run", "dev", "--", "-p", "3000"]

