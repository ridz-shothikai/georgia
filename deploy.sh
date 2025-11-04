#!/bin/bash

# Production Deployment Script for Georgia Platform
set -e

echo "🚀 Georgia Platform Deployment Script"
echo "======================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy env.production.example to .env and configure it:"
    echo "   cp env.production.example .env"
    echo "   nano .env"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose not found!"
    echo "📦 Please install docker-compose first"
    exit 1
fi

# Check if logged into GHCR
echo "🔐 Checking GitHub Container Registry authentication..."
if ! docker pull ghcr.io/ridz-shothikai/georgia-backend-api:latest &> /dev/null; then
    echo "⚠️  Warning: Could not pull from GHCR. You may need to login:"
    echo "   docker login ghcr.io"
    echo "   (Use your GitHub username and a Personal Access Token with 'read:packages' scope)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/logs
mkdir -p scripts

# Load environment variables
source .env
export IMAGE_TAG=${IMAGE_TAG:-latest}

echo "📥 Pulling latest images (tag: $IMAGE_TAG)..."
docker-compose -f docker-compose.production.yml pull

echo "🔄 Starting services..."
docker-compose -f docker-compose.production.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "✅ Checking service status..."
docker-compose -f docker-compose.production.yml ps

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Services:"
echo "   - Backend API: http://localhost/api"
echo "   - Region14 (App1): http://localhost/region14"
echo "   - Region2 (App2): http://localhost/region2"
echo "   - Admin Dashboard: http://localhost/dashboard"
echo "   - Login: http://localhost/login"
echo "   - Health Check: http://localhost/health"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.production.yml down"
echo "   Restart services: docker-compose -f docker-compose.production.yml restart"
echo ""
