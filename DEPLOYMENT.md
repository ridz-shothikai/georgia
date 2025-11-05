# Production Deployment Guide

This guide explains how to deploy the application using Docker images from GitHub Container Registry.

## Prerequisites

1. Docker and Docker Compose installed on your server
2. GitHub Personal Access Token (PAT) with `read:packages` permission (if repository is private)
3. Access to the GitHub repository where images are published

## GitHub Actions Workflow

The `.github/workflows/build-and-push.yml` workflow automatically builds and pushes Docker images to GitHub Container Registry on:
- Push to `main` branch
- Manual workflow dispatch

Images are tagged with:
- Short commit SHA (e.g., `abc1234`)
- `latest` tag

## Setting Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# GitHub Container Registry settings
REGISTRY=ghcr.io
IMAGE_PREFIX=your-github-username/your-repo-name
TAG=latest

# Application settings
FRONTEND_URLS=http://your-domain.com:3023
CORS_ORIGIN=http://your-domain.com:3023
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password

# Optional: Override default values
# JWT_SECRET=your-jwt-secret
# JWT_REFRESH_SECRET=your-refresh-secret
# COOKIE_SECRET=your-cookie-secret
```

Replace:
- `your-github-username/your-repo-name` with your actual GitHub repository (e.g., `johndoe/georgia`)
- Other values as needed

## Authenticating with GitHub Container Registry

If your repository is private, you need to authenticate Docker with GitHub Container Registry:

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

Or using a Personal Access Token:

```bash
docker login ghcr.io -u YOUR_GITHUB_USERNAME -p YOUR_PERSONAL_ACCESS_TOKEN
```

For public repositories, authentication is not required to pull images.

## Deploying the Application

1. **Pull the latest images:**

```bash
docker compose -f docker-compose.prod.yml pull
```

2. **Start all services:**

```bash
docker compose -f docker-compose.prod.yml up -d
```

3. **View logs:**

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
```

4. **Check service status:**

```bash
docker compose -f docker-compose.prod.yml ps
```

5. **Stop services:**

```bash
docker compose -f docker-compose.prod.yml down
```

## Accessing the Application

Once deployed, the application will be available at:

- **Main Application:** http://your-server:3023
- **App1 (Region14):** http://your-server:3023/region14
- **App2 (Region2):** http://your-server:3023/region2
- **Admin Dashboard:** http://your-server:3023/dashboard
- **API:** http://your-server:3023/api

## Updating to Latest Version

To update to the latest version:

```bash
# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Restart services with new images
docker compose -f docker-compose.prod.yml up -d
```

## Using Specific Image Tags

To use a specific commit instead of `latest`:

```env
TAG=abc1234
```

Then restart the services:

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Images not found
- Verify `IMAGE_PREFIX` matches your GitHub repository name exactly
- Check that images exist in GitHub Container Registry
- Ensure you're authenticated if the repository is private

### Port already in use
- Change the port mapping in `docker-compose.prod.yml`: `"3023:3000"` to `"YOUR_PORT:3000"`

### Services not starting
- Check logs: `docker compose -f docker-compose.prod.yml logs`
- Verify all environment variables are set correctly
- Ensure MongoDB is healthy: `docker compose -f docker-compose.prod.yml ps mongodb`
