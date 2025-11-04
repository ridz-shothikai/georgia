#!/bin/bash

# Quick setup script for production server
# This creates the .env file and sets up the environment

set -e

echo "🔧 Setting up production environment..."

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env from template
if [ -f env.production.template ]; then
    cp env.production.template .env
    echo "✅ Created .env file from template"
else
    echo "❌ env.production.template not found!"
    exit 1
fi

# Generate secrets
echo ""
echo "🔐 Generating secure secrets..."
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
COOKIE_SECRET=$(openssl rand -hex 32)

# Update .env with generated secrets
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" .env
sed -i "s|COOKIE_SECRET=.*|COOKIE_SECRET=$COOKIE_SECRET|" .env

echo "✅ Generated and saved secrets"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "your-server-ip")
echo ""
read -p "Enter your server IP or domain (default: $SERVER_IP): " CUSTOM_IP
CUSTOM_IP=${CUSTOM_IP:-$SERVER_IP}

# Update URLs
sed -i "s|http://your-server-ip:3023|http://$CUSTOM_IP:3023|g" .env

echo ""
echo "✅ Environment configured!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file and set ADMIN_EMAIL and ADMIN_PASSWORD:"
echo "   nano .env"
echo ""
echo "2. Wait for new Docker images to be built with production Dockerfiles"
echo "3. Update IMAGE_TAG in .env with the new build tag"
echo "4. Run: docker compose -f docker-compose.production-fixed.yml up -d"
echo ""
