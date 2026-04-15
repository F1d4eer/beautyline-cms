#!/bin/bash

# Beautyline CMS - VPS Setup Script
# Run on a fresh Ubuntu 22.04+ server as root

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Beautyline CMS - Production VPS Setup        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}⚠️  Please run as root (use sudo)${NC}"
  exit 1
fi

# 1. Update system
echo -e "${BLUE}[1/6] Updating system packages...${NC}"
apt-get update
apt-get upgrade -y
apt-get install -y curl git wget nano

# 2. Install Docker
echo -e "${BLUE}[2/6] Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root

# 3. Install Docker Compose
echo -e "${BLUE}[3/6] Installing Docker Compose...${NC}"
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Create app directory and clone repo
echo -e "${BLUE}[4/6] Setting up application directory...${NC}"
mkdir -p /root/beautyline-cms
cd /root/beautyline-cms

# Check if repo already exists
if [ ! -d ".git" ]; then
  git clone https://github.com/F1d4eer/beautyline-cms.git .
else
  git pull origin main
fi

# 5. Create necessary directories
echo -e "${BLUE}[5/6] Creating directories...${NC}"
mkdir -p logs webhook-logs ssl

# 6. Create .env file if it doesn't exist
echo -e "${BLUE}[6/6] Creating configuration files...${NC}"
if [ ! -f ".env" ]; then
  cat > .env << 'ENVEOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Telegram Bot (optional)
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here
ENVEOF

  echo -e "${YELLOW}⚠️  .env file created with placeholder values${NC}"
  echo -e "${YELLOW}    Edit it with: nano /root/beautyline-cms/.env${NC}"
fi

# Print summary
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit configuration:"
echo "   ${YELLOW}nano /root/beautyline-cms/.env${NC}"
echo ""
echo "2. Start the application:"
echo "   ${YELLOW}cd /root/beautyline-cms${NC}"
echo "   ${YELLOW}docker-compose up -d${NC}"
echo ""
echo "3. Verify it's running:"
echo "   ${YELLOW}docker-compose ps${NC}"
echo "   ${YELLOW}docker-compose logs -f app${NC}"
echo ""
echo "4. Test in browser:"
echo "   ${YELLOW}http://your-vps-ip${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "   docker-compose logs -f app        # View app logs"
echo "   docker-compose logs -f nginx      # View nginx logs"
echo "   docker-compose restart            # Restart services"
echo "   docker-compose down               # Stop all services"
echo ""
echo -e "${BLUE}For more info, see:${NC}"
echo "   ${YELLOW}DOCKER_SETUP.md${NC}"
echo ""
