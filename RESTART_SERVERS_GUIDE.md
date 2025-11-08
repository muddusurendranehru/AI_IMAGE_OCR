# 🚀 Correct Steps to Restart Both Servers

## ✅ IMPORTANT: Project Structure

- `package.json` is in **ROOT** directory (not in backend/)
- Backend `.env` should be in **ROOT** directory (or backend/)
- Frontend `.env` should be in **frontend/** directory

---

## Step 1: Stop All Running Servers

```powershell
# Stop all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Step 2: Start Backend Server

**Open Terminal 1:**

```powershell
# Navigate to ROOT directory (NOT backend/)
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive

# Check if .env exists in root
dir .env

# If .env doesn't exist, you need to create it with your DATABASE_URL
# (Get DATABASE_URL from Render dashboard or Neon)

# Start backend server (runs from root, but starts backend/app.js)
npm start
```

**Expected Output:**
```
🔌 Testing database connection in background...
🚀 OCR LAB REPORT BACKEND SERVER
==================================================
✅ Server running on port 3008
```

**Keep this terminal open!**

---

## Step 3: Start Frontend Server

**Open Terminal 2 (NEW WINDOW):**

```powershell
# Navigate to ROOT directory first
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive

# Then go to frontend
cd frontend

# Check if .env exists
dir .env

# If .env doesn't exist, create it:
echo REACT_APP_API_URL=http://localhost:3008/api > .env

# Start frontend server
npm start
```

**Expected Output:**
```
Compiling...
Compiled successfully!

You can now view ocr-lab-report-frontend in the browser.

  Local:            http://localhost:3000
```

**Keep this terminal open!**

---

## ✅ Quick Copy-Paste Commands

### Terminal 1 (Backend - from ROOT):
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm start
```

### Terminal 2 (Frontend - from frontend folder):
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\frontend
npm start
```

---

## 🔧 If Backend .env is Missing

Create `.env` file in **ROOT** directory:

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive

# Create .env file (replace with your actual values)
@"
DATABASE_URL=your_neon_connection_string_here
JWT_SECRET=your_secret_key_here
PORT=3008
NODE_ENV=development
USE_TESSERACT=true
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
```

---

## ✅ Verify Servers Running

1. **Backend**: Open `http://localhost:3008`
   - Should see: `{"success":true,"message":"🔬 OCR Lab Report API is running!"}`

2. **Frontend**: Open `http://localhost:3000`
   - Should see: Login page

---

## 📝 Summary

**Backend:**
- Run from: `ROOT` directory
- Command: `npm start`
- Port: `3008`

**Frontend:**
- Run from: `frontend` directory  
- Command: `npm start`
- Port: `3000`

**Key Point:** Backend runs from ROOT, not from backend/ folder!

