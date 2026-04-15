# 🐳 Beautyline CMS — Docker Setup & Auto-Deployment Guide

Complete guide for deploying Beautyline CMS with Docker to a rented VPS with automatic updates on code changes.

## 📋 Table of Contents

1. [Local Testing](#local-testing)
2. [VPS Setup](#vps-setup)
3. [GitHub Actions Configuration](#github-actions-configuration)
4. [Manual Deployment Commands](#manual-deployment-commands)
5. [Troubleshooting](#troubleshooting)

---

## 🖥️ Local Testing

Before deploying to VPS, test Docker locally to ensure everything builds correctly.

### Prerequisites

- Docker Desktop installed and running
- Git configured
- `.env` file with your credentials

### Steps

#### 1. Create Local `.env` File

```bash
cd beautyline-cms
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id
EOF
```

#### 2. Build and Run Docker Compose

```bash
# Build the image
docker-compose build

# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
docker-compose logs -f nginx
```

#### 3. Test in Browser

Open `http://localhost` in your browser to verify:
- Main site loads correctly
- Admin panel at `/admin/login` works
- Services catalog displays properly
- Images and animations load

#### 4. Cleanup

```bash
# Stop containers
docker-compose down

# Remove images (optional)
docker image prune -a
```

---

## 🚀 VPS Setup

### Prerequisites

- Ubuntu 22.04+ or CentOS 8+
- SSH access to your VPS
- Domain name (optional but recommended)
- 2GB+ RAM, 20GB+ disk space

### Step-by-Step Setup

#### 1. SSH Into Your VPS

```bash
ssh root@your-vps-ip
```

#### 2. Run Setup Script

Save this as `setup.sh` on your VPS:

```bash
#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Beautyline CMS Server Setup ===${NC}"

# Update system
echo -e "${BLUE}1. Updating system...${NC}"
apt-get update && apt-get upgrade -y

# Install Docker
echo -e "${BLUE}2. Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root

# Install Docker Compose
echo -e "${BLUE}3. Installing Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
echo -e "${BLUE}4. Creating app directory...${NC}"
mkdir -p ~/beautyline-cms
cd ~/beautyline-cms

# Clone repository
echo -e "${BLUE}5. Cloning repository...${NC}"
git clone https://github.com/F1d4eer/beautyline-cms.git .

# Create .env file
echo -e "${BLUE}6. Creating .env file...${NC}"
cat > .env << 'ENVEOF'
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_TELEGRAM_BOT_TOKEN=your_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here
ENVEOF

echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit .env file: nano ~/beautyline-cms/.env"
echo "2. Start containers: cd ~/beautyline-cms && docker-compose up -d"
echo "3. Check status: docker-compose ps"
echo "4. View logs: docker-compose logs -f app"
```

Run the setup script:

```bash
curl -fsSL https://raw.githubusercontent.com/F1d4eer/beautyline-cms/main/setup.sh -o setup.sh
bash setup.sh
```

Or manual setup:

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create directory and clone
mkdir -p ~/beautyline-cms
cd ~/beautyline-cms
git clone https://github.com/F1d4eer/beautyline-cms.git .
```

#### 3. Configure `.env` File

```bash
nano ~/beautyline-cms/.env
```

Add your credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id
```

Save with `Ctrl+O`, `Enter`, `Ctrl+X`

#### 4. Create Logs Directory

```bash
mkdir -p ~/beautyline-cms/logs
```

#### 5. Start Containers

```bash
cd ~/beautyline-cms
docker-compose up -d
```

#### 6. Verify Everything is Running

```bash
# Check container status
docker-compose ps

# View app logs
docker-compose logs -f app

# View nginx logs
docker-compose logs -f nginx

# Test with curl
curl http://localhost
```

### Access Your Site

- **Main site**: `http://your-vps-ip`
- **Admin panel**: `http://your-vps-ip/admin/login`

If you see the site loading, congratulations! The Docker setup is working.

---

## 🔄 GitHub Actions Configuration

For automatic deployment on code changes, you need to configure GitHub Actions secrets and a webhook on your VPS.

### Step 1: Generate Webhook Secret

On your VPS:

```bash
# Generate a random secret
openssl rand -hex 32
# Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Step 2: Add GitHub Secrets

Go to GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value |
|---|---|
| `VPS_WEBHOOK_URL` | `http://your-vps-ip:9000/deploy` |
| `VPS_WEBHOOK_SECRET` | Your generated secret from Step 1 |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token (optional) |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID (optional) |

### Step 3: Setup Webhook on VPS

Create a simple webhook listener. Save as `~/webhook-listener.sh`:

```bash
#!/bin/bash

# Configuration
DEPLOY_DIR="/root/beautyline-cms"
WEBHOOK_SECRET="your_secret_here"
PORT=9000

# Create log directory
mkdir -p "$DEPLOY_DIR/webhook-logs"

# Simple HTTP server (using netcat)
while true; do
  {
    read -r method path protocol
    
    # Read headers
    while read -r header; do
      [ -z "$header" ] && break
    done
    
    # Check authorization
    if [[ "$method" == "POST" && "$path" == "/deploy" ]]; then
      echo "HTTP/1.1 200 OK"
      echo "Content-Type: application/json"
      echo ""
      echo '{"status":"deploying"}'
      
      # Run deployment in background
      {
        cd "$DEPLOY_DIR"
        git pull origin main
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        
        # Optional: Send notification
        # curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage \
        #   -d "chat_id=$TELEGRAM_CHAT_ID" \
        #   -d "text=✅ Beautyline deployed at $(date)"
        
      } >> "$DEPLOY_DIR/webhook-logs/deploy.log" 2>&1 &
    else
      echo "HTTP/1.1 403 Forbidden"
      echo ""
    fi
  } | nc -l -p $PORT -q 1
done
```

Make it executable and run:

```bash
chmod +x ~/webhook-listener.sh

# Run in background with nohup
nohup ~/webhook-listener.sh > ~/webhook-listener.log 2>&1 &

# Or use systemd (recommended for persistence)
```

### Step 4: Create Systemd Service (Recommended)

Save as `/etc/systemd/system/beautyline-webhook.service`:

```ini
[Unit]
Description=Beautyline CMS Webhook Listener
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/beautyline-cms
ExecStart=/bin/bash /root/webhook-listener.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
systemctl daemon-reload
systemctl enable beautyline-webhook.service
systemctl start beautyline-webhook.service

# Check status
systemctl status beautyline-webhook.service
```

### Step 5: Test Deployment

Push a change to main branch:

```bash
git add .
git commit -m "test: trigger auto-deployment"
git push origin main
```

GitHub Actions will:
1. Build Docker image
2. Trigger webhook on your VPS
3. Pull latest code
4. Rebuild and restart containers
5. Send Telegram notification (if configured)

Monitor deployment:

```bash
# On VPS
tail -f ~/webhook-listener.log
docker-compose logs -f app
```

---

## 📊 Manual Deployment Commands

Use these commands to manage your deployment directly on the VPS.

### Basic Operations

```bash
cd ~/beautyline-cms

# View status
docker-compose ps

# View logs
docker-compose logs -f app        # App logs
docker-compose logs -f nginx      # Nginx logs
docker-compose logs -f            # All logs

# Stop everything
docker-compose down

# Restart services
docker-compose restart
docker-compose restart app
docker-compose restart nginx

# Full rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

### Pull Latest Code and Deploy

```bash
cd ~/beautyline-cms

# Fetch latest from GitHub
git pull origin main

# Rebuild (optional, only if you changed Dockerfile)
docker-compose build --no-cache

# Restart
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs app
```

### Check System Resources

```bash
# Disk space
df -h

# Memory usage
free -h

# CPU usage
top

# Docker disk usage
docker system df
```

### Cleanup Old Images

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

### SSH Into Container

```bash
# Access app container
docker exec -it beautyline-app sh

# Inside container:
ls -la              # Check files
npm run build       # Manual build
exit                # Exit container
```

---

## 🔐 SSL/HTTPS Setup (Optional)

To enable HTTPS with Let's Encrypt:

### Install Certbot

```bash
apt-get install certbot python3-certbot-nginx
```

### Generate Certificate

```bash
certbot certonly --standalone -d your-domain.com
```

### Update Nginx Config

Edit `nginx.conf`, uncomment HTTPS section and update domain:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    # ... rest of config
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Reload Nginx

```bash
docker-compose restart nginx
```

---

## 🆘 Troubleshooting

### Site Not Loading

```bash
# Check if containers are running
docker-compose ps

# Check app logs
docker-compose logs app

# Check nginx logs
docker-compose logs nginx

# Test curl
curl -v http://localhost
```

### Build Fails

```bash
# Check build logs
docker-compose build --no-cache

# Verify Node version
docker run node:24-alpine node --version

# Check package.json
cat package.json | grep '"build"'
```

### Port Already in Use

```bash
# Find process using port 80
lsof -i :80
netstat -tulpn | grep ':80'

# Kill process if needed
kill -9 <PID>
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Remove old logs
rm -rf ~/beautyline-cms/logs/*
```

### Need to Update Environment Variables

```bash
# Edit .env
nano ~/beautyline-cms/.env

# Restart containers
cd ~/beautyline-cms
docker-compose restart app
docker-compose restart nginx
```

### Connection Refused Errors

```bash
# Make sure app service is healthy
docker-compose ps

# Check health status (should show "healthy")
docker inspect beautyline-app | grep -A 10 "Health"

# View app startup logs
docker-compose logs app | head -50
```

---

## 📞 Support

For issues:

1. Check the logs: `docker-compose logs -f`
2. Verify .env file has correct values
3. Ensure ports 80 and 443 are open on firewall
4. Check GitHub Actions workflow status
5. Review this guide's Troubleshooting section

---

## 🎯 Deployment Checklist

- [ ] VPS created and SSH access confirmed
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned to VPS
- [ ] `.env` file created with real credentials
- [ ] Containers started with `docker-compose up -d`
- [ ] Site loads at `http://vps-ip`
- [ ] Admin panel loads at `http://vps-ip/admin/login`
- [ ] GitHub Actions secrets configured
- [ ] Webhook listener running on VPS
- [ ] Test deployment triggered successfully
- [ ] Telegram notifications working (optional)
- [ ] SSL certificate installed (optional)
- [ ] Domain DNS points to VPS IP (optional)

---

**Status**: Ready for production deployment 🚀
