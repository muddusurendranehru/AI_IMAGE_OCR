# ⚡ Quick Start - OCR Lab Report Web App

## 🚀 Get Running in 5 Minutes!

### Step 1: Install Dependencies (2 minutes)

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Setup Environment Variables (1 minute)

**Create `.env` in root directory:**
```bash
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_strong_secret_key_here
PORT=3008
NODE_ENV=development
USE_TESSERACT=true
FRONTEND_URL=http://localhost:3000
```

**Create `frontend/.env`:**
```bash
REACT_APP_API_URL=http://localhost:3008/api
```

### Step 3: Setup Database (1 minute)

```bash
# Run the SQL schema on your Neon database
psql "YOUR_NEON_CONNECTION_STRING" -f backend/config/database.sql
```

### Step 4: Start Application (30 seconds)

**Option A: Start Both (Backend + Frontend)**
```bash
npm run dev-all
```

**Option B: Start Separately**

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

### Step 5: Open & Test (30 seconds)

1. Open browser: `http://localhost:3000`
2. Click "Sign Up"
3. Create account
4. Upload a lab report image
5. See OCR magic! ✨

---

## 🎯 That's It!

You're now running the OCR Lab Report Web App locally!

### What to do next?

- 📖 Read [README.md](README.md) for full documentation
- 🧪 Follow [TESTING_GUIDE.md](TESTING_GUIDE.md) to test all features
- 🚀 Deploy to production with [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🆘 Common Issues

**"Database connection failed"**
- Check your DATABASE_URL
- Ensure Neon database is active
- Run the SQL schema

**"Port 3008 already in use"**
```bash
# Change PORT in .env to 3009 or any available port
```

**"Module not found"**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📞 Need Help?

See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for detailed setup guide.

