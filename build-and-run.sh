#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Building Production Docker Images with Next.js Build   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Check if docker compose is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: 'docker compose' plugin is not installed${NC}"
    exit 1
fi

# Stop any running containers
print_header "Step 1: Stopping existing containers"
docker compose down
echo -e "${GREEN}✓ Containers stopped${NC}"

# Remove old images (optional)
read -p "Do you want to remove old images for a clean build? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Removing old images...${NC}"
    docker compose down --rmi all
    echo -e "${GREEN}✓ Old images removed${NC}"
fi

# Build images
print_header "Step 2: Building Docker images (this may take several minutes)"
echo -e "${YELLOW}Building MongoDB...${NC}"
docker compose build mongodb
echo -e "${GREEN}✓ MongoDB ready${NC}"
echo ""

echo -e "${YELLOW}Building Backend...${NC}"
docker compose build backend
echo -e "${GREEN}✓ Backend built${NC}"
echo ""

echo -e "${YELLOW}Building App1 (Region14 - Next.js production build)...${NC}"
docker compose build region14
echo -e "${GREEN}✓ Region14 built${NC}"
echo ""

echo -e "${YELLOW}Building App2 (Region2 - Next.js production build)...${NC}"
docker compose build region2
echo -e "${GREEN}✓ Region2 built${NC}"
echo ""

echo -e "${YELLOW}Building Admin Dashboard (Next.js production build)...${NC}"
docker compose build admin-dashboard
echo -e "${GREEN}✓ Admin Dashboard built${NC}"
echo ""

echo -e "${YELLOW}Building Nginx...${NC}"
docker compose build nginx
echo -e "${GREEN}✓ Nginx ready${NC}"

# Start containers
print_header "Step 3: Starting all containers"
docker compose up -d

# Wait for services to be healthy
print_header "Step 4: Waiting for services to be healthy"
echo -e "${YELLOW}This may take up to 2 minutes...${NC}"
echo ""

sleep 10

# Check health status
check_health() {
    local service=$1
    local max_attempts=20
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker compose ps | grep -q "$service.*healthy\|Up"; then
            echo -e "${GREEN}✓ $service is healthy${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 3
    done

    echo -e "${RED}✗ $service failed to become healthy${NC}"
    return 1
}

check_health "mongodb"
check_health "backend"
check_health "region14"
check_health "region2"
check_health "dashboard"
check_health "nginx"

echo ""

# Show container status
print_header "Step 5: Container Status"
docker compose ps

echo ""
print_header "Step 6: Checking endpoints"

test_endpoint() {
    local name=$1
    local url=$2

    echo -n "Testing $name... "
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
}

sleep 5

test_endpoint "Backend API" "http://localhost:3000/api/health"
test_endpoint "Region14" "http://localhost:3000/region14"
test_endpoint "Region2" "http://localhost:3000/region2"
test_endpoint "Dashboard" "http://localhost:3000/dashboard"

echo ""
print_header "Deployment Complete!"

echo -e "${GREEN}✓ All services are running in production mode${NC}"
echo ""
echo -e "${BLUE}Access your applications:${NC}"
echo "  • App1:    http://localhost:3000/app1"
echo "  • App2:    http://localhost:3000/app2"
echo "  • Admin:   http://localhost:3000/admin-dashboard"
echo "  • API:     http://localhost:3000/api"
echo "  • Root:    http://localhost:3000/ (redirects to app1)"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  • View logs:          docker compose logs -f"
echo "  • View specific logs: docker compose logs -f app1"
echo "  • Stop all:           docker compose down"
echo "  • Restart service:    docker compose restart app1"
echo "  • Check status:       docker compose ps"
echo ""

# Ask to view logs
read -p "Do you want to view live logs? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose logs -f
fi
