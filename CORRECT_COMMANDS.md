# 🚀 CORRECT COMMANDS - Copy & Paste These

## ⚠️ IMPORTANT: Navigate to Project Folder First!

You're currently in `C:\Windows\system32>` - you need to go to your project folder first!

---

## 📋 STEP-BY-STEP (Copy Each Command)

### STEP 1: Navigate to Project Folder

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
```

**Verify:** You should see:
```
PS C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive>
```

---

### STEP 2: Test Database Connection

```powershell
cd backend
node test-database-operations.js
```

**Expected Output:**
```
✅ Database Connected Successfully!
✅ Found 2 table(s): users, lab_reports
✅ INSERT Success!
✅ FETCH Success!
✅ ALL TESTS COMPLETED SUCCESSFULLY!
```

---

### STEP 3: Start Backend Server

**Keep Terminal 1 open, or open a NEW terminal:**

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\backend
npm run dev
```

**Wait for:**
```
✅ Connected to Neon PostgreSQL database: AI_OCR1
🚀 Server running on http://localhost:3008
```

**Leave this terminal running!**

---

### STEP 4: Start Frontend Server

**Open a NEW Terminal Window (Terminal 2):**

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\frontend
npm start
```

**Wait for:** Browser opens to `http://localhost:3000`

**Leave this terminal running!**

---

## 🎯 COMPLETE COMMAND SEQUENCE

**Copy and paste these commands ONE BY ONE:**

```powershell
# 1. Go to project folder
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive

# 2. Test database
cd backend
node test-database-operations.js

# 3. Start backend (Terminal 1)
npm run dev
```

**Then open NEW terminal for frontend:**

```powershell
# 4. Go to project folder
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive

# 5. Start frontend (Terminal 2)
cd frontend
npm start
```

---

## ✅ VERIFICATION

After running commands, you should have:

**Terminal 1 (Backend):**
```
✅ Connected to Neon PostgreSQL database: AI_OCR1
🚀 Server running on http://localhost:3008
```

**Terminal 2 (Frontend):**
```
Compiled successfully!
Local: http://localhost:3000
```

**Browser:**
- Opens automatically to `http://localhost:3000`
- Shows login/signup page

---

## 🔧 IF YOU GET ERRORS

### Error: "Cannot find module"

**Solution:** Make sure you're in the correct folder:
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\backend
```

### Error: "npm is not recognized"

**Solution:** Install Node.js from https://nodejs.org/

### Error: "Database connection failed"

**Solution:** Check `.env` file exists:
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\backend
dir .env
```

If missing, create it (already done - should exist).

---

## 📝 QUICK REFERENCE

**Always start from project folder:**
```
C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
```

**Then navigate:**
- Backend: `cd backend`
- Frontend: `cd frontend`

---

**Try again with the correct path!** 🚀

