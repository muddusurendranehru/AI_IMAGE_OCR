# 🔧 Neon Database Rebuild Guide

## 📋 Situation
Your Neon PostgreSQL database was deleted when you removed your Vercel team. All your code is safe locally and on GitHub, but the database needs to be rebuilt.

## ✅ What We Have
- ✅ All code files (backend, frontend)
- ✅ Database schema (`backend/config/database.sql`)
- ✅ Neon connection string: `postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/AI_OCR1?sslmode=require&channel_binding=require`
- ✅ Database name: `AI_OCR1`
- ✅ Neon project: `proud-sunset-82737074`

## 🎯 What We Need to Do

### Step 1: Create .env File
Create `backend/.env` file with your Neon connection string:

```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Or manually create `backend/.env`:
```env
DATABASE_URL=postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/AI_OCR1?sslmode=require&channel_binding=require
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
PORT=3008
NODE_ENV=development
USE_TESSERACT=true
FRONTEND_URL=http://localhost:3000
```

### Step 2: Run Database Rebuild Script
```bash
node backend/rebuild-database.js
```

This script will:
1. ✅ Connect to Neon PostgreSQL (AI_OCR1)
2. ✅ Drop existing tables (if any)
3. ✅ Create `users` table (UUID primary key)
4. ✅ Create `lab_reports` table (UUID primary key)
5. ✅ Create indexes for performance
6. ✅ Create views for easy data display
7. ✅ Test data insertion
8. ✅ Verify everything works

### Step 3: Verify Database Connection
```bash
node backend/test-db.js
```

Or start your backend:
```bash
npm run dev
```

## 📊 Database Schema

### Table 1: `users`
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `full_name` (VARCHAR)
- `role` (VARCHAR, Default: 'staff')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Table 2: `lab_reports`
- `id` (UUID, Primary Key)
- `patient_id` (VARCHAR)
- `patient_name` (VARCHAR)
- `report_type` (VARCHAR)
- `image_path` (VARCHAR)
- `ocr_text` (TEXT)
- `extracted_data` (JSONB) - Stores all OCR extracted data
- `status` (VARCHAR, Default: 'pending')
- `uploaded_by` (UUID, Foreign Key → users.id)
- `uploaded_at` (TIMESTAMP)
- `processed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## ⚠️ Pain Points & Solutions

### Pain Point 1: Database Deleted
**Problem:** Neon database was deleted when Vercel team was removed  
**Solution:** ✅ Rebuild script recreates everything automatically

### Pain Point 2: Connection String
**Problem:** Need to ensure connection string is correct  
**Solution:** ✅ Provided connection string is already configured

### Pain Point 3: Data Loss
**Problem:** All previous data is lost  
**Solution:** ⚠️ Cannot recover deleted data, but schema rebuilds perfectly

### Pain Point 4: Environment Variables
**Problem:** .env file might be missing  
**Solution:** ✅ Created .env.example, will create .env automatically

## 🧪 Testing Checklist

After rebuild, test:

1. ✅ Database connection works
2. ✅ Tables exist (`users`, `lab_reports`)
3. ✅ Can insert user (signup works)
4. ✅ Can login (authentication works)
5. ✅ Can upload lab report
6. ✅ Can fetch lab reports
7. ✅ UUID primary keys work correctly

## 🚀 Quick Start Commands

```bash
# 1. Create .env file
cp backend/.env.example backend/.env

# 2. Rebuild database
node backend/rebuild-database.js

# 3. Test connection
node backend/test-db.js

# 4. Start backend
npm run dev

# 5. Start frontend (in another terminal)
cd frontend && npm start
```

## 📝 Notes

- **Database Name:** `AI_OCR1` (from your connection string)
- **All tables use UUID:** No integer IDs, everything uses UUID
- **Foreign Key:** `lab_reports.uploaded_by` → `users.id`
- **JSONB Storage:** All OCR extracted data goes in `extracted_data` JSONB column

## ✅ Success Criteria

You'll know it's working when:
1. ✅ Rebuild script completes without errors
2. ✅ Backend starts and connects to database
3. ✅ You can sign up a new user
4. ✅ You can login
5. ✅ You can upload and process lab reports

---

**Ready to rebuild? Run:** `node backend/rebuild-database.js` 🚀

