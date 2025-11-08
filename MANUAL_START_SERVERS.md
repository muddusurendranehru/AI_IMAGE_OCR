# 🚀 Manual Steps to Start Both Servers

## ✅ Step-by-Step Instructions

### **Step 1: Stop Any Running Servers**

**Open PowerShell/Command Prompt and run:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Or manually:**
- Press `Ctrl + C` in any terminal windows running Node
- Close terminal windows if needed

---

### **Step 2: Start Backend Server**

**Open Terminal 1 (New PowerShell/Command Prompt window):**

```powershell
# Navigate to project ROOT directory
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive

# Check if you're in the right directory (should see package.json)
dir package.json

# Start backend server
npm start
```

**Expected Output:**
```
🔌 Testing database connection in background...
🚀 OCR LAB REPORT BACKEND SERVER
==================================================
✅ Server running on port 3008
✅ Environment: development
✅ OCR Method: Tesseract (Local)
```

**✅ Keep this terminal window open!**

---

### **Step 3: Start Frontend Server**

**Open Terminal 2 (NEW PowerShell/Command Prompt window):**

```powershell
# Navigate to frontend directory
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\frontend

# Check if you're in the right directory (should see package.json)
dir package.json

# Start frontend server
npm start
```

**Expected Output:**
```
Compiling...
Compiled successfully!

You can now view ocr-lab-report-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**✅ Keep this terminal window open!**

---

## ✅ Verify Both Servers Are Running

### **Backend Check:**
1. Open browser: `http://localhost:3008`
2. Should see: `{"success":true,"message":"🔬 OCR Lab Report API is running!"}`

### **Frontend Check:**
1. Open browser: `http://localhost:3000`
2. Should see: Login page

---

## 📋 Quick Copy-Paste Commands

### **Terminal 1 (Backend):**
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm start
```

### **Terminal 2 (Frontend):**
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\frontend
npm start
```

---

## ⚠️ Troubleshooting

### **Backend Won't Start?**
- Check if port 3008 is in use: `netstat -ano | findstr :3008`
- Check if `.env` file exists in ROOT directory
- Verify `DATABASE_URL` is set correctly

### **Frontend Won't Start?**
- Check if port 3000 is in use: `netstat -ano | findstr :3000`
- Check if `.env` file exists in `frontend` directory
- Verify `REACT_APP_API_URL=http://localhost:3008/api` is set

### **Both Servers Running?**
- ✅ Backend: `http://localhost:3008` shows API message
- ✅ Frontend: `http://localhost:3000` shows login page
- ✅ Both terminals showing no errors

---

## 🎯 Summary

1. **Stop all Node processes** (if any running)
2. **Terminal 1:** `cd ROOT` → `npm start` (Backend on port 3008)
3. **Terminal 2:** `cd frontend` → `npm start` (Frontend on port 3000)
4. **Verify:** Both URLs work in browser
5. **Ready to test!** Upload lab reports and verify all 4 health metrics display

---

**Important:** 
- Backend runs from **ROOT** directory (not `backend/` folder)
- Frontend runs from **`frontend/`** directory
- Keep both terminal windows open while testing

