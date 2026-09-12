# 🚀 Nagadatta Agencies - Complete Production Deployment Guide

This guide provides step-by-step instructions for deploying the **Nagadatta Agencies** Digital Product Catalogue & Admin Panel to production.

---

## 📑 Table of Contents
1. [Deployment Architecture Options](#1-deployment-architecture-options)
2. [Prerequisites & Accounts Checklist](#2-prerequisites--accounts-checklist)
3. [Option A: Deploy to Render (Recommended - Free Tier Available)](#3-option-a-deploy-to-render-recommended)
4. [Option B: Deploy to Railway (Best Performance & Modern DX)](#4-option-b-deploy-to-railway)
5. [Option C: Decoupled Deploy (Vercel Frontend + Render/Railway Backend)](#5-option-c-decoupled-deploy-vercel--render)
6. [Option D: Self-Hosted VPS with Docker or PM2 + Nginx](#6-option-d-self-hosted-vps-with-docker-or-pm2)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Database Setup (PostgreSQL with Neon, Supabase, or Render)](#8-database-setup-postgresql)
9. [Cloud Image Storage (Cloudinary Setup)](#9-cloud-image-storage-cloudinary-setup)
10. [Custom Domain Setup (e.g., nagadattaagencies.com)](#10-custom-domain-setup)
11. [Post-Deployment Verification & Security Checklist](#11-post-deployment-verification--security-checklist)

---

## 1. Deployment Architecture Options

| Method | Best For | Free Tier? | Complexity |
| :--- | :--- | :---: | :---: |
| **Render (Unified)** | Easiest all-in-one deploy (Express serves API + React build) | ✅ Yes | ⭐ Easy |
| **Railway (Unified)** | Fast, reliable, instant PostgreSQL provision | 💳 Free trial / $5 credit | ⭐ Easy |
| **Vercel + Render** | Global edge CDN for frontend + Node API backend | ✅ Yes | ⭐⭐ Intermediate |
| **Docker / VPS** | Full control, single digital droplet or AWS EC2 | 💵 Low monthly cost | ⭐⭐⭐ Advanced |

---

## 2. Prerequisites & Accounts Checklist

Before deploying, ensure you have:
1. **GitHub Account**: To host your repository code.
2. **Cloud Database (PostgreSQL)**:
   - Free options: [Neon.tech](https://neon.tech), [Supabase.com](https://supabase.com), or Render Managed Postgres.
3. **Cloudinary Account (Optional but Recommended)**:
   - Sign up for a free tier at [Cloudinary.com](https://cloudinary.com) to store uploaded product images persistently.
4. **Git Repository Pushed**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Nagadatta Agencies production release"
   git remote add origin https://github.com/YOUR_USERNAME/nagadatta-agencies.git
   git branch -M main
   git push -u origin main
   ```

---

## 3. Option A: Deploy to Render (Recommended)

Render offers a unified deployment where a single Node service handles the backend API and serves the React client.

### Method 1: Using the Render Blueprint (`render.yaml`)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **Blueprints** in the top navigation.
3. Click **New Blueprint Instance**.
4. Connect your GitHub repository (`nagadatta-agencies`).
5. Render reads `render.yaml` automatically, creating:
   - A managed PostgreSQL database (`nagadatta-db`)
   - A Node.js Web Service (`nagadatta-agencies-web`)
6. Add your Cloudinary credentials under Environment Variables (if using Cloudinary).
7. Click **Apply**. Render will install dependencies, build the React frontend, run the database seed, and launch!

### Method 2: Manual Web Service Setup on Render
1. In Render, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Fill in the following settings:
   - **Name**: `nagadatta-agencies`
   - **Region**: Singapore or Frankfurt (choose nearest to India)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm --prefix server install && npm --prefix client install && npm --prefix client run build`
   - **Start Command**: `node server/server.js`
4. Add **Environment Variables** (see Section 7).
5. Click **Deploy Web Service**.

---

## 4. Option B: Deploy to Railway

Railway is fast, modern, and automatically provisions PostgreSQL databases with one click.

1. Go to [Railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `nagadatta-agencies` repository.
4. Click **Add Service** → **Database** → **PostgreSQL**.
5. Click on your `nagadatta-agencies` service:
   - Go to **Variables** tab.
   - Click **Add Reference** → Select `DATABASE_URL` from the PostgreSQL service.
   - Add `JWT_SECRET` (a strong random string, e.g. `nagadatta_production_secret_2026`).
   - Add Cloudinary variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
   - Set `NODE_ENV=production`.
6. Go to **Settings** → **Networking** → Click **Generate Domain**.
7. Your app is live at `https://your-service-name.up.railway.app`!

---

## 5. Option C: Decoupled Deploy (Vercel + Render)

In this architecture:
- **Frontend**: Deployed on Vercel's global CDN (`https://nagadattaagencies.vercel.app`).
- **Backend**: Deployed on Render or Railway (`https://nagadatta-api.onrender.com`).
- **Database**: PostgreSQL on Neon, Supabase, or Render.

### Step 1: Deploy Backend to Render
1. Create a Web Service for `server/` on Render:
   - **Build Command**: `npm --prefix server install`
   - **Start Command**: `node server/server.js`
2. Set Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: Random secure string.
   - `CORS_ORIGIN`: Your Vercel domain (e.g. `https://nagadattaagencies.vercel.app`).
   - Cloudinary credentials.
3. Note your backend URL: `https://your-backend.onrender.com`.

### Step 2: Deploy Frontend to Vercel
1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New** → **Project** → Import your repository.
3. Configure Project:
   - **Framework Preset**: Vite
   - **Root Directory**: Click Edit, select `client`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.onrender.com/api`
5. Click **Deploy**.
   - `client/vercel.json` ensures all client-side routes (`/products`, `/admin`, etc.) work without 404 errors.

---

## 6. Option D: Self-Hosted VPS with Docker or PM2

For deployment on a dedicated virtual private server (Ubuntu 22.04 / 24.04 on DigitalOcean, Linode, AWS EC2, or Hetzner).

### Docker Deployment:
```bash
# 1. Clone repository on VPS
git clone https://github.com/YOUR_USERNAME/nagadatta-agencies.git
cd nagadatta-agencies

# 2. Build Docker container image
docker build -t nagadatta-app .

# 3. Run container with environment variables
docker run -d \
  --name nagadatta \
  -p 5000:5000 \
  --restart always \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:pass@host:5432/nagadatta_db" \
  -e JWT_SECRET="your_long_random_jwt_secret" \
  -e CLOUDINARY_CLOUD_NAME="your_name" \
  -e CLOUDINARY_API_KEY="your_key" \
  -e CLOUDINARY_API_SECRET="your_secret" \
  nagadatta-app
```

### PM2 + Nginx Reverse Proxy:
```bash
# Install Node.js 20 & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

# Build client and install server dependencies
npm run install:all
npm run build:client

# Start with PM2
pm2 start server/server.js --name "nagadatta-api"
pm2 save
pm2 startup
```

Configure Nginx `/etc/nginx/sites-available/nagadatta`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable SSL using Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 7. Environment Variables Reference

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | No | Server port (default: 5000) | `5000` |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `DATABASE_URL` | Recommended | PostgreSQL connection string. If omitted, falls back to local SQLite | `postgresql://user:pass@ep-cool-123.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Yes | Secret key for signing Admin JWT tokens | `super_secret_nagadatta_key_2026` |
| `CLOUDINARY_CLOUD_NAME` | Recommended | Cloudinary account name for persistent image uploads | `dnagadatta` |
| `CLOUDINARY_API_KEY` | Recommended | Cloudinary API Key | `482910482910482` |
| `CLOUDINARY_API_SECRET` | Recommended | Cloudinary API Secret | `a8f93j2kf02jf023fj0` |
| `CORS_ORIGIN` | Optional | Comma-separated allowed origins (for decoupled setup) | `https://nagadattaagencies.vercel.app` |
| `VITE_API_URL` | Frontend only | Remote API endpoint URL for decoupled client builds | `https://api.nagadattaagencies.com/api` |

---

## 8. Database Setup (PostgreSQL)

The codebase has dual-engine support:
- If `DATABASE_URL` is set: connects to PostgreSQL and runs `schema.sql` automatically.
- If `DATABASE_URL` is empty: uses local SQLite database at `server/db/nagadatta.sqlite`.

### Using Neon.tech (Recommended Free PostgreSQL)
1. Go to [Neon.tech](https://neon.tech) and create a free project.
2. Under **Connection Details**, copy the **Pooled connection string**.
3. Set this as `DATABASE_URL` in your deployment platform environment variables.
4. When the server boots for the first time, `server/db/seed.js` will automatically create all tables and seed the initial categories, products, spare parts, and shop settings!

---

## 9. Cloud Image Storage (Cloudinary Setup)

Because cloud hosts like Render and Railway have ephemeral file systems (local uploads reset on restart), Cloudinary provides persistent, CDN-accelerated media hosting.

1. Sign up for free at [Cloudinary.com](https://cloudinary.com).
2. On your Cloudinary Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Paste them into your deployment platform's Environment Variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
4. When the shop owner uploads a product image via `/admin`, the backend will automatically stream it to Cloudinary and store the secure HTTPS URL.

---

## 10. Custom Domain Setup

To link your shop's official domain (e.g. `nagadattaagencies.com`):

1. Purchase your domain from GoDaddy, Namecheap, or Cloudflare.
2. In your hosting platform (Render or Railway or Vercel):
   - Navigate to **Custom Domains** / **Settings**.
   - Enter `nagadattaagencies.com` and `www.nagadattaagencies.com`.
3. In your DNS Provider (e.g., Cloudflare, GoDaddy):
   - Add a `CNAME` record for `www` pointing to the target host provided by your platform.
   - Add an `ANAME` or `A` record for the apex domain `@`.
4. SSL/HTTPS certificates are provisioned automatically for free.

---

## 11. Post-Deployment Verification & Security Checklist

After your site is live:

- [ ] **Check Health Endpoint**:
  Visit `https://your-domain.com/api/health`. Should return `{"status":"ok"}`.
- [ ] **Log Into Admin Panel**:
  Visit `https://your-domain.com/admin/login`.
  - Initial username: `admin`
  - Initial password: `admin123`
- [ ] **Change Admin Password**:
  From the admin dashboard or via API, update the default password to a strong private password for the shop owner.
- [ ] **Verify Google Maps Link**:
  Click "Find Us on Google Maps" on the homepage and ensure it opens the official Karimnagar showroom location.
- [ ] **Verify WhatsApp & Phone Buttons**:
  Tap "Call Shop" and "WhatsApp Enquiry" from a mobile phone to ensure phone numbers launch the appropriate dialer and WhatsApp chat.
- [ ] **Test Product & Spare Part Search**:
  Type terms like "pump", "cooler", "geyser" in the global search modal.
- [ ] **Test Image Upload**:
  In Admin Panel → Add Product, upload a test image and verify it previews correctly.
