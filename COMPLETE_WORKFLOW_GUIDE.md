# 📋 Complete Application Workflow - Step-by-Step Guide

## 🎯 Application Overview

This OCR Lab Report Web App processes medical lab reports using AI/OCR technology, extracts patient data, and calculates health risk scores with visual speedometer gauges.

---

## 🔐 STEP 1: USER AUTHENTICATION

### 1.1 Staff Sign Up
**Route:** `/signup`

**Fields Required:**
- ✅ **Email** (1 field)
- ✅ **Password** (1 field)
- ✅ **Confirm Password** (1 field)

**Process:**
1. User enters email
2. User enters password
3. User confirms password (must match)
4. System validates:
   - Email format
   - Password strength
   - Password match
5. Password is hashed with bcrypt
6. User record created in `users` table (UUID primary key)
7. User redirected to login page

**Database:** `users` table
- `id` (UUID)
- `email` (UNIQUE)
- `password_hash`
- `full_name`
- `role` (default: 'staff')
- `created_at`, `updated_at`

---

### 1.2 Staff Login
**Route:** `/login`

**Fields Required:**
- ✅ **Email** (1 field)
- ✅ **Password** (1 field)

**Process:**
1. User enters email
2. User enters password
3. System validates credentials
4. JWT token generated
5. Token stored in localStorage
6. **User redirected to Dashboard** ✅

**After Login:**
- Token stored: `localStorage.setItem('token', token)`
- User data stored: `localStorage.setItem('user', userData)`
- Redirect: `navigate('/dashboard')`

---

## 📊 STEP 2: DASHBOARD LAYOUT

**Route:** `/dashboard` (Protected - requires authentication)

### 2.1 Dashboard Header Components

**Three Main Buttons/Components:**

1. **📷 Image Upload Button**
   - Single JPG/PNG image upload
   - Click → Opens upload form

2. **📄 PDF Scanner Button**
   - PDF file upload
   - Click → Opens PDF scanner page

3. **Action Buttons:**
   - **Single Upload** - Toggle single file mode
   - **Cancel** - Cancel current operation
   - **Logout** - Sign out user

### 2.2 Dashboard Sections

**Below Header:**

1. **Review and Verify Section**
   - Shows uploaded reports pending review
   - Status: 'pending', 'processing', 'completed'

2. **Batch Upload Section**
   - Patient Name field
   - Patient ID Number field
   - Multiple files upload button
   - Supports:
     - Multiple JPG/PNG images
     - Multiple PDF files (black & white OK)
     - Color PDFs → Converted to JPG automatically

---

## 📤 STEP 3: FILE UPLOAD PROCESS

### 3.1 Single Image Upload

**Process:**
1. User clicks "Image Upload" button
2. File picker opens (accepts: JPG, PNG, GIF, WEBP)
3. User selects image file
4. File validated:
   - Type: Image file
   - Size: Max 10 MB
5. Form shows:
   - File preview
   - Patient ID (optional)
   - Patient Name (optional)
   - Report Type (optional)
6. User clicks "Upload & Process"
7. File uploaded to backend
8. OCR processing starts

### 3.2 PDF Scanner Upload

**Process:**
1. User clicks "PDF Scanner" button
2. Navigates to `/pdf-scanner` page
3. File picker opens (accepts: PDF)
4. User selects PDF file
5. File validated:
   - Type: PDF
   - Size: Max 10 MB
6. PDF processing:
   - **Black & White PDF:** Processed directly with Poppler or Gemini
   - **Color PDF:** Converted to JPG first, then processed
7. OCR extraction performed
8. Results displayed

### 3.3 Batch Upload (Multiple Files)

**Process:**
1. User clicks "Batch Upload" button
2. Batch upload form appears
3. User enters:
   - **Patient Name** (required)
   - **Patient ID Number** (required)
4. User clicks "Select Multiple Files"
5. File picker opens (multiple selection enabled)
6. User selects multiple files:
   - JPG/PNG images (any number)
   - PDF files (any number)
   - Mixed files OK
