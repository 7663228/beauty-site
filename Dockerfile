# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_SUPABASE_URL=https://nlwxoneprpqzazzinelt.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd3hvbmVwcnBxemF6emluZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzcxMDgsImV4cCI6MjA5MjM1MzEwOH0.8TPcVTgTG12TScxF8pVrIfhqhr9eRXtzcQVss7NgTTY

RUN npm run build

# ---- Stage 3: Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=https://nlwxoneprpqzazzinelt.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd3hvbmVwcnBxemF6emluZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzcxMDgsImV4cCI6MjA5MjM1MzEwOH0.8TPcVTgTG12TScxF8pVrIfhqhr9eRXtzcQVss7NgTTY

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

# 覆盖默认 entrypoint，防止平台注入 nginx
ENTRYPOINT []
CMD ["node", "server.js"]
