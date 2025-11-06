# 🧪 Testing Guide - OCR Lab Report Web App

Complete testing guide for backend and frontend functionality.

## Table of Contents
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Integration Testing](#integration-testing)
- [Manual Testing Checklist](#manual-testing-checklist)

---

## 🔧 Backend Testing

### Prerequisites
- Backend server running on `http://localhost:3008`
- Neon PostgreSQL database connected
- Postman or cURL installed

### Test 1: Health Check

**Endpoint**: `GET /`

```bash
curl http://localhost:3008/
```

**Expected Response**:
```json
{
  "success": true,
  "message": "🔬 OCR Lab Report API is running!",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "reports": "/api/reports"
  }
}
```

### Test 2: Database Status

**Endpoint**: `GET /api/status`

```bash
curl http://localhost:3008/api/status
```

**Expected Response**:
```json
{
  "success": true,
  "database": {
    "connected": true,
    "name": "AI_OCR",
    "tables": {
      "users": 0,
      "lab_reports": 0
    }
  },
  "server": {
    "port": 3008,
    "environment": "development",
    "ocrMethod": "Tesseract"
  }
}
```

### Test 3: User Signup

**Endpoint**: `POST /api/auth/signup`

```bash
curl -X POST http://localhost:3008/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "fullName": "Dr. John Doe"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User registered successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "doctor@hospital.com",
    "fullName": "Dr. John Doe",
    "role": "staff",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Test Edge Cases**:
```bash
# Test duplicate email
curl -X POST http://localhost:3008/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "doctor@hospital.com", "password": "Test123!", "confirmPassword": "Test123!"}'
# Expected: 409 error - User already exists

# Test password mismatch
curl -X POST http://localhost:3008/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "new@test.com", "password": "Test123!", "confirmPassword": "Different123!"}'
# Expected: 400 error - Passwords do not match

# Test weak password
curl -X POST http://localhost:3008/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "new@test.com", "password": "123", "confirmPassword": "123"}'
# Expected: 400 error - Password must be at least 6 characters
```

### Test 4: User Login

**Endpoint**: `POST /api/auth/login`

```bash
curl -X POST http://localhost:3008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "Test123!"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "doctor@hospital.com",
    "fullName": "Dr. John Doe",
    "role": "staff"
  }
}
```

**Save the token** for subsequent tests!

**Test Edge Cases**:
```bash
# Test wrong password
curl -X POST http://localhost:3008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "doctor@hospital.com", "password": "WrongPassword"}'
# Expected: 401 error - Invalid email or password

# Test non-existent user
curl -X POST http://localhost:3008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@test.com", "password": "Test123!"}'
# Expected: 401 error - Invalid email or password
```

### Test 5: Get Current User

**Endpoint**: `GET /api/auth/me`

```bash
# Replace YOUR_TOKEN with the token from login
curl http://localhost:3008/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "doctor@hospital.com",
    "fullName": "Dr. John Doe",
    "role": "staff",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Test 6: Upload Lab Report

**Endpoint**: `POST /api/reports/upload`

```bash
# Create a test image or use existing one
# Replace path/to/image.jpg with actual image path

curl -X POST http://localhost:3008/api/reports/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@path/to/lab-report.jpg" \
  -F "patientId=P001" \
  -F "patientName=John Doe" \
  -F "reportType=Blood Test"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Lab report uploaded and processed successfully!",
  "report": {
    "id": "uuid-here",
    "patientId": "P001",
    "patientName": "John Doe",
    "reportType": "Blood Test",
    "ocrText": "Extracted text from image...",
    "extractedData": { ... },
    "status": "completed",
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "processedAt": "2024-01-01T00:00:01.000Z"
  },
  "ocrConfidence": 85,
  "validation": {
    "isValid": true,
    "confidence": 75,
    "foundKeywords": ["laboratory", "test", "patient", "blood"]
  }
}
```

