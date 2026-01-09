# Deployment Guide

This application is ready for deployment on platforms like **Render** (Backend) and **Vercel** (Frontend).

## 1. Backend Deployment (Render / Railway)

The backend is containerized using `Dockerfile`.

### Steps for Render:
1.  Connect your GitHub repository.
2.  Create a **New Web Service**.
3.  Select the `backend` directory as the **Root Directory**.
4.  Render should automatically detect the `Dockerfile`.
5.  **Environment Variables**:
    *   `GROQ_API_KEY`: `<your_groq_api_key>`
    *   `SECRET_KEY`: (Generate a random string)

### Steps for Railway:
1.  Connect GitHub repo.
2.  Set `Root Directory` to `backend`.
3.  Add the variables above to the service settings.

---

## 2. Frontend Deployment (Vercel / Netlify)

The frontend is a standard Vite React application.

### Steps for Vercel:
1.  Import the project from GitHub.
2.  Set **Root Directory** to `frontend`.
3.  **Build Command**: `npm run build`
4.  **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed backend (e.g., `https://your-backend.onrender.com`).
    *   *Note: Ensure no trailing slash on the URL.*

---

## 3. Post-Deployment
1.  **Seed Data**:
    *   The `reviews.db` in Docker will start empty.
    *   You can set up a volume for persistence if needed, or run the seed script via the platform's console if available.
    *   **Admin Login**: `admin` / `password123` (Admin is created automatically on first run via `startup` event if configured, or use `/auth/setup-admin`).

## 4. Local Testing
- **Backend**: `uvicorn main:app --reload` (Port 8000)
- **Frontend**: `npm run dev` (Port 5173)
