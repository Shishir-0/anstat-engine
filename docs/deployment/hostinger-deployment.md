# Hostinger Production Deployment Guide — ANSTAT AI ENGINE

## 1. Executive Summary
This guide outlines the production deployment procedure for **ANSTAT AI ENGINE** on Hostinger VPS or Node.js Standalone hosting environment.

---

## 2. Standalone Build Configuration
ANSTAT AI ENGINE is configured with `output: 'standalone'` in `next.config.ts` to produce a lightweight, self-contained server bundle that runs without Vercel or cloud-vendor proprietary dependencies.

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
};

export default nextConfig;
```

---

## 3. Hostinger VPS Deployment Steps

### Step 1: Server Prerequisites
Ensure Node.js 20.x, PM2, and Nginx are installed on Hostinger VPS:
```bash
sudo apt update && sudo apt install -y nodejs npm nginx
sudo npm install -g pm2
```

### Step 2: Build & Copy Artifacts
```bash
# Build standalone bundle
npm run build

# Copy standalone output & static assets to server
rsync -avz .next/standalone/ user@your-hostinger-vps:/var/www/anstat-engine/
rsync -avz public/ user@your-hostinger-vps:/var/www/anstat-engine/public/
rsync -avz .next/static/ user@your-hostinger-vps:/var/www/anstat-engine/.next/static/
```

### Step 3: PM2 Process Management
```bash
cd /var/www/anstat-engine
PORT=3000 pm2 start server.js --name "anstat-engine"
pm2 save
```

### Step 4: Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name app.anstat.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