**Test Edge Cases**:
```bash
# Test without token
curl -X POST http://localhost:3008/api/reports/upload \
  -F "image=@path/to/image.jpg"
# Expected: 401 error - Access denied

# Test without image
curl -X POST http://localhost:3008/api/reports/upload \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: 400 error - No file uploaded

# Test with non-image file
curl -X POST http://localhost:3008/api/reports/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@path/to/document.pdf"
# Expected: 400 error - Only image files allowed
```

### Test 7: Get All Reports

**Endpoint**: `GET /api/reports`

```bash
curl http://localhost:3008/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "reports": [
    {
      "id": "uuid",
      "patient_id": "P001",
      "patient_name": "John Doe",
      "report_type": "Blood Test",
      "ocr_text": "...",
      "status": "completed",
      "uploaded_at": "2024-01-01T00:00:00.000Z",
      "uploaded_by_email": "doctor@hospital.com"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalReports": 1,
    "limit": 20
  }
}
```

### Test 8: Get Report by ID

**Endpoint**: `GET /api/reports/:id`

```bash
# Replace REPORT_ID with actual report ID
curl http://localhost:3008/api/reports/REPORT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 9: Search Reports

**Endpoint**: `GET /api/reports/search?query=searchterm`

```bash
curl "http://localhost:3008/api/reports/search?query=P001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 10: Delete Report

**Endpoint**: `DELETE /api/reports/:id`

```bash
# Replace REPORT_ID with actual report ID
curl -X DELETE http://localhost:3008/api/reports/REPORT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Lab report deleted successfully!"
}
```

### Test 11: Logout

**Endpoint**: `POST /api/auth/logout`

```bash
curl -X POST http://localhost:3008/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Logout successful!"
}
```

---

## 🎨 Frontend Testing

### Prerequisites
- Frontend running on `http://localhost:3000`
- Backend running and tested
- Modern browser (Chrome, Firefox, Safari, Edge)

### Test 1: Sign Up Flow

1. Navigate to `http://localhost:3000/signup`
2. Fill in form:
   - Email: `testuser@hospital.com`
   - Full Name: `Test User`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
3. Click "Sign Up"
4. **Expected**: Redirect to Dashboard
5. **Verify**: User info displayed in header

### Test 2: Login Flow

1. Logout from dashboard
2. Navigate to `http://localhost:3000/login`
3. Fill in form:
   - Email: `testuser@hospital.com`
   - Password: `Test123!`
4. Click "Login"
5. **Expected**: Redirect to Dashboard
6. **Verify**: User info displayed

### Test 3: Protected Route

1. Open new incognito/private window
2. Navigate directly to `http://localhost:3000/dashboard`
3. **Expected**: Redirect to Login page

### Test 4: Upload Lab Report

1. Login to dashboard
2. Click "Upload Report" button
3. Upload form should appear
4. Select an image file (lab report)
5. Fill optional fields:
   - Patient ID: `P001`
   - Patient Name: `John Doe`
   - Report Type: `Blood Test`
6. Click "Upload & Process"
7. **Expected**: 
   - Success message appears
   - OCR confidence displayed
   - Report appears in grid below

### Test 5: View Report Details

1. In dashboard, find uploaded report card
2. Click "View Details" button
3. **Expected**:
   - Modal opens
   - Shows patient info
   - Shows OCR extracted text
   - Shows extracted data (JSON)
   - Shows report image

### Test 6: Search Functionality

1. In search bar, enter patient ID (e.g., "P001")
2. Click "Search"
3. **Expected**: Results filtered to matching reports
4. Click "Clear"
5. **Expected**: All reports shown again

### Test 7: Pagination

1. Upload at least 11 reports
2. **Expected**: Pagination controls appear
3. Click "Next"
4. **Expected**: Page 2 loads
5. Click "Previous"
6. **Expected**: Back to page 1

### Test 8: Delete Report

1. Open a report in modal
2. Click "Delete Report"
3. Confirm deletion
4. **Expected**:
   - Modal closes
   - Report removed from grid
   - Success message appears

### Test 9: Logout

