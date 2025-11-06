#!/bin/bash
# ==============================================================================
# Docker Build and Test Script
# ==============================================================================

set -e  # Exit on error

echo "======================================"
echo "Docker Build and Test Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="nextjs-enterprise-app"
IMAGE_TAG="latest"
CONTAINER_NAME="nextjs-enterprise-app-test"
PORT=3000

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

print_success "Docker is installed"
docker --version
echo ""

# Clean up previous container if exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    print_warning "Removing existing container..."
    docker rm -f $CONTAINER_NAME 2>/dev/null || true
fi

# Build Docker image
echo "======================================"
echo "Building Docker image..."
echo "======================================"
docker build -t $IMAGE_NAME:$IMAGE_TAG .

if [ $? -eq 0 ]; then
    print_success "Docker image built successfully"
else
    print_error "Docker image build failed"
    exit 1
fi
echo ""

# Check image size
echo "======================================"
echo "Image Information"
echo "======================================"
docker images | grep $IMAGE_NAME
echo ""

# Run container
echo "======================================"
echo "Starting Docker container..."
echo "======================================"
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:3000 \
  -e NEXT_PUBLIC_API_URL=/api \
  -e JWT_SECRET=test-secret-key-for-development-only-32chars \
  -e JWT_REFRESH_SECRET=test-refresh-secret-key-for-development-32ch \
  $IMAGE_NAME:$IMAGE_TAG

if [ $? -eq 0 ]; then
    print_success "Container started successfully"
else
    print_error "Container failed to start"
    exit 1
fi
echo ""

# Wait for application to start
echo "Waiting for application to start..."
sleep 10

# Check container status
echo "======================================"
echo "Container Status"
echo "======================================"
docker ps -f name=$CONTAINER_NAME
echo ""

# Check logs
echo "======================================"
echo "Container Logs (last 20 lines)"
echo "======================================"
docker logs --tail 20 $CONTAINER_NAME
echo ""

# Health check
echo "======================================"
echo "Health Check"
echo "======================================"
if command -v curl &> /dev/null; then
    curl -f http://localhost:$PORT/api/health || print_error "Health check failed"
    echo ""
elif command -v wget &> /dev/null; then
    wget -q -O- http://localhost:$PORT/api/health || print_error "Health check failed"
    echo ""
else
    print_warning "curl or wget not found, skipping health check"
fi
echo ""

# Instructions
echo "======================================"
echo "Docker Container Running!"
echo "======================================"
print_success "Application is available at: http://localhost:$PORT"
echo ""
echo "Useful commands:"
echo "  - View logs:       docker logs -f $CONTAINER_NAME"
echo "  - Stop container:  docker stop $CONTAINER_NAME"
echo "  - Start container: docker start $CONTAINER_NAME"
echo "  - Remove container: docker rm -f $CONTAINER_NAME"
echo "  - Access shell:    docker exec -it $CONTAINER_NAME sh"
echo ""
echo "To stop and clean up:"
echo "  docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
echo ""
