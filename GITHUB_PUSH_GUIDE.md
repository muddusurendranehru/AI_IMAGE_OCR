# 📦 GitHub Push Guide - C.O.D-HOMA IQ System

## ✅ Before Pushing

**Confirmed Working:**
- ✅ C.O.D-HOMA IQ Scoring (70/100 for indtotalscore15)
- ✅ Frontend form with family/past/lifestyle fields
- ✅ Backend integration complete
- ✅ Dr. Nehru branding + contact info
- ✅ Decimal fix (16.86, 5.14)
- ✅ Database (JSONB, no schema changes)

---

## 📋 Step-by-Step GitHub Push

### 1. Initialize Git (if not already done)

```bash
cd C:\Users\MYPC\AI_IMAGE_OCR
git init
```

### 2. Create .gitignore

```bash
# Create .gitignore to exclude sensitive files
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "backend/.env" >> .gitignore
echo "frontend/.env" >> .gitignore
echo "uploads/" >> .gitignore
echo "*.log" >> .gitignore
echo ".DS_Store" >> .gitignore
```

### 3. Stage All Files

```bash
git add .
```

### 4. Commit Changes

```bash
git commit -m "Complete C.O.D-HOMA IQ System with Family/Past/Lifestyle Risk Factors

Features:
- C.O.D-HOMA I.Q. SCORE (0-100 points) scoring system
- Family history assessment (DM, HTM, CAD)
- Past medical history (CAD, CVA, Cancer, PTCA)
- Lifestyle risk factors (Smoking, Alcohol, Pan, Drugs)
- Dr. Muddu Surendra Nehru branding and contact info
- 90-day Diabetes/Heart Remission Program integration
- OCR decimal point auto-fix (insulin, c-peptide)
- Multi-page PDF support with pdf-poppler
- User data isolation
- Mobile-responsive UI
- Health metrics dashboard (HOMA-IR, TYG, BMI)

Technical:
- Backend: Node.js + Express + PostgreSQL (Neon)
- Frontend: React + Axios
- OCR: Tesseract + Google Vision API + pdf-parse
- Database: JSONB for flexible data storage
"
```

### 5. Create GitHub Repository

**Option A: Via GitHub Website**
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `AI_IMAGE_OCR` or `COD-HOMA-IQ-System`
4. Description: "C.O.D-HOMA IQ Score - Lab Report OCR System with Metabolic Risk Assessment"
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

**Option B: Via GitHub CLI**
```bash
gh repo create AI_IMAGE_OCR --public --description "C.O.D-HOMA IQ Score System"
```

### 6. Add Remote and Push

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/AI_IMAGE_OCR.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 🔐 Environment Variables (IMPORTANT!)

**DO NOT push `.env` file to GitHub!**

Your `.env` file contains sensitive data:
- DATABASE_URL (Neon PostgreSQL connection string)
- API keys
- Secrets

**For deployment**, create `.env.example`:

```bash
# Create example file (without actual values)
echo "DATABASE_URL=your_neon_database_url_here" > .env.example
echo "PORT=3008" >> .env.example
echo "GOOGLE_VISION_API_KEY=your_api_key_here" >> .env.example
git add .env.example
git commit -m "Add environment variables template"
git push
```

---

## 📂 Repository Structure

```
AI_IMAGE_OCR/
├── backend/
│   ├── app.js                              # Main Express server
│   ├── controllers/
│   │   └── labReportController.js          # Report logic + C.O.D-HOMA IQ integration
│   ├── services/
│   │   ├── drNehruScoringSystem.js         # ⭐ NEW scoring system
│   │   ├── ocrService.js                   # OCR + decimal fix
│   │   ├── healthMetricsService.js         # HOMA-IR, TYG, BMI
│   │   └── homaIqService.js                # Old HOMA-IQ (backup)
│   ├── routes/
│   │   └── labReportRoutes.js
│   ├── config/
│   │   └── database.sql                    # Schema
│   ├── package.json
│   └── .env (NOT PUSHED!)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LabDataReviewForm.js        # ⭐ NEW form with family/past/lifestyle
│   │   │   └── BatchUpload.js
│   │   ├── pages/
│   │   │   └── Dashboard.js                # ⭐ Updated to show NEW score
│   │   └── services/
│   │       └── api.js                      # API calls
│   ├── package.json
│   └── .env (NOT PUSHED!)
├── .gitignore                              # ⭐ IMPORTANT!
├── README.md
├── COMPLETE_SYSTEM_TEST_RESULTS.md
├── DR_NEHRU_SCORING_SYSTEM.md
├── GITHUB_PUSH_GUIDE.md                    # This file
└── SQL_VERIFY_NEW_ENTRY.sql

⚠️ NOT IN GIT:
├── node_modules/                           # Excluded
├── backend/.env                            # Excluded (sensitive!)
├── frontend/.env                           # Excluded (sensitive!)
└── uploads/                                # Excluded (user files)
```

