# 🧪 Testing Guide - Batch Upload & Image Preprocessing

## ✅ What to Test

### 1. **Batch Upload (18 JPG Images)**
- Upload 18 converted JPG images
- Verify no hanging
- Check partial success handling
- Verify final report is created

### 2. **Image Preprocessing (Color → Grayscale)**
- Upload color images
- Verify automatic grayscale conversion
- Check OCR accuracy improvement

### 3. **Timeout Protection**
- Verify timeouts work correctly
- Check error handling
- Verify partial results returned

---

## 🧪 Test Steps

### Test 1: Batch Upload with 18 Images

1. **Go to Dashboard**
   - Login to your app
   - Click "Batch Upload"

2. **Fill Patient Info**
   - Patient Name: `Test Patient`
   - Patient ID: `TEST001`

3. **Select 18 JPG Files**
   - Select all 18 converted JPG images
   - Click "Extract & Review"

4. **Expected Behavior:**
   - ✅ Shows progress: "Processing 1/18", "2/18", etc.
   - ✅ Each file processes with 30s timeout
   - ✅ If any file times out, it's skipped
   - ✅ Shows review form with extracted data
   - ✅ Final report created successfully

5. **Check Console Logs:**
   ```
   📤 Extracting OCR from 18 files...
   📄 Processing 1/18: image1.jpg
   🖼️ Preprocessing image for better OCR: image1.jpg
   ✅ Image preprocessed: Color → Grayscale + Enhanced
   📄 Processing 2/18: image2.jpg
   ...
   ✅ Processed: 16/18 files successfully
   ⚠️ Failed: 2 files
   ✅ Batch upload complete! Report ID: xxx
   ```

---

### Test 2: Single Color Image Upload

1. **Upload Single Color Image**
   - Go to Dashboard
   - Click "Upload Report"
   - Select a color JPG image
   - Fill patient info
   - Click "Upload & Process"

2. **Expected Behavior:**
   - ✅ Image preprocessed (color → grayscale)
   - ✅ OCR processing completes
   - ✅ Better text extraction
   - ✅ Report saved successfully

3. **Check Console:**
   ```
   🖼️ Preprocessing image for better OCR: color-image.jpg
   ✅ Image preprocessed: Color → Grayscale + Enhanced
   📝 Using Tesseract OCR...
   ✅ OCR processing complete!
   ```

---

### Test 3: Large File Handling

1. **Upload Large Image (>5MB)**
   - Select an image larger than 5MB
   - Upload it

2. **Expected Behavior:**
   - ✅ Preprocessing skipped (file too large)
   - ✅ Original image used for OCR
   - ✅ No hanging
   - ✅ Processing completes

3. **Check Console:**
   ```
   ⚠️ File too large (6.2MB), skipping preprocessing
   📝 Using Tesseract OCR...
   ```

---

### Test 4: Timeout Protection

1. **Upload Problematic File**
   - Upload a corrupted or very complex image
   - Or wait for timeout

2. **Expected Behavior:**
   - ✅ Timeout after 30 seconds per file
   - ✅ File skipped, batch continues
   - ✅ Other files still process
   - ✅ Partial results returned

---

## ✅ Success Criteria

### Batch Upload (18 Files):
- [ ] All 18 files selected successfully
- [ ] Processing starts immediately
- [ ] Progress shown for each file
- [ ] No hanging during processing
- [ ] Review form appears with extracted data
- [ ] Final report created
- [ ] Shows: "Successfully processed X out of 18 files"

### Image Preprocessing:
- [ ] Color images converted to grayscale
- [ ] Console shows preprocessing messages
- [ ] OCR accuracy improved
- [ ] No hanging on preprocessing
- [ ] Large files skipped automatically

### Error Handling:
- [ ] Failed files tracked separately
- [ ] Partial success returns results
- [ ] Timeout messages logged
- [ ] No crashes or hanging

---

## 🔍 What to Check

### In Browser Console:
- Look for preprocessing messages
- Check for timeout warnings
- Verify batch progress logs
- Check for any errors

### In Backend Logs (Render):
- Check processing logs
- Verify timeout handling
- Check error messages
- Verify database saves

### In Dashboard:
- Check report appears in list
- Verify extracted data is correct
- Check HOMA-IQ scores calculated
- Verify batch info shows correct file count

---

## 🐛 Troubleshooting

### If Batch Hangs:
1. Check backend logs for timeout messages
2. Verify file sizes (should be < 10MB each)
3. Check if preprocessing is timing out
4. Try smaller batch first (5 files)

### If No Final Report:
1. Check browser console for errors
2. Verify review form submission
3. Check backend logs for finalize endpoint
4. Verify database connection

### If Preprocessing Fails:
1. Check file format (should be JPG/PNG)
2. Verify Sharp library installed
3. Check file size (< 5MB for preprocessing)
4. Original image will be used as fallback

---

## 📊 Expected Results

### Successful Batch Upload:
```json
{
  "success": true,
  "filesProcessed": 16,
  "filesTotal": 18,
  "filesFailed": 2,
  "message": "Successfully processed 16 out of 18 files",
  "report": {
    "id": "uuid",
    "patient_name": "Test Patient",
    "status": "completed"
  }
}
```

### Preprocessing Success:
```
🖼️ Preprocessing image for better OCR: image.jpg
✅ Image preprocessed: Color → Grayscale + Enhanced
```

---

**Ready to test!** Follow the steps above and let me know the results! 🚀