7. Files validated:
   - Each file max 10 MB
   - Total batch max 30 files
8. **PDF Processing:**
   - **Black & White PDFs:** Processed directly (Poppler/Gemini)
   - **Color PDFs:** Converted to JPG, then processed
9. User clicks "Upload Multiple Files"
10. All files uploaded simultaneously
11. OCR processing starts for all files
12. Results aggregated into single report

---

## 🔍 STEP 4: OCR PROCESSING

### 4.1 OCR Engine Selection

**Backend Processing:**

**For Images (JPG, PNG):**
- ✅ **Tesseract.js** (Free OCR)
- Extracts text from image
- Returns OCR text + confidence score

**For PDF Files:**
- ✅ **Poppler** (PDF text extraction)
- OR
- ✅ **Google Gemini API** (if configured)
- Extracts text from PDF
- For color PDFs: Convert to JPG → Tesseract

### 4.2 OCR Results Display

**Left Side Panel Shows:**
- ✅ Raw OCR text (scrollable)
- ✅ Extracted values preview
- ✅ Confidence score
- ✅ Processing status

**Data Extracted:**
- Patient name
- Patient ID
- Lab values (FBS, PLBS, HBA1C, etc.)
- Lipid profile values
- Other parameters

---

## ✏️ STEP 5: HUMAN-IN-THE-LOOP REVIEW

**After OCR Processing → Review Form Appears**

### 5.1 Patient Information Section

**Editable Fields:**
- ✅ **Patient Name** (text input)
- ✅ **Patient ID** (text input)
- ✅ **Age** (number input)
- ✅ **Sex** (dropdown: Male/Female)
- ✅ **Height** (number input, cm)
- ✅ **Weight** (number input, kg)
- ✅ **Waist Circumference** (number input, cm)

### 5.2 Lab Parameters Section

**Blood Sugar:**
- ✅ **FBS** (Fasting Blood Sugar) - number input
- ✅ **PLBS** (Post-Lunch Blood Sugar) - number input
- ✅ **HBA1C** (Hemoglobin A1C) - number input
- ✅ **Fasting Insulin** - number input

**Lipid Profile:**
- ✅ **HDL** (High-Density Lipoprotein) - number input
- ✅ **LDL** (Low-Density Lipoprotein) - number input
- ✅ **TG** (Triglycerides) - number input
- ✅ **VLDL** (Very Low-Density Lipoprotein) - number input
- ✅ **Total Cholesterol** - number input

**Other:**
- ✅ **C Peptide** - number input

### 5.3 Family History Section

**Checkboxes (5 points each if checked):**
- ☑️ **DM** (Diabetes Mellitus)
- ☑️ **HTN** (Hypertension)
- ☑️ **CAD** (Coronary Artery Disease)

### 5.4 Lifestyle Risk Factors Section

**Checkboxes (5 points each if checked):**
- ☑️ **Smoker**
- ☑️ **Alcohol**
- ☑️ **Drugs**
- ☑️ **Menopause** (for female patients)

### 5.5 Past Medical History Section

**Checkboxes (5 points each if checked):**
- ☑️ **CAD** (Coronary Artery Disease)
- ☑️ **CAG** (Coronary Angiography)
- ☑️ **CVA** (Cerebrovascular Accident/Stroke)
- ☑️ **Kidney Disease**

### 5.6 Review Actions

**Buttons:**
- ✅ **Confirm & Analyze** - Saves data and calculates scores
- ❌ **Cancel** - Discards changes

**Process:**
1. User reviews OCR extracted data
2. User fills missing fields
3. User corrects any errors
4. User checks relevant checkboxes
5. User clicks "Confirm & Analyze"
6. Data sent to backend
7. Backend calculates all scores
8. Results displayed

---

## 📊 STEP 6: SCORING & INTERPRETATION

**After "Confirm & Analyze" → Backend Calculates:**

### 6.1 C.O.D-HOMA I.Q. Score (0-100 Points)

