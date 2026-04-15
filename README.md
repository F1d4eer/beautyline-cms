# 💄 Beautyline CMS — Beauty Studio Management Platform

A modern React + TypeScript CMS for beauty studios with booking system, service catalog, and admin panel. Production-ready with Docker deployment and automatic updates.

## ✨ Features

- 📱 **Responsive Design** — Works on mobile, tablet, and desktop
- 🎨 **Beautiful UI** — Tailwind CSS with Framer Motion animations
- 📅 **Booking System** — Customers can book services with Telegram notifications
- 👨‍💼 **Admin Panel** — Manage services, bookings, reviews, and content
- 📸 **Media Management** — Upload and organize images with preview
- 🔐 **Secure Authentication** — Powered by Supabase with RLS
- 🚀 **Production-Ready** — Docker containerization with auto-deployment
- 🔄 **Auto-Deploy** — Updates automatically when you push code to GitHub

## 🛠️ Tech Stack

- **Frontend**: React 18.3 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: TanStack React Query
- **Backend**: Supabase (PostgreSQL + PostgREST)
- **Deployment**: Docker + Docker Compose + Nginx
- **CI/CD**: GitHub Actions
- **UI Components**: shadcn/ui + Radix UI

## 📋 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env file with your credentials
cp .env.example .env
# Edit .env with your Supabase keys

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

### Local Docker Testing

```bash
# Build Docker image
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Test at `http://localhost`

## 🚀 Production Deployment

### One-Command VPS Setup

```bash
# On your VPS (Ubuntu 22.04+)
curl -fsSL https://raw.githubusercontent.com/F1d4eer/beautyline-cms/main/setup.sh | bash
```

Then follow the prompts to configure your environment.

### Manual Setup

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed instructions on:
- Local testing with Docker
- VPS installation and configuration
- GitHub Actions auto-deployment setup
- SSL/HTTPS configuration
- Troubleshooting guide

### Project Structure

```
beautyline-cms/
├── src/
│   ├── components/          # React components (Services, Booking, etc.)
│   ├── pages/              # Page routes (Index, Admin, etc.)
│   ├── context/            # Context providers (Booking, Theme)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── data/               # Static data and configurations
│   └── App.tsx             # Main app component with routing
├── docker/                 # Docker configuration files
│   ├── Dockerfile          # Multi-stage build
│   ├── docker-compose.yml  # Compose orchestration
│   └── nginx.conf          # Reverse proxy configuration
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD
├── public/                 # Static assets
└── package.json            # Dependencies

```

### Configuration

Create `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_key

# Telegram Bot (for notifications)
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id
```

## 📚 Available Scripts

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run build:dev       # Build with development mode
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm test               # Run tests
npm test:watch         # Run tests in watch mode
```

## 🔄 Auto-Deployment Setup

### GitHub Actions Secrets

Add these to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret | Example |
|--------|---------|
| `VPS_WEBHOOK_URL` | `http://your-vps-ip:9000/deploy` |
| `VPS_WEBHOOK_SECRET` | Random string from `openssl rand -hex 32` |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token (optional) |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID (optional) |

When you push to `main` branch:
1. GitHub Actions builds Docker image
2. Triggers webhook on your VPS
3. VPS pulls latest code and restarts containers
4. Sends Telegram notification

## 📖 Documentation

- [DOCKER_SETUP.md](DOCKER_SETUP.md) — Complete deployment guide
- [setup.sh](setup.sh) — Automated VPS setup script

## 🆘 Troubleshooting

### Site Not Loading

```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f app
```

### Build Issues

```bash
# Rebuild Docker image
docker-compose build --no-cache

# Check dependencies
npm install
```

For more help, see the Troubleshooting section in [DOCKER_SETUP.md](DOCKER_SETUP.md).

## 📝 Development Notes

### Adding Services

Edit `src/data/siteData.ts` to add new services.

### Customizing Admin Panel

Admin components are in `src/pages/admin/`. Routes defined in `src/App.tsx`.

### Database Changes

Use Supabase Studio to manage database schema and data. Changes are automatically reflected in the app.

## 🔐 Security

- Environment variables never committed (see `.gitignore`)
- Supabase Row-Level Security (RLS) protects data
- Admin routes protected by Supabase authentication
- Docker containers run with minimal privileges
- Health checks monitor container health

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## 📄 License

This project is part of the Beautyline CMS system.

## 👥 Contributors

Created with ❤️ for beauty studios.

---

**Status**: Production Ready ✅

For questions or issues, check [DOCKER_SETUP.md](DOCKER_SETUP.md) or the repository issues page.
