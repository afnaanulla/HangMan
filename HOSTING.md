# 🚀 Hosting on Render Guide

This guide details how to deploy the **HangOut & Hangman** application to Render.

## 1. Prepare Your Database

Render provides a managed PostgreSQL service.

1. Create a **New PostgreSQL** database on Render.
2. Copy the **Internal Database URL** (for backend communication) or **External Database URL** (for local testing).

## 2. Deploy the Backend (NestJS)

1. **New Web Service**: Connect your GitHub repository.
2. **Environment**: `Node`
3. **Build Command**: `npm install && npx prisma generate && npm run build`
4. **Start Command**: `npm run start:prod`
5. **Environment Variables**:
   - `DATABASE_URL`: Your Render PostgreSQL URL.
   - `JWT_SECRET`: A secure random string.
   - `PORT`: `3000` (Render will use this).

## 3. Deploy the Frontend (Angular)

1. **New Static Site**: Connect your GitHub repository.
2. **Environment**: `Static Site`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `frontend/dist/frontend/browser` (Verify the path after build).
5. **Rewrite Rules**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite` (Crucial for SPA routing).

## 4. Connect Frontend to Backend

Update your frontend API URL to point to the Render backend URL.

- In `frontend/src/app/core/services/room.service.ts` (and others), ensure the base URL utilizes an environment variable or the production backend URL.

> [!IMPORTANT]
> Ensure **CORS** is enabled on the backend for your frontend's Render URL. The current backend allows all origins via `app.enableCors()`, which is fine for testing but should be restricted in production.

---

### Troubleshooting

- **Prisma Issues**: Ensure `npx prisma generate` is part of your build command.
- **Socket.io**: Render Web Services might need "Health Check Path" set to `/` or a specific health route if defined.
- **PATH Error**: If you see `taskkill` errors locally, fix your system `PATH` (see Walkthrough.md), but this won't affect Render's Linux environment.