**Calculation:**
- Waist > 85cm: **15 points**
- HOMA-IR > 2: **15 points**
- TYG Index > 4.5: **15 points**
- Lab values (FBS, PLBS, HbA1c, LDL, TC, HDL, TG): **5 points each** (if abnormal)
- Family History (DM, HTN, CAD): **5 points each**
- Past History (CAD, CAG, CVA, Kidney Disease): **5 points each**
- Lifestyle (Smoking, Alcohol, Drugs, Menopause): **5 points each**

**Risk Levels:**
- 0-30: Low Risk (Green)
- 31-60: Moderate Risk (Orange)
- 61-80: High Risk (Red)
- 81-100: Very High Risk (Dark Red)

### 6.2 Speedometer Gauges (4 Visual Indicators)

#### 1. HOMA-IR Speedometer

**Formula:** (Fasting Glucose × Fasting Insulin) / 405

**Color Zones:**
- **1-2:** 🟢 **GREEN** (Excellent)
- **2-6:** 🟠 **ORANGE** (Moderate Risk)
- **6-8:** 🟡🔴 **YELLOW RED** (Borderline High)
- **8-12:** 🟡🔴 **YELLOW DARK RED** (High Risk)
- **12-20:** 🔴🔵 **REDDISH BLUE** (Very High Risk)
- **Above 20:** 🔴 **FULL RED** (Severe Risk)

#### 2. TYG Index Speedometer

**Formula:** ln[Triglycerides (mg/dL) × Glucose (mg/dL) / 2]

**Color Zones:**
- **4.5:** 🟢 **NORMAL GREEN** (Optimal)
- **5-8:** 🟠 **ORANGE** (Moderate Risk)
- **8-10:** 🟡🔴 **YELLOW RED** (Borderline High)
- **10-14:** 🔴🟡 **REDDISH YELLOW** (High Risk)
- **Above 15:** 🔴 **RED, DARK RED** (Very High Risk)

#### 3. BMI Speedometer

**Formula:** Weight (kg) / [Height (m)]²

**Color Zones:** (Same as HOMA-IR)
- **<18.5:** 🟢 **GREEN** (Underweight)
- **18.5-25:** 🟢 **GREEN** (Normal)
- **25-30:** 🟠 **ORANGE** (Overweight)
- **30-35:** 🟡🔴 **YELLOW RED** (Obese Class I)
- **35-40:** 🟡🔴 **YELLOW DARK RED** (Obese Class II)
- **40-50:** 🔴🔵 **REDDISH BLUE** (Obese Class III)
- **>50:** 🔴 **FULL RED** (Severe Obesity)

#### 4. Waist Circumference Speedometer

**Measurement:** Centimeters

**Color Zones:**
- **85 cm:** 🟢 **GREEN** (Normal)
- **85-90 cm:** 🔵 **BLUE** (Borderline)
- **90-95 cm:** 🟡🔴 **YELLOW RED** (Moderate Risk)
- **95-100 cm:** 🟠🔴 **ORANGE RED** (High Risk)
- **100-110 cm:** 🔴🟡 **REDDISH YELLOW** (Very High Risk)
- **110-120 cm:** 🔴 **RED** (Severe Risk)
- **Above 120 cm:** 🔴 **DARK RED** (Extreme Risk)

---

## 📱 STEP 7: RESULTS DISPLAY

### 7.1 Dashboard View

**After Analysis Complete:**
1. Report appears in dashboard list
2. Status: "completed"
3. Shows:
   - Patient name
   - Patient ID
   - Upload date
   - C.O.D-HOMA I.Q. Score
   - Risk level badge

### 7.2 Report Details Modal

**Click Report → Opens Modal with:**

**Page 1: Speedometer Gauges**
- 4 circular speedometer gauges displayed
- Each shows:
  - Current value
  - Color-coded zone
  - Risk status
  - Interpretation text

**Page 2: Detailed Report**
- All lab values
- Patient information
- Family history
- Past medical history
- Lifestyle factors
- Full C.O.D-HOMA I.Q. Score breakdown
- Recommendations

