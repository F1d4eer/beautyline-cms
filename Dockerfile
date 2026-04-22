# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Переменные передаются во время сборки (VITE_* встраиваются в бандл)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_TELEGRAM_BOT_TOKEN
ARG VITE_TELEGRAM_CHAT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_TELEGRAM_BOT_TOKEN=$VITE_TELEGRAM_BOT_TOKEN
ENV VITE_TELEGRAM_CHAT_ID=$VITE_TELEGRAM_CHAT_ID

RUN npm run build

# Stage 2: Runtime
FROM node:24-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1
CMD ["serve", "-s", "dist", "-l", "3000"]
