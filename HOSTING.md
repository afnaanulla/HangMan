# 🚀 Hosting on Render Guide

This guide details how to deploy the **HangOut & Hangman** application to Render.

## 1. Prepare Your Database (Neon DB)

Neon provides a powerful serverless PostgreSQL service that works great with Render.

1. Create a free account at [Neon.tech](https://neon.tech).
2. Create a new project and database.
3. Copy the **Connection String** (DATABASE_URL). It should look like `postgresql://user:password@host/dbname?sslmode=require`.

## 2. Deploy the Backend (NestJS)

1. **New Web Service**: Connect your GitHub repository.
2. **Root Directory**: `backend`
3. **Environment**: `Node`
4. **Build Command**: `npm install && npx prisma generate && npm run build`
5. **Start Command**: `npm run start:prod`
6. **Environment Variables**:
   - `DATABASE_URL`: Your Neon DB connection string.
   - `JWT_SECRET`: A secure random string.
   - `PORT`: `3000` (Render will use this).

## 3. Deploy the Frontend (Angular)

1. **New Static Site**: Connect your GitHub repository.
2. **Root Directory**: `frontend`
3. **Environment**: `Static Site`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist/frontend/browser`
6. **Rewrite Rules**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite` (Crucial for SPA routing).

## 4. Link Frontend and Backend

To allow the two services to communicate securely, you must link their URLs.

### A. Tell the Backend about the Frontend (CORS)

In the **Backend Web Service** settings on Render, add a new Environment Variable:

- **Variable**: `FRONTEND_URL`
- **Value**: `https://your-frontend-name.onrender.com` (Your Render frontend URL)

### B. Tell the Frontend about the Backend (API URL)

1. In your local code, open `frontend/src/environments/environment.prod.ts`.
2. Update the `apiUrl` to your **Render Backend URL**:
   ```typescript
   apiUrl: "https://your-backend-name.onrender.com";
   ```
3. Commit and push this change to GitHub. Render will automatically redeploy the frontend with the correct API link.

> [!IMPORTANT]
> The backend URL must NOT end with a trailing slash (e.g., use `https://api.com`, not `https://api.com/`).

---

### Troubleshooting

- **Prisma Issues**: Ensure `npx prisma generate` is part of your build command.
- **Socket.io**: Render Web Services might need "Health Check Path" set to `/` or a specific health route if defined.
- **PATH Error**: If you see `taskkill` errors locally, fix your system `PATH` (see Walkthrough.md), but this won't affect Render's Linux environment.