### 7.3 Print Report

**Button:** "Print Report"
- Generates printable PDF
- Includes all data
- Formatted for medical records

---

## 🔄 COMPLETE WORKFLOW SUMMARY

```
1. SIGN UP
   └─> Email + Password + Confirm Password
   └─> User Created (UUID)

2. LOGIN
   └─> Email + Password
   └─> JWT Token Generated
   └─> Redirect to Dashboard

3. DASHBOARD
   └─> 3 Buttons: Image Upload | PDF Scanner | Batch Upload
   └─> Review & Verify Section
   └─> Logout Button

4. UPLOAD
   └─> Single Image: JPG/PNG → Tesseract OCR
   └─> PDF: Black/White → Poppler/Gemini
   └─> PDF Color → Convert to JPG → Tesseract
   └─> Batch: Multiple files → Aggregate OCR

5. OCR PROCESSING
   └─> Text Extraction
   └─> Data Extraction
   └─> Results Displayed (Left Side)

6. HUMAN REVIEW
   └─> Patient Info: Name, ID, Age, Sex, Height, Weight, Waist
   └─> Lab Parameters: FBS, PLBS, HBA1C, Insulin, Lipid Profile, C Peptide
   └─> Family History: DM, HTN, CAD
   └─> Lifestyle: Smoker, Alcohol, Drugs, Menopause
   └─> Past History: CAD, CAG, CVA, Kidney Disease
   └─> Confirm & Analyze

7. SCORING
   └─> C.O.D-HOMA I.Q. Score (0-100)
   └─> HOMA-IR Speedometer
   └─> TYG Index Speedometer
   └─> BMI Speedometer
   └─> Waist Circumference Speedometer

8. RESULTS
   └─> Dashboard List
   └─> Report Modal (Speedometers + Details)
   └─> Print Report
```

---

## ✅ VERIFICATION CHECKLIST

### Authentication
- [x] Sign up: Email, Password, Confirm Password
- [x] Login: Email, Password
- [x] Redirect to Dashboard after login
- [x] JWT token stored
- [x] Logout functionality

### Dashboard Components
- [x] Image Upload button
- [x] PDF Scanner button
- [x] Batch Upload button
- [x] Single/Cancel/Logout buttons
- [x] Review & Verify section

### Upload Functionality
- [x] Single image upload (JPG/PNG)
- [x] PDF upload (black & white OK)
- [x] Color PDF → JPG conversion
- [x] Batch upload (multiple files)
- [x] Patient Name + ID fields

### OCR Processing
- [x] Tesseract for images
- [x] Poppler/Gemini for PDFs
- [x] Color PDF conversion
- [x] Results displayed left side

### Human Review Form
- [x] Patient Info (Name, ID, Age, Sex, Height, Weight, Waist)
- [x] Lab Parameters (FBS, PLBS, HBA1C, Insulin, HDL, LDL, TG, VLDL, Total Cholesterol, C Peptide)
- [x] Family History (DM, HTN, CAD)
- [x] Lifestyle (Smoker, Alcohol, Drugs, Menopause)
- [x] Past History (CAD, CAG, CVA, Kidney Disease)
- [x] Confirm & Analyze button

### Scoring System
- [x] C.O.D-HOMA I.Q. Score calculation
- [x] HOMA-IR speedometer (correct color zones)
- [x] TYG Index speedometer (correct color zones)
- [x] BMI speedometer (correct color zones)
- [x] Waist Circumference speedometer (correct color zones)

---

## 📝 NOTES

- **Database:** All data stored in `lab_reports` table
- **Primary Keys:** UUID (not integer)
- **OCR Text:** Stored in `ocr_text` column
- **Extracted Data:** Stored in `extracted_data` JSONB column
- **User Isolation:** Each user sees only their reports
- **File Storage:** Uploaded files stored in `/uploads` directory

---

**This workflow ensures complete data flow from upload → OCR → Review → Scoring → Display!** ✅

