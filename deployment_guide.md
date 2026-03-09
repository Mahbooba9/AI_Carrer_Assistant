# Deployment Guide - AI Career Assistant

Follow these steps to take your application live!

## Phase 1: Deploy Backend to Render

1. **Log in to [Render](https://render.com/)** and click **New > Web Service**.
2. **Connect your GitHub repository** (`AI_Carrer_Assistant`).
3. **Configure the Service:**
   - **Name:** `ai-career-assistant-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables:** Click **Advanced** and add the following:
   - `MONGODB_URI`: (Your MongoDB connection string)
   - `JWT_SECRET`: (A secret string for login)
   - `GROQ_API_KEY`: (Your Groq API Key)
   - `OPENROUTER_API_KEY`: (Your OpenRouter API Key)
   - `GEMINI_API_KEY`: (Your Gemini API Key)
   - `HUGGINGFACE_API_KEY`: (Your HuggingFace API Key)
   - `JSEARCH_API_HOST`: `jsearch.p.rapidapi.com`
   - `JSEARCH_API_KEY`: (Your JSearch API Key)
   - `PORT`: `5000`
5. **Deploy**: Click **Create Web Service**. Wait for it to deploy and **copy your Render URL** (e.g., `https://backend.onrender.com`).

---

## Phase 2: Deploy Frontend to Vercel

1. **Log in to [Vercel](https://vercel.com/)** and click **Add New > Project**.
2. **Import your GitHub repository** (`AI_Carrer_Assistant`).
3. **Configure the Project:**
   - **Framework Preset:** `Vite` (Detected automatically)
   - **Root Directory:** `frontend`
4. **Environment Variables:**
   - Add a variable named **`VITE_API_URL`**.
   - **Value:** Paste your Render URL followed by `/api` (e.g., `https://backend.onrender.com/api`).
5. **Deploy**: Click **Deploy**.

---

## Post-Deployment Checklist
- [ ] Visit your Vercel URL and check if the login/signup works.
- [ ] Test the chatbot to ensure it can communicate with the Render backend.
- [ ] Verify that resume uploads are working.

> [!IMPORTANT]
> Ensure there is no trailing slash at the end of your `VITE_API_URL` (e.g., use `.../api`, not `.../api/`).
