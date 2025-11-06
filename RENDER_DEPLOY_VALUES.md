# 🚀 Render Deployment - Copy-Paste Values

## ✅ All Values Ready for Deployment

---

## 📊 Your Neon Database

- **Project**: autumn-darkness-64907462
- **Database**: AI_OCR
- **Region**: Singapore (ap-southeast-1)
- **Console**: https://console.neon.tech/app/projects/autumn-darkness-64907462

---

## 🔑 Backend Environment Variables

Copy-paste these **4 values** when deploying backend on Render:

### 1️⃣ DATABASE_URL
```
postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/AI_OCR?sslmode=require&channel_binding=require
```

### 2️⃣ JWT_SECRET
```
DrNehru_COD_HOMA_IQ_2024_SecureJWT_HomaHealthCenter_9963721999
```

### 3️⃣ PORT
```
3008
```

### 4️⃣ NODE_ENV
```
production
```

---

## 🎨 Frontend Environment Variable

Copy-paste this **1 value** when deploying frontend on Render:

### REACT_APP_API_URL
```
[YOUR_BACKEND_URL]/api
```

**Example:**
```
https://ocr-lab-backend.onrender.com/api
```

⚠️ **Replace with your actual backend URL from Step 1!**

---

## 🚀 Deployment Steps (Quick Reference)

### Step 1: Deploy Backend
1. Go to: **https://render.com**
2. Sign in with GitHub
3. New + → Web Service
4. Connect: `muddusurendranehru/AI_IMAGE_OCR`
5. Settings:
   - Name: `ocr-lab-backend`
   - Region: `Singapore`
   - **⚠️ Root Directory: `backend`** ← **CRITICAL! Don't leave empty!**
   - Build Command: `npm install`
   - Start Command: `node app.js`
6. Click "Advanced" → Add 4 environment variables (above)
7. Create Web Service
8. **COPY your backend URL when it shows "Live"**

**⚠️ IMPORTANT:** Your project has separate `backend/` and `frontend/` folders (monorepo structure). You **MUST** specify the Root Directory, or Render won't find your `package.json` and deployment will fail!

### Step 2: Deploy Frontend
1. New + → Static Site
2. Connect same repository
3. Settings:
   - Name: `ocr-lab-frontend`
   - **⚠️ Root Directory: `frontend`** ← **CRITICAL! Don't leave empty!**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Add environment variable: `REACT_APP_API_URL` (use your backend URL)
5. Create Static Site
6. Wait for "Live" status

**⚠️ IMPORTANT:** Just like the backend, you **MUST** specify `frontend` as the Root Directory!

### Step 3: Test
1. Open your frontend URL
2. Sign up → Login
3. Upload a lab report
4. Verify C.O.D-HOMA IQ scoring works

---

## 🔒 Security Notes

⚠️ **NEVER commit these values to GitHub!**
- Database URL contains credentials
- JWT secret must remain private
- Only use in Render environment variables

✅ **Your values are safe:**
- Stored in Render environment (encrypted)
- Not visible in code or logs
- SSL/TLS enabled by default

---

## ⏱️ Time & Cost

**Time Needed:**
- Backend: ~10 minutes
- Frontend: ~10 minutes
- Testing: ~5 minutes
- **Total: ~25-30 minutes**

**Cost:**
- **FREE** (Backend sleeps after 15 min)
- Or **$7/month** (Always on, no sleep)

---

## 🆘 Troubleshooting

### Backend Won't Start
- Check Render logs (Logs tab)
- Verify DATABASE_URL is correct
- Check all 4 environment variables are set

### Frontend Can't Connect
- Verify REACT_APP_API_URL is correct
- Make sure it ends with `/api`
- Check backend is "Live" (green dot)

### Database Connection Error
- Verify connection string in Neon console
- Check SSL mode is `require`
- Test connection from Neon dashboard

---

## 📱 After Deployment

Your clinical system will be accessible at:
- **Frontend**: `https://ocr-lab-frontend.onrender.com`
- **Backend API**: `https://ocr-lab-backend.onrender.com/api`

Features ready:
- ✅ C.O.D-HOMA IQ Scoring (0-100)
- ✅ OCR for Lab Reports
- ✅ Mobile-Responsive
- ✅ Print-Ready Reports
- ✅ Dr. Nehru Branding
- ✅ User Authentication

---

## 🎯 Quick Start

**👉 Start here: https://render.com**

Keep this file open for easy copy-paste of values! 📋

---

**🏥 Dr. Muddu Surendra Nehru**  
**90-Day Diabetes/Heart Remission Program**  
**Contact: 09963721999**  
**Website: www.homahealthcarecenter.in**

