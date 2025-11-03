#!/bin/bash
# Local Docker Build and Test Script for Frontend

set -e

echo "🚀 LeapMailr Frontend - Local Docker Build & Test"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Create network if it doesn't exist
if ! docker network inspect leapmailr-network &> /dev/null; then
    echo "📡 Creating Docker network..."
    docker network create leapmailr-network
    echo -e "${GREEN}✓ Network created${NC}"
fi

# Build frontend
echo ""
echo "🔨 Building frontend Docker image..."
docker build \
    --build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8080} \
    -t leapmailr-frontend:local .
echo -e "${GREEN}✓ Frontend image built${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local file not found, creating...${NC}"
    cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=production
EOF
    echo -e "${GREEN}✓ .env.local file created${NC}"
fi

# Start services with docker-compose
echo ""
echo "🚀 Starting frontend service..."
docker-compose up -d

echo ""
echo "⏳ Waiting for service to be ready..."
sleep 15

# Check health
echo ""
echo "🏥 Health check..."

if curl -f http://localhost:3000 &> /dev/null; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed${NC}"
    echo "   Check logs: docker logs leapmailr-frontend"
fi

# Show running containers
echo ""
echo "📊 Running container:"
docker ps --filter "name=leapmailr-frontend"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Access your application:"
echo "  Frontend:  http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f           # View logs"
echo "  docker-compose down              # Stop service"
echo "  docker-compose restart frontend  # Restart service"
