#!/bin/bash

# ===========================================
# VPS Setup Script for ResepKu
# Run this script on a fresh Ubuntu 20.04 VPS
# Usage: sudo bash setup-vps.sh
# ===========================================

set -e

echo "=========================================="
echo "  ResepKu VPS Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (sudo bash setup-vps.sh)"
    exit 1
fi

# Update system
echo ""
print_status "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install required packages
print_status "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Create deploy user
DEPLOY_USER="deploy"
print_status "Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG docker $DEPLOY_USER
    print_status "User '$DEPLOY_USER' created and added to docker group"
else
    usermod -aG docker $DEPLOY_USER
    print_status "User '$DEPLOY_USER' already exists, added to docker group"
fi

# Create app directory
APP_DIR="/home/$DEPLOY_USER/resepku"
print_status "Creating app directory..."
mkdir -p $APP_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR

# Setup SSH for deploy user
print_status "Setting up SSH for deploy user..."
mkdir -p /home/$DEPLOY_USER/.ssh
chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
chmod 700 /home/$DEPLOY_USER/.ssh

# Configure UFW firewall
print_status "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_status "Firewall configured (SSH, HTTP, HTTPS allowed)"

# Enable and start Docker
print_status "Starting Docker service..."
systemctl enable docker
systemctl start docker

# Create swap file for low memory VPS (1GB RAM)
print_status "Creating swap file (2GB) for better performance..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    print_status "Swap file created and enabled"
else
    print_status "Swap file already exists"
fi

# Configure swap settings for low memory
echo "vm.swappiness=10" >> /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
sysctl -p

# Print summary
echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
print_status "Docker version: $(docker --version)"
print_status "Docker Compose version: $(docker-compose --version)"
echo ""
print_warning "Next steps:"
echo "  1. Setup SSH key for GitHub Actions:"
echo "     - Run: sudo -u deploy ssh-keygen -t ed25519 -C 'github-actions'"
echo "     - Add public key to VPS authorized_keys"
echo "     - Add private key to GitHub Secrets"
echo ""
echo "  2. Clone your repository:"
echo "     sudo -u deploy git clone https://github.com/YOUR_USERNAME/reciepe_app.git $APP_DIR"
echo ""
echo "  3. Create .env file:"
echo "     cp $APP_DIR/.env.example $APP_DIR/.env"
echo "     nano $APP_DIR/.env"
echo ""
echo "  4. Start the application:"
echo "     cd $APP_DIR && docker-compose up -d"
echo ""
echo "=========================================="
