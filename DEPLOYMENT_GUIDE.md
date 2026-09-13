# 🚀 Nagadatta Agencies — Complete Production Deployment Guide

This guide provides step-by-step instructions for deploying **Nagadatta Agencies** Digital Showcase & Admin Panel to production using **Vercel (Website + Serverless API) + Persistent PostgreSQL (Neon.tech / Supabase.com) + Cloudinary (All Images)**.

---

## 📑 Table of Contents
1. [Target Production Architecture](#1-target-production-architecture)
2. [Prerequisites & Accounts Checklist](#2-prerequisites--accounts-checklist)
3. [Step 1: Set Up Persistent PostgreSQL (Neon / Supabase)](#step-1-set-up-persistent-postgresql-neon--supabase)
4. [Step 2: Set Up Cloudinary Image Storage](#step-2-set-up-cloudinary-image-storage)
5. [Step 3: Push Code to GitHub](#step-3-push-code-to-github)
6. [Step 4: One-Time Data Migration (SQLite to PostgreSQL)](#step-4-one-time-data-migration-sqlite-to-postgresql)
7. [Step 5: Deploy to Vercel](#step-5-deploy-to-vercel)
8. [Step 6: Custom Domain Setup (Optional)](#step-6-custom-domain-setup-optional)
9. [Post-Deployment Verification & Security Test](#post-deployment-verification--security-test)
10. [Environment Variables Reference](#environment-variables-reference)

---

## 1. Target Production Architecture

```
                       CUSTOMER
                          │
                          ▼
                    ┌───────────┐
                    │  VERCEL   │
                    │ Website   │
                    │ + API     │
                    └─────┬─────┘
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
         ┌─────────────┐     ┌─────────────┐
         │   NEON /    │     │ CLOUDINARY  │
         │  SUPABASE   │     │             │
         │ PostgreSQL  │     │ All Images  │
         └─────────────┘     └─────────────┘
                ▲
                │
           ADMIN PANEL
                │
          Secure Login
                │
          Ctrl + Shift + A
                │
              /admin
```

- **Frontend & API**: Hosted on **Vercel** (Global CDN + Serverless Functions).
- **Database**: **Neon PostgreSQL** or **Supabase PostgreSQL** (Persistent, independent of Vercel restarts).
- **Images**: **Cloudinary** (Persistent cloud image storage for product gallery, logo, and hero image).

---

## 2. Prerequisites & Accounts Checklist

Before deploying, ensure you have:
1. **GitHub Account**: Free account at [GitHub.com](https://github.com).
2. **Vercel Account**: Free account at [Vercel.com](https://vercel.com).
3. **Neon PostgreSQL Account**: Free account at [Neon.tech](https://neon.tech) (or [Supabase.com](https://supabase.com)).
4. **Cloudinary Account**: Free account at [Cloudinary.com](https://cloudinary.com).

---

## Step 1: Set Up Persistent PostgreSQL (Neon / Supabase)

### Option A: Using Neon.tech (Recommended - Fast & Free)
1. Go to [Neon.tech](https://neon.tech) and log in with GitHub.
2. Click **Create Project**. Name it `nagadatta-db`.
3. Choose region closest to India (e.g. `ap-southeast-1` Singapore).
4. After project creation, copy the **Connection String**.
   - Example format: `postgresql://user:pass@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/nagadatta-db?sslmode=require`

### Option B: Using Supabase.com
1. Go to [Supabase.com](https://supabase.com) and log in.
2. Click **New Project**. Set name `nagadatta-agencies` and choose a strong database password.
3. Go to **Project Settings** → **Database** → Connection String → URI.
4. Copy the connection string (`postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`).

---

## Step 2: Set Up Cloudinary Image Storage

1. Log in to [Cloudinary.com](https://cloudinary.com).
2. Go to **Dashboard**.
3. Note down the following 3 credentials:
   - **Cloud Name**: (e.g. `nagadatta_cloud`)
   - **API Key**: (e.g. `123456789012345`)
   - **API Secret**: (e.g. `aBc123XyZ_secret_key`)

---

## Step 3: Push Code to GitHub

Open terminal in `NAGADATTA AGENCIES` folder and run:

```bash
git init
git add .
git commit -m "Nagadatta Agencies production release with Vercel, Neon PostgreSQL and Cloudinary"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/nagadatta-agencies.git
git branch -M main
git push -u origin main
```

---

## Step 4: One-Time Data Migration (SQLite to PostgreSQL)

To migrate existing products, categories, spare parts, and shop settings from local SQLite into your new cloud PostgreSQL database:

1. Open `.env` or set `DATABASE_URL` in terminal:
   ```bash
   set DATABASE_URL="postgresql://user:pass@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/nagadatta_db?sslmode=require"
   ```
2. Run the migration script:
   ```bash
   node server/db/migrate-sqlite-to-pg.js
   ```
3. You will see output confirming:
   ```
   [MIGRATION-IMPORT] Imported 1 user(s) into PostgreSQL.
   [MIGRATION-IMPORT] Imported 16 shop setting(s) into PostgreSQL.
   [MIGRATION-IMPORT] Imported 11 category/categories into PostgreSQL.
   [MIGRATION-IMPORT] Imported 12 product(s) into PostgreSQL.
   [MIGRATION-IMPORT] Imported 9 spare part(s) into PostgreSQL.
   ```

---

## Step 5: Deploy to Vercel

1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repository (`nagadatta-agencies`).
4. **Project Settings**:
   - Vercel automatically detects Vite & Node via `vercel.json`.
   - **Framework Preset**: Vite (or leave default).
   - **Root Directory**: `./` (leave default).
5. Expand **Environment Variables** and add the following:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@ep-cool-name.../nagadatta_db?sslmode=require` | Neon/Supabase PostgreSQL connection string |
| `JWT_SECRET` | `nagadatta_production_secret_key_karimnagar_2026` | Random secret key for admin auth tokens |
| `CLOUDINARY_CLOUD_NAME` | `nagadatta_cloud` | Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | `123456789012345` | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `aBc123XyZ_secret_key` | Your Cloudinary API Secret |
| `NODE_ENV` | `production` | Production environment flag |

6. Click **Deploy**.
7. Vercel will install dependencies, build the frontend React application, register the Serverless API routes, and make the website live at `https://nagadatta-agencies.vercel.app`!

---

## Step 6: Custom Domain Setup (Optional)

If the business owner purchases a custom domain (e.g. `nagadattaagencies.com`):

1. In Vercel Dashboard, select project `nagadatta-agencies`.
2. Go to **Settings** → **Domains**.
3. Enter `nagadattaagencies.com` and click **Add**.
4. In your domain registrar (GoDaddy, Namecheap, etc.), update DNS records:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME Record**: `www` → `cname.vercel-dns.com`
5. Vercel automatically issues an SSL certificate within minutes.

---

## Post-Deployment Verification & Security Test

After deployment, perform these exact checks on the live site:

### Storefront Customer Audit:
1. Open `https://your-app.vercel.app` in mobile & desktop browser.
2. Verify **NO Admin buttons or links** are visible in Header, Navbar, Hero, Content, or Footer.
3. Test search, category filtering, product modal, and spare parts listing.
4. Verify WhatsApp, Call Shop, and Google Maps "Get Directions" buttons work.

### Admin Panel Audit:
1. Press `Ctrl + Shift + A` (or open `/admin` directly).
2. Verify Admin Login page appears cleanly without default credentials displayed.
3. Sign in using admin username & password.
4. Change product status (`Available`, `Limited`, `Out of Stock`) and toggle `Most Selling`.
5. Upload a product image from your laptop (or enter image URL). Save product.
6. Refresh the page -> verify image persists.
7. Log out.

### Restart / Cold Start Persistence Test:
1. Close browser completely.
2. Reopen website.
3. Verify all updated products, availability statuses, shop settings, logo, and uploaded Cloudinary images remain 100% intact!

---

## Environment Variables Reference

| Variable Name | Required? | Location | Description |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | ✅ Yes | Server / Vercel | PostgreSQL connection URI |
| `JWT_SECRET` | ✅ Yes | Server / Vercel | Admin token signing key |
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes | Server / Vercel | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | ✅ Yes | Server / Vercel | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Server / Vercel | Cloudinary API secret |
| `NODE_ENV` | ✅ Yes | Server / Vercel | Set to `production` |
| `VITE_API_URL` | ❌ Optional | Client / Vercel | Set only if API is hosted on a different domain |