---

## 📝 README.md Content

Create a comprehensive README:

```markdown
# C.O.D-HOMA I.Q. SCORE SYSTEM

**Cardio Obesity Diabetes - HOMA Intelligence Quotient**

AI-powered lab report OCR system with advanced metabolic risk assessment.

## 🏥 Devised By

**Dr. Muddu Surendra Nehru, MD**  
Founder & Professor of Medicine, Metabolism Specialist

📞 **Phone:** 09963721999  
🌐 **Website:** www.homahealthcarecenter.in

## 🎯 Features

### C.O.D-HOMA IQ Scoring (0-100 Points)
- **Major Factors (15 points each):**
  - Waist Circumference > 85 cm
  - HOMA-IR > 2.0 (Insulin Resistance)
  - TYG Index > 4.5 (Triglyceride-Glucose)

- **Lab Values (5 points each):**
  - BMI, FBS, PLBS, HbA1c
  - LDL, Total Cholesterol, HDL, Triglycerides

- **Risk Factors (5 points each):**
  - Family History (DM, HTM, CAD)
  - Past Medical History (CAD, CVA, Cancer, PTCA)
  - Lifestyle (Smoking, Alcohol, Pan, Drugs)

### Risk Categories
- 🟢 0-29: Low Risk
- 🟠 30-59: Moderate Risk  
- 🔴 60-79: High Risk
- 🔴🔴 80-100: Very High Risk

### Technical Features
- Multi-page PDF OCR (pdf-poppler + Tesseract)
- Auto decimal fix for lab values
- User data isolation
- Mobile-responsive UI
- Health metrics dashboard
- PostgreSQL (Neon) with JSONB storage

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL (Neon)
- Tesseract OCR
- pdf-poppler

### Installation

\`\`\`bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/AI_IMAGE_OCR.git
cd AI_IMAGE_OCR

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials
\`\`\`

### Run

\`\`\`bash
# Terminal 1: Backend
cd backend
node app.js

# Terminal 2: Frontend
cd frontend
npm start
\`\`\`

**Open:** http://localhost:3000

## 📊 Database Schema

Table: `lab_reports`
- `extracted_data` (JSONB) stores all scoring data
- No schema migration needed for new fields
- Backwards compatible with old reports

## 📞 Contact

**90 DAY DIABETES/HEART REMISSION PROGRAM**

Dr. Muddu Surendra Nehru, MD  
📞 09963721999  
🌐 www.homahealthcarecenter.in

## 📄 License

Proprietary - Copyright © 2025 Dr. Muddu Surendra Nehru
```

---

## ⚠️ IMPORTANT CHECKS BEFORE PUSHING

- [ ] `.gitignore` includes `.env`, `node_modules/`, `uploads/`
- [ ] No `.env` files in staging area (`git status`)
- [ ] No sensitive data (passwords, API keys) in code
- [ ] README.md is comprehensive
- [ ] All tests passed
- [ ] Servers can restart successfully

---

## 🔄 Future Updates

After pushing, for future changes:

```bash
# 1. Make changes
# 2. Check status
git status

# 3. Stage changes
git add .

# 4. Commit with message
git commit -m "Description of changes"

# 5. Push
git push
```

---

## 🌐 Deploy to Render

See `GITHUB_RENDER_DEPLOYMENT.md` for deployment instructions.

---

**✅ READY TO PUSH TO GITHUB!**

