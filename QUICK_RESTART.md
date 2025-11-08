# 🚀 Quick Restart Guide - Both Servers

## ✅ Step 1: Stop All Servers

**Run this command:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## ✅ Step 2: Start Backend Server

**Open Terminal 1 (New PowerShell window):**

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm start
```

**Expected Output:**
```
🚀 OCR LAB REPORT BACKEND SERVER
✅ Server running on port 3008
```

**✅ Keep this terminal open!**

---

## ✅ Step 3: Start Frontend Server

**Open Terminal 2 (New PowerShell window):**

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

**✅ Keep this terminal open!**

---

## ✅ Verify Both Running

1. **Backend:** `http://localhost:3008` → Should show API message
2. **Frontend:** `http://localhost:3000` → Should show login page

---

## 📋 Quick Copy-Paste

### Terminal 1 (Backend):
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm start
```

### Terminal 2 (Frontend):
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\frontend
npm start
```

---

**Ready to restart! Follow the steps above.** 🚀

