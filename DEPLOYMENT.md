# Deployment Guide for InvestorAI

This project is built with a **Vite (React)** frontend and a **Node.js (Express)** backend. It is now configured for easy deployment on platforms like [Render](https://render.com) or [Railway](https://railway.app).

## 🚀 Recommended: Render (Free/Low-Cost)

1. **Push your code to GitHub** (Done! ✅).
2. **Create a new Web Service** on [Render](https://dashboard.render.com).
3. **Connect your GitHub repository**.
4. **Configure the Service**:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Set Environment Variables**:
   - `GROQ_API_KEY`: Your API key from Groq.
   - `NODE_ENV`: `production`

---

## 🛠 Manual Deployment (VPS / Self-Host)

If you are deploying manually on a server (e.g., AWS, DigitalOcean):

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the production frontend**:
   ```bash
   npm run build
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

The server will serve the frontend from the `dist` folder on the specified `PORT` (default: 3001).

---

## 🔑 Environment Variables
Make sure to configure your `.env` variables on your hosting provider:
- `GROQ_API_KEY`: (Required for AI features)
- `PORT`: (Default: 3001)
