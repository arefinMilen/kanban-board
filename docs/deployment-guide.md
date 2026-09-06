# Live Deployment Guide: Vercel (Frontend) + Render (Backend & PostgreSQL)

This guide walks you through deploying your Full-Stack Mini Kanban Board application to **Vercel** (Frontend) and **Render** (Backend API + PostgreSQL Database).

---

## 1. Prerequisites
- A GitHub account with access to `arefinMilen/kanban-board`.
- A free account on [Render](https://render.com).
- A free account on [Vercel](https://vercel.com).

---

## 2. Deploy PostgreSQL Database on Render

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **PostgreSQL**.
3. Fill in database details:
   - **Name**: `kanban-db`
   - **Database**: `kanban_db`
   - **User**: `postgres`
   - **Region**: Choose region closest to you (e.g. Oregon/Frankfurt)
   - **Instance Type**: Free
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (for Render services) and **External Database URL** (for local migrations/seeding).

---

## 3. Deploy NestJS Backend Service on Render

1. On Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository `arefinMilen/kanban-board`.
3. Configure service settings:
   - **Name**: `kanban-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npx prisma db push && npm run start:prod
     ```
4. Add **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *(Render Internal Database URL)* |
   | `JWT_SECRET` | *(Generate a secure random string)* |
   | `JWT_REFRESH_SECRET` | *(Generate a secure random string)* |
   | `JWT_ACCESS_EXPIRATION` | `15m` |
   | `JWT_REFRESH_EXPIRATION` | `7d` |
   | `CORS_ORIGIN` | `https://your-app-name.vercel.app` *(Update after Vercel deployment)* |

5. Click **Create Web Service**.
6. Copy your live backend URL (e.g. `https://kanban-backend.onrender.com`).

---

## 4. Deploy Next.js Frontend on Vercel

1. Log into [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository `arefinMilen/kanban-board`.
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click Edit -> select `frontend`
5. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://kanban-backend.onrender.com` *(Your Render backend URL)* |

6. Click **Deploy**.
7. Once deployment finishes, copy your live Vercel domain (e.g. `https://kanban-board.vercel.app`).

---

## 5. Final Step: Update CORS on Backend

1. Return to your Render backend web service.
2. Update the `CORS_ORIGIN` environment variable to match your live Vercel URL (`https://kanban-board.vercel.app`).
3. Click **Save Changes** (Render will automatically re-deploy backend with updated CORS settings).

🎉 **Your Full-Stack Mini Kanban Board is now live on the internet!**
