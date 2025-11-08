# 🚀 Frontend Deployment Guide

## Quick Deploy to Render

### Step 1: Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**

### Step 2: Connect Repository
- Connect your GitHub repository: `muddusurendranehru/AI_IMAGE_OCR`

### Step 3: Configure Settings

**Basic Settings:**
- **Name**: `ocr-lab-report-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

**Environment Variables:**
```
REACT_APP_API_URL=https://ai-image-ocr-5ejd.onrender.com/api
```

### Step 4: Deploy!
Click **"Create Static Site"** and wait for deployment (~2-3 minutes)

---

## Alternative: Deploy to Vercel (Faster)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
cd frontend
vercel
```

### Step 3: Set Environment Variable
In Vercel dashboard → Settings → Environment Variables:
```
REACT_APP_API_URL=https://ai-image-ocr-5ejd.onrender.com/api
```

---

## After Deployment

1. **Get your frontend URL** (e.g., `https://ocr-lab-report-frontend.onrender.com`)

2. **Update Backend CORS** (if needed):
   - Go to Render → Your Backend Service → Environment
   - Add: `FRONTEND_URL=https://your-frontend-url.onrender.com`

3. **Test the complete flow:**
   - Visit your frontend URL
   - Sign up / Login
   - Upload a lab report image
   - View extracted data and HOMA-IQ scores!

---

## Current Backend Status ✅

- **URL**: https://ai-image-ocr-5ejd.onrender.com/
- **Status**: ✅ Running (42+ minutes uptime)
- **Database**: ✅ Connected (5 users, 7 reports)
- **OCR**: ✅ Google Vision API active

---

**Ready to deploy?** Choose Render or Vercel above! 🚀

