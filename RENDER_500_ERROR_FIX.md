# 🚨 RENDER 500 ERROR - FIX GUIDE

## Error Details
```
URL: ai-image-ocr-5ejd.onrender.com/api/reports/temp-1763024014775/finalize
Status: 500 Internal Server Error
Location: BatchUpload.js finalizeReport call
```

---

## 🔍 STEP 1: CHECK RENDER LOGS (MOST IMPORTANT!)

### How to Access Logs:
1. Go to **https://dashboard.render.com/**
2. Click on your **backend service** (ai-image-ocr-5ejd)
3. Click **"Logs"** tab
4. Scroll to find the `/finalize` request (look for timestamp matching your upload)
5. **COPY THE FULL ERROR MESSAGE** (including stack trace)

### What to Look For:
Look for RED error messages like:

#### Option A: Database Connection Error
```
❌ Error: Connection terminated unexpectedly
❌ Error: database "AI_OCR1" does not exist
❌ Error: relation "lab_reports" does not exist
```

#### Option B: Missing Module/Import Error
```
❌ Error: Cannot find module '../services/drNehruScoringSystem'
❌ TypeError: drNehruScoringSystem.calculateDrNehruScore is not a function
```

#### Option C: Data Parsing Error
```
❌ TypeError: Cannot read property 'fbs' of undefined
❌ Error: confirmedData is null or undefined
```

#### Option D: Database Query Error
```
❌ Error: column "extracted_data" does not exist
❌ Error: invalid input syntax for type uuid
```

---

## 🛠️ STEP 2: FIXES BASED ON ERROR TYPE

### FIX A: Database Connection Issue

**Check Environment Variables on Render:**
1. Go to backend service → **Environment** tab
2. Verify **DATABASE_URL** is set correctly:
   ```
   postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/AI_OCR1?sslmode=require
   ```
3. Click **"Save Changes"**
4. Wait for auto-redeploy

**Verify Database is Accessible:**
1. Go to Neon Console: https://console.neon.tech/
2. Click on your database **"AI_OCR1"**
3. Check if it's **Active** (not suspended)
4. Go to **SQL Editor** and run:
   ```sql
   SELECT COUNT(*) FROM lab_reports;
   ```
5. If error → database issue, run schema from `backend/config/database.sql`

### FIX B: Missing Module Issue

**Re-deploy Backend on Render:**
1. Go to backend service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait 2-3 minutes for rebuild
4. Check logs for:
   ```
   ✅ Build successful
   ✅ Server running on port 3008
   ```

### FIX C: Data Parsing Issue

**Check Frontend Request Body:**
The frontend might be sending incomplete data. Let me create a test script...

---

## 🧪 STEP 3: TEST LOCALLY FIRST

Before debugging on Render, let's test locally:

### 1. Start Local Backend
```powershell
cd backend
node app.js
```

### 2. Start Local Frontend (NEW TERMINAL)
```powershell
cd frontend
npm start
```

### 3. Test the Same Upload Flow
- Upload the same lab report
- Click "Confirm & Analyze"
- Check if it works locally
- If YES → Render environment issue
- If NO → Code issue

---

## 🔧 STEP 4: QUICK FIX - Add Error Logging

Let me add better error logging to help debug:


