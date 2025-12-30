#!/bin/bash

# ===========================================
# Deploy Script for ResepKu
# Run this script to deploy/update the app
# Usage: bash deploy.sh
# ===========================================

set -e

echo "=========================================="
echo "  ResepKu Deploy Script"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Navigate to app directory
APP_DIR="/home/deploy/resepku"
cd $APP_DIR

# Pull latest changes
print_status "Pulling latest changes from GitHub..."
git pull origin main

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env file not found! Creating from example..."
    cp .env.example .env
    echo "Please edit .env file with your settings:"
    echo "  nano $APP_DIR/.env"
    exit 1
fi

# Build and restart containers
print_status "Building Docker images..."
docker-compose build --no-cache

print_status "Stopping old containers..."
docker-compose down

print_status "Starting new containers..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 10

# Check container status
print_status "Checking container status..."
docker-compose ps

# Show logs for any errors
print_status "Recent logs:"
docker-compose logs --tail=20

echo ""
echo "=========================================="
echo "  Deploy Complete!"
echo "=========================================="
echo ""
echo "  Application should be running at:"
echo "  http://YOUR_VPS_IP"
echo ""
