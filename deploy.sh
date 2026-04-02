#!/bin/bash

# Configuration
ENV_FILE=".env"
IMAGE_PREFIX="cleerio"
REDIS_IMAGE="redis:7-alpine"

# Component Ports (Defaults - can be overridden by .env)
API_PORT=3000
DASHBOARD_PORT=3001
WORKER_PORT=3002

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found!${NC} Please create it from .env.example."
    exit 1
fi

# Load variables from .env if needed (optional since we use --env-file)
# source "$ENV_FILE"

# Function to display help
show_help() {
    echo -e "${BLUE}Cleerio Deployment Manager${NC}"
    echo "Usage: $0 {api|worker|dashboard|redis|all|status}"
    echo "  api        : Build and deploy the NestJS API"
    echo "  worker     : Build and deploy the background worker"
    echo "  dashboard  : Build and deploy the Next.js Dashboard"
    echo "  redis      : Start a Redis container"
    echo "  all        : Deploy the entire stack (Redis + Apps)"
    echo "  status     : Show status of all containers"
    exit 1
}

# Function to deploy a component
deploy_component() {
    local name=$1
    local port=$2
    local target=$1
    
    echo -e "${YELLOW}>>> Deploying $name...${NC}"
    
    # Build the image using the multi-stage Dockerfile
    echo "Building $IMAGE_PREFIX-$name..."
    docker build --target $target -t $IMAGE_PREFIX-$name .
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Build failed for $name!${NC}"
        return 1
    fi
    
    # Stop and remove existing container
    echo "Cleaning up old $IMAGE_PREFIX-$name container..."
    docker stop $IMAGE_PREFIX-$name 2>/dev/null || true
    docker rm $IMAGE_PREFIX-$name 2>/dev/null || true
    
    # Run the new container
    echo "Launching $IMAGE_PREFIX-$name..."
    if [ -n "$port" ]; then
        docker run -d \
            --name $IMAGE_PREFIX-$name \
            --env-file $ENV_FILE \
            -p $port:3000 \
            --restart unless-stopped \
            $IMAGE_PREFIX-$name
    else
        # Worker doesn't need port mapping
        docker run -d \
            --name $IMAGE_PREFIX-$name \
            --env-file $ENV_FILE \
            --restart unless-stopped \
            $IMAGE_PREFIX-$name
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $name deployed successfully.${NC}"
        [ -n "$port" ] && echo -e "  Accessible at: ${BLUE}http://localhost:$port${NC}"
    fi
}

# Function to deploy Redis
deploy_redis() {
    echo -e "${YELLOW}>>> Deploying Redis...${NC}"
    
    # Clean up old Redis container
    docker stop $IMAGE_PREFIX-redis 2>/dev/null || true
    docker rm $IMAGE_PREFIX-redis 2>/dev/null || true
    
    # Run Redis container
    docker run -d \
        --name $IMAGE_PREFIX-redis \
        -p 6379:6379 \
        --restart unless-stopped \
        $REDIS_IMAGE
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Redis is running on port 6379.${NC}"
    fi
}

# Function to show status
show_status() {
    echo -e "${BLUE}Deployment Status:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep $IMAGE_PREFIX
}

# Execution logic
case "$1" in
    api)
        deploy_component "api" "$API_PORT"
        ;;
    worker)
        deploy_component "worker" ""
        ;;
    dashboard)
        deploy_component "dashboard" "$DASHBOARD_PORT"
        ;;
    redis)
        deploy_redis
        ;;
    all)
        deploy_redis
        deploy_component "api" "$API_PORT"
        deploy_component "worker" ""
        deploy_component "dashboard" "$DASHBOARD_PORT"
        ;;
    status)
        show_status
        ;;
    *)
        show_help
esac
