# Production Deployment Guide

This guide will help you deploy the Georgia Platform to your production server.

## Prerequisites

- Docker and Docker Compose installed on your server
- Access to GitHub Container Registry (GHCR) to pull images
- Domain name configured (optional but recommended)
- SSL certificate (for HTTPS)

## Quick Start

### 1. Clone or Download Files

Create a deployment directory on your server:

```bash
mkdir -p /opt/georgia-platform
cd /opt/georgia-platform
```

Copy the following files to your server:
- `docker-compose.production.yml`
- `nginx.conf`
- `nginx-georgia-platform.conf` (for system-level nginx)
- `setup-nginx.sh` (for system-level nginx setup)
- `env.production.example` (rename to `.env`)

### 2. Configure Environment Variables

```bash
cp .env.production.example .env
nano .env  # or use your preferred editor
```

**IMPORTANT**: Update these values:
- `IMAGE_TAG`: Use the tag from your build (e.g., `cb00aae`)
- `MONGODB_URI`: Your external MongoDB connection string (e.g., `mongodb://user:pass@host:27017/db?authSource=admin` or MongoDB Atlas URI)
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`: Generate strong random secrets
- `FRONTEND_URLS`, `CORS_ORIGIN`: Add your domain(s) or server IP with port 3023
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: Set admin credentials

**Generate secure secrets:**
```bash
# Generate random secrets
openssl rand -hex 32  # Use for JWT_SECRET
openssl rand -hex 32  # Use for JWT_REFRESH_SECRET
openssl rand -hex 32  # Use for COOKIE_SECRET
```

### 3. (Optional) Set Up System-Level Nginx (Port 3023)

**Option A: Use Docker Nginx directly on port 3023** (Recommended - simpler setup)
- Docker nginx is already configured to listen on port 3023
- No system nginx needed
- Just open port 3023 in firewall

**Option B: Use System Nginx as reverse proxy** (For SSL termination, domain handling)
If you want to use system nginx on port 3023 that proxies to Docker nginx:
- Change Docker nginx port in docker-compose.production.yml to `127.0.0.1:8080:80`
- Update nginx-georgia-platform.conf to proxy to `http://127.0.0.1:8080`
- Then run:
```bash
sudo ./setup-nginx.sh
```

**Important**: Make sure port 3023 is open in your firewall:
```bash
sudo ufw allow 3023/tcp
```

### 4. Login to GitHub Container Registry

To pull images from GHCR, you need to authenticate:

```bash
# Create a GitHub Personal Access Token (PAT) with `read:packages` scope
# Then login:
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Or manually:
docker login ghcr.io
# Username: YOUR_GITHUB_USERNAME
# Password: YOUR_GITHUB_PAT
```

### 5. Start the Services

```bash
# Pull the latest images
docker-compose -f docker-compose.production.yml pull

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check logs
docker-compose -f docker-compose.production.yml logs -f
```

### 6. Verify Deployment

```bash
# Check all containers are running
docker-compose -f docker-compose.production.yml ps

# Check health endpoints (via system nginx on port 3023)
curl http://localhost:3023/health
curl http://localhost:3023/api/health

# Or directly to docker nginx (should work but not accessible externally)
curl http://localhost/health
```

## Port Configuration

### Internal Ports (Container-to-Container)
- **Backend API**: `5005` (internal only)
- **Region14 (App1)**: `3000` (internal only)
- **Region2 (App2)**: `3000` (internal only)
- **Admin Dashboard**: `3000` (internal only)
- **Docker Nginx**: `80` (container) → `3023` (host port, directly exposed)

### External Access
- **HTTP**: Port `3023` (Docker Nginx directly exposed, or via System Nginx if configured)
- **MongoDB**: External MongoDB URL (configured via `MONGODB_URI` environment variable)

### Application Routes (Accessible via Port 3023)
- `http://your-server:3023/` → Redirects to `/dashboard/`
- `http://your-server:3023/api/` → Backend API
- `http://your-server:3023/region14` → App1 (Region14)
- `http://your-server:3023/region2` → App2 (Region2)
- `http://your-server:3023/dashboard` → Admin Dashboard
- `http://your-server:3023/login` → Central Login Portal
- `http://your-server:3023/health` → Health check endpoint

