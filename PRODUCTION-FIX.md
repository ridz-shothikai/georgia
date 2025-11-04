# Production Deployment Fix

## Issues Identified

1. **Missing Environment Variables** - JWT_SECRET, JWT_REFRESH_SECRET, COOKIE_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
2. **Docker Images Running Dev Mode** - The pre-built images are running `npm run dev` instead of production mode
3. **Frontend Apps Using Wrong Ports** - Next.js apps need to run on port 3000 in production, not 3001/3002/3003
4. **Backend Not Built** - Missing dist folder because images weren't built for production

## Solution

### Option 1: Rebuild Images with Production Dockerfiles (Recommended)

The images on GHCR were built with development Dockerfiles. You need to rebuild them with production Dockerfiles.

**Steps:**

1. **Update your GitHub Actions workflow** to use production Dockerfiles:
   - Use `backend/Dockerfile.production` instead of `backend/Dockerfile`
   - Use `app1/Dockerfile.production` instead of `app1/Dockerfile`
   - Use `app2/Dockerfile.production` instead of `app2/Dockerfile`
   - Use `admin-dashboard/Dockerfile.production` instead of `admin-dashboard/Dockerfile`

2. **Rebuild and push images** via GitHub Actions

3. **Update IMAGE_TAG** in your `.env` file

### Option 2: Quick Fix - Override Commands in Docker Compose (Temporary)

If you can't rebuild images immediately, you can override the CMD in docker-compose:

```yaml
services:
  backend:
    # ... existing config ...
    command: sh -c "npm run build && npm run start"
    
  region14:
    # ... existing config ...
    command: npm run start
    environment:
      PORT: 3000
      # ... other env vars ...
```

However, this won't work well because the images don't have source code - they only have package.json.

### Option 3: Create Environment File (Required for All Options)

1. **Create `.env` file** on your server:

```bash
cd ~/georgia-new
cp .env.production .env
nano .env
```

2. **Generate secure secrets**:

```bash
openssl rand -hex 32  # Use for JWT_SECRET
openssl rand -hex 32  # Use for JWT_REFRESH_SECRET  
openssl rand -hex 32  # Use for COOKIE_SECRET
```

3. **Update `.env` file** with:
   - Your MongoDB URI (already correct)
   - Generated secrets
   - Admin credentials
   - Your server IP/domain in FRONTEND_URLS and CORS_ORIGIN

### Option 4: Rebuild Images Locally (If You Have Source Code)

If you have the source code on your server:

```bash
# Build backend
cd backend
docker build -f Dockerfile.production -t ghcr.io/ridz-shothikai/georgia-backend-api:local .
cd ..

# Build app1
cd app1
docker build -f Dockerfile.production -t ghcr.io/ridz-shothikai/georgia-app1:local .
cd ..

# Build app2
cd app2
docker build -f Dockerfile.production -t ghcr.io/ridz-shothikai/georgia-app2:local .
cd ..

# Build admin-dashboard
cd admin-dashboard
docker build -f Dockerfile.production -t ghcr.io/ridz-shothikai/georgia-admin-dashboard:local .
cd ..
```

Then update docker-compose to use `local` tag or push to GHCR.

## Immediate Action Items

1. **Create `.env` file** with all required variables (see `.env.production` template)
2. **Rebuild images** with production Dockerfiles via GitHub Actions
3. **Update docker-compose.yml** to use new image tag
4. **Restart services**: `docker compose down && docker compose up -d`

## Why This Happened

The Dockerfiles in your repository are set up for **development mode**:
- They run `npm run dev` instead of building and running production
- They don't copy source code or build the applications
- Next.js apps run on different ports (3001, 3002, 3003) instead of standard 3000

For production, you need:
- Source code copied
- Applications built (`npm run build`)
- Production mode (`npm run start` or `npm start`)
- All apps on port 3000 (Next.js standard)

## Next Steps

1. I've created production Dockerfiles (`.production` versions)
2. Update your GitHub Actions workflow to use these
3. Create the `.env` file on your server
4. Rebuild and redeploy

Let me know if you need help updating the GitHub Actions workflow!