1. Click "Logout" button in header
2. **Expected**: Redirect to Login page
3. Try to go back to dashboard
4. **Expected**: Redirect to Login page

### Test 10: Error Handling

**Test Invalid Login**:
1. Go to Login page
2. Enter wrong password
3. **Expected**: Error message appears

**Test Upload Without Image**:
1. In dashboard, click "Upload Report"
2. Click "Upload & Process" without selecting file
3. **Expected**: Error message appears

**Test Token Expiration**:
1. Login
2. In DevTools console: `localStorage.setItem('token', 'invalid')`
3. Try to upload report
4. **Expected**: Redirected to login

---

## 🔄 Integration Testing

### End-to-End User Journey

**Scenario**: New doctor uploads first lab report

1. **Sign Up**
   - Open app
   - Click "Sign Up"
   - Create account
   - ✅ Redirected to dashboard

2. **Upload Report**
   - Click "Upload Report"
   - Select lab report image
   - Enter patient details
   - Upload
   - ✅ OCR processes successfully
   - ✅ Report appears in grid

3. **View Details**
   - Click "View Details"
   - ✅ All information displayed
   - ✅ Image visible
   - ✅ OCR text readable

4. **Search**
   - Search for patient ID
   - ✅ Report found
   - Clear search
   - ✅ All reports shown

5. **Logout**
   - Click logout
   - ✅ Redirected to login

6. **Login Again**
   - Login with same credentials
   - ✅ Dashboard loads
   - ✅ Previous report still visible

---

## 📱 Mobile Testing

### Devices to Test
- iPhone (iOS Safari)
- Android (Chrome)
- iPad/Tablet

### Mobile Test Cases

1. **Responsive Layout**
   - ✅ Header stacks properly
   - ✅ Forms are usable
   - ✅ Buttons are touchable
   - ✅ No horizontal scroll

2. **Upload on Mobile**
   - ✅ Can select from camera
   - ✅ Can select from gallery
   - ✅ Upload works

3. **Navigation**
   - ✅ Easy to navigate
   - ✅ Modal closes properly
   - ✅ Search works

---

## ✅ Manual Testing Checklist

### Backend Checklist

- [ ] Server starts without errors
- [ ] Database connects successfully
- [ ] Health check endpoint works
- [ ] Signup creates user in database
- [ ] Login returns valid JWT token
- [ ] Protected endpoints require token
- [ ] Invalid token returns 401
- [ ] OCR processes images correctly
- [ ] Reports stored in database
- [ ] Search returns correct results
- [ ] Delete removes report and image
- [ ] Logout endpoint works
- [ ] CORS allows frontend requests

### Frontend Checklist

- [ ] App loads without console errors
- [ ] Sign Up form validates inputs
- [ ] Sign Up redirects to dashboard
- [ ] Login form validates inputs
- [ ] Login stores token in localStorage
- [ ] Protected route redirects if no token
- [ ] Dashboard displays user info
- [ ] Upload form accepts images only
- [ ] Upload shows progress/loading
- [ ] Success message appears after upload
- [ ] Reports grid displays correctly
- [ ] Report cards show all info
- [ ] View Details modal works
- [ ] Search filters reports
- [ ] Clear search resets results
- [ ] Pagination works (if >10 reports)
- [ ] Delete confirmation appears
- [ ] Delete removes report
- [ ] Logout clears token
- [ ] Logout redirects to login
- [ ] Mobile layout responsive
- [ ] Touch interactions work

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] Upload processes in < 10 seconds
- [ ] Search returns results quickly
- [ ] No memory leaks (check DevTools)
- [ ] Images load efficiently

---

## 🐛 Bug Reporting Template

When you find a bug, report it with:

```markdown
**Bug**: Brief description

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

**Screenshots**: (if applicable)

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop
```

---

## 🎉 Testing Complete!

Once all tests pass:

1. ✅ Backend fully functional
2. ✅ Frontend fully functional
3. ✅ Integration working
4. ✅ Mobile responsive
5. ✅ Cross-browser compatible

**Ready for deployment!** 🚀

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment instructions.