## Firewall Configuration

If using a firewall (UFW, firewalld, etc.), open port 3023:

```bash
# UFW example
sudo ufw allow 3023/tcp
sudo ufw reload
```

**Note**: Docker nginx is directly exposed on port 3023, so it needs to be opened in the firewall. If you use system nginx, you'll need to adjust the Docker nginx port mapping.

## SSL/HTTPS Setup (Recommended)

### Option 1: Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

### Option 2: Manual SSL Certificate

1. Obtain SSL certificate files
2. Update `nginx.conf` to include SSL configuration
3. Mount certificate files in docker-compose:

```yaml
nginx:
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl/cert.pem:/etc/nginx/ssl/cert.pem:ro
    - ./ssl/key.pem:/etc/nginx/ssl/key.pem:ro
```

Then update `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}

server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f nginx
```

### Update Images

```bash
# Pull latest images
docker-compose -f docker-compose.production.yml pull

# Restart services
docker-compose -f docker-compose.production.yml up -d

# Or restart specific service
docker-compose -f docker-compose.production.yml restart backend
```

### Backup MongoDB

Since you're using an external MongoDB, use MongoDB's native backup tools:

```bash
# For MongoDB Atlas or remote MongoDB
mongodump --uri="your-mongodb-uri" --out ./backup-$(date +%Y%m%d)

# Or if using mongosh
mongosh "your-mongodb-uri" --eval "db.adminCommand('ping')"
```

### Stop Services

```bash
docker-compose -f docker-compose.production.yml down

# Remove volumes (CAREFUL: deletes data)
docker-compose -f docker-compose.production.yml down -v
```

## Troubleshooting

### Images Not Pulling

1. Check GHCR authentication:
   ```bash
   docker pull ghcr.io/ridz-shothikai/georgia-backend-api:cb00aae
   ```

2. Verify image tags in GitHub Packages

### Services Not Starting

1. Check logs:
   ```bash
   docker-compose -f docker-compose.production.yml logs
   ```

2. Verify environment variables:
   ```bash
   docker-compose -f docker-compose.production.yml config
   ```

3. Check container status:
   ```bash
   docker-compose -f docker-compose.production.yml ps
   ```

### Nginx 502 Bad Gateway

- Check if backend/frontend containers are running
- Verify network connectivity:
  ```bash
  docker exec platform-nginx ping backend
  ```

### Database Connection Issues

- Verify MongoDB connection string in `.env` file (MONGODB_URI)
- Test MongoDB connection:
  ```bash
  mongosh "your-mongodb-uri" --eval "db.adminCommand('ping')"
  ```
- Check backend logs for MongoDB connection errors:
  ```bash
  docker-compose -f docker-compose.production.yml logs backend
  ```

## Security Best Practices

1. **Change all default passwords** in `.env`
2. **Use strong secrets** for JWT and cookies
3. **Enable HTTPS** in production (configure SSL in system nginx)
4. **Use secure MongoDB connection** (MongoDB Atlas or secure connection string)
5. **Regularly update images** and dependencies
6. **Monitor logs** for suspicious activity
7. **Backup database** regularly (external MongoDB)
8. **Use firewall** to restrict access (only port 3023 needed)
9. **Keep Docker and system updated**
10. **Secure MongoDB URI** - ensure it uses authentication and SSL if possible

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `IMAGE_TAG` | Docker image tag/version | Yes | `latest` |
| `MONGODB_URI` | External MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes | - |
| `COOKIE_SECRET` | Cookie encryption secret | Yes | - |
| `FRONTEND_URLS` | Allowed frontend URLs | Yes | `http://localhost:3000` |
| `CORS_ORIGIN` | CORS allowed origins | Yes | `http://localhost:3000` |
| `ADMIN_EMAIL` | Admin dashboard email | Yes | - |
| `ADMIN_PASSWORD` | Admin dashboard password | Yes | - |
| `NGINX_PORT` | HTTP port (internal, not used) | No | `80` |

## Support

For issues or questions, check:
- Application logs: `docker-compose -f docker-compose.production.yml logs`
- GitHub repository issues
- Docker documentation
