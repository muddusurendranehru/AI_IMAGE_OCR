# 🔧 How to Fix Mixed Patient Data

## Your Current Problem:

You have **2 PDFs selected**:
1. `indraneel3.pdf` (137.6 KB)
2. `INDRANEEL2....pdf` (2.1 MB)

If these contain **different patients' data**, they will be **MIXED TOGETHER** when you click "Extract & Review"!

---

## ✅ Solution 1: Remove Wrong Files (RECOMMENDED)

### Step-by-step:

1. **Look at your selected files** in the batch upload screen
2. **Click the ❌ button** on files that don't belong to the SAME patient
3. **Keep only ONE patient's files**
4. Click "Extract & Review"

### Example:

If `indraneel3.pdf` is for Indraneel and `INDRANEEL2.pdf` is for Sambashivareddy:
- ❌ Click X to remove `INDRANEEL2.pdf`
- ✅ Keep only `indraneel3.pdf`
- Click "Extract & Review" for Indraneel
- Then upload Sambashivareddy's files separately

---

## ✅ Solution 2: Upload Each Patient Separately

### For Sambashivareddy:
1. Click "Cancel" on current upload
2. Click "Batch Upload" again
3. Enter Patient Name: **Sambashivareddy**
4. Enter Patient ID: **SB001** (or his ID)
5. Upload **ONLY Sambashivareddy's PDFs**
6. Click "Extract & Review"
7. Confirm and Analyze

### For Indraneel:
1. Click "Batch Upload" again (fresh upload)
2. Enter Patient Name: **Indraneel**
3. Enter Patient ID: **IN001** (or his ID)
4. Upload **ONLY Indraneel's PDFs**
5. Click "Extract & Review"
6. Confirm and Analyze

---

## ✅ Solution 3: Delete Old Mixed Reports

If you already uploaded mixed data:

### Option A: Delete from Dashboard
1. Go to **Dashboard**
2. Find the **mixed report** (shows both names)
3. Click **"Delete"** button
4. Upload correctly

### Option B: Clear Database (Nuclear option)
```bash
# In your backend folder
cd backend
node
```

Then run this in Node.js console:
```javascript
const db = require('./config/db');
db.query('DELETE FROM lab_reports WHERE patient_name LIKE \'%both%\' OR ocr_text LIKE \'%Sambashivareddy%Indraneel%\'').then(() => console.log('Deleted')).then(() => process.exit());
```

---

## 🎯 CORRECT Workflow for Batch Upload:

### ✅ CORRECT: Multiple files, ONE patient
```
Batch Upload
├─ Patient: Sambashivareddy
├─ ID: SB001
└─ Files:
   ├─ sambashiva_lipid.pdf (Lipid Profile)
   ├─ sambashiva_glucose.pdf (Blood Sugar)
   └─ sambashiva_insulin.pdf (Insulin)

Result: ONE report with all data for Sambashivareddy ✅
```

### ❌ WRONG: Multiple files, DIFFERENT patients
```
Batch Upload
├─ Patient: ???
├─ ID: ???
└─ Files:
   ├─ indraneel3.pdf (Indraneel's data)
   └─ sambashiva.pdf (Sambashivareddy's data)

Result: MIXED DATA! Both patients jumbled together ❌
```

---

## 📊 When to Use Each Upload Method:

### Use **Batch Upload** when:
- ✅ ONE patient has multiple lab reports (Lipid, Glucose, CBC, etc.)
- ✅ Multi-page PDF for ONE patient
- ✅ Example: 3 separate test reports for Sambashivareddy

### Use **Single Upload** when:
- ✅ ONE patient, ONE file only
- ✅ Complete lab report in one PDF/image
- ✅ Quick upload for individual tests

---

## 🔍 How to Check if Data is Mixed:

After clicking "Extract & Review", look at the extracted data:
- ❌ If you see BOTH "Sambashivareddy" AND "Indraneel" names → **MIXED!**
- ❌ If glucose=100 but patient name is wrong → **MIXED!**
- ✅ If all data matches ONE patient → **CORRECT!**

---

## 🚨 REMEMBER:

**Batch Upload = ONE Patient, Multiple Files**

NOT

**Batch Upload = Multiple Patients**

For multiple patients, upload each one separately!

---

## Need Help?

1. Refresh the page: `Ctrl + Shift + R`
2. Check the warning message on the upload screen
3. Upload files one patient at a time
4. Verify the extracted data before clicking "Confirm"

---

**The system is working correctly!** The issue is selecting wrong files together. 
Just remove the wrong files using the ❌ button before clicking "Extract & Review"! 🎯

