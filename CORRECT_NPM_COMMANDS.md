# ✅ CORRECT COMMANDS - Package.json is at ROOT Level

## ⚠️ IMPORTANT: Run Commands from ROOT Directory!

Your project uses a **monorepo structure** - `package.json` is at the **ROOT level**, not in backend folder!

---

## 🔧 CORRECT COMMANDS

### STEP 1: Go Back to ROOT Directory

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
```

**Verify:** You should see:
```
PS C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive>
```

---

### STEP 2: Start Backend Server

**From ROOT directory:**

```powershell
npm run dev
```

**This will:**
- Start backend on `http://localhost:3008`
- Use `nodemon` for auto-restart

**Expected Output:**
```
✅ Connected to Neon PostgreSQL database: AI_OCR1
🚀 Server running on http://localhost:3008
```

**Leave this terminal running!** ⚠️

---

### STEP 3: Start Frontend Server

**Open a NEW PowerShell Window:**

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm run frontend
```

**OR:**

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive\frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

**Browser opens automatically!** 🌐

---

## 🎯 ALTERNATIVE: Start Both at Once

**From ROOT directory, you can start BOTH servers together:**

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm run dev-all
```

**This starts:**
- ✅ Backend on port 3008
- ✅ Frontend on port 3000
- ✅ Both in same terminal

---

## 📋 COMPLETE COMMAND SEQUENCE

### Option 1: Separate Terminals (Recommended)

**Terminal 1 (Backend):**
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm run dev
```

**Terminal 2 (Frontend - NEW WINDOW):**
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm run frontend
```

### Option 2: Single Terminal (Both Servers)

**Terminal 1 (Both):**
```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm run dev-all
```

---

## ✅ AVAILABLE SCRIPTS (from ROOT)

From the root `package.json`, you have these commands:

```powershell
npm run dev          # Start backend only
npm run frontend     # Start frontend only
npm run dev-all      # Start BOTH backend + frontend
npm start            # Start backend (production mode)
npm run test:backend # Test database connection
```

---

## 🔍 WHY THIS HAPPENED

Your project structure is:
```
AI-Image-Organizer-For-GoogleDrive/
├── package.json          ← ROOT level (manages everything)
├── backend/              ← Backend code (no package.json here)
│   ├── app.js
│   └── ...
└── frontend/             ← Frontend code
    ├── package.json      ← Frontend has its own package.json
    └── ...
```

**Root `package.json` manages:**
- Backend dependencies
- Backend scripts
- Frontend scripts (via `npm run frontend`)

---

## 🚀 QUICK FIX

**Just run this from ROOT:**

```powershell
cd C:\Users\pc\Desktop\AI-Image-Organizer-For-GoogleDrive
npm run dev
```

**That's it!** Backend will start! ✅

---

## 📝 SUMMARY

| Location | Command | Purpose |
|----------|---------|---------|
| **ROOT** | `npm run dev` | Start backend |
| **ROOT** | `npm run frontend` | Start frontend |
| **ROOT** | `npm run dev-all` | Start both |
| **backend/** | ❌ No package.json here | Don't run npm here |

---

**Go back to ROOT and run `npm run dev`!** 🚀

