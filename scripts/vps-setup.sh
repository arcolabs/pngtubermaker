#!/bin/bash
# PNGTuberMaker VPS Setup Script
# Run on a fresh Ubuntu 22.04+ Hetzner VPS
# Usage: ssh root@your-vps 'bash -s' < scripts/vps-setup.sh

set -euo pipefail

echo "=== PNGTuberMaker VPS Setup ==="

# 1. Update system
echo "[1/5] Updating system..."
apt-get update && apt-get upgrade -y

# 2. Install Docker
echo "[2/5] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 3. Install Docker Compose plugin
echo "[3/5] Verifying Docker Compose..."
docker compose version

# 4. Create app directory
echo "[4/5] Creating app directory..."
mkdir -p /opt/pngtubermaker
cd /opt/pngtubermaker

# 5. Firewall (ufw)
echo "[5/5] Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    ufw --force enable
fi

echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Clone your repo:    cd /opt/pngtubermaker && git clone <your-repo> ."
echo "  2. Create .env file:   cp .env.example .env && nano .env"
echo "  3. Update Caddyfile:   nano Caddyfile  (set your domain)"
echo "  4. Point DNS:          A record → $(curl -s ifconfig.me)"
echo "  5. Deploy:             docker compose up -d --build"
echo "  6. Check logs:         docker compose logs -f"
echo ""
