# OCR Lab Report Backend API

## Overview
Backend API for OCR Lab Report Web App. Built with Node.js, Express, PostgreSQL (Neon), and Tesseract OCR.

## Features
- ✅ User Authentication (Signup, Login, Logout)
- ✅ JWT-based authorization
- ✅ OCR processing with Tesseract.js or Google Vision API
- ✅ Lab report management (CRUD operations)
- ✅ PostgreSQL database with UUID primary keys
- ✅ Image upload and storage
- ✅ Structured data extraction from lab reports

## Tech Stack
- **Framework**: Express.js
- **Database**: Neon PostgreSQL (database name: AI_OCR)
- **Authentication**: JWT + bcrypt
- **OCR**: Tesseract.js / Google Vision API
- **File Upload**: Multer
- **Deployment**: Render.com

## Database Schema

### Table 1: users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table 2: lab_reports
```sql
CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(100),
    patient_name VARCHAR(255),
    report_type VARCHAR(100),
    image_path VARCHAR(500) NOT NULL,
    ocr_text TEXT,
    extracted_data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Neon PostgreSQL Database

1. Go to [Neon.tech](https://neon.tech) and create an account
2. Create a new project with database name: **AI_OCR**
3. Copy the connection string
4. Run the SQL script to create tables:
   ```bash
   # Connect to your Neon database and run:
   psql YOUR_CONNECTION_STRING -f backend/config/database.sql
   ```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname/AI_OCR?sslmode=require

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=3008
NODE_ENV=development

# OCR Configuration
USE_TESSERACT=true

# Optional: Google Vision API
# GOOGLE_VISION_API_KEY=path/to/credentials.json

# CORS
FRONTEND_URL=http://localhost:3000
```

### 4. Create Required Directories
The app will automatically create these, but you can also create manually:
```bash
mkdir uploads
mkdir data
```

### 5. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3008`

## API Endpoints

### Authentication Endpoints

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "fullName": "Dr. John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "doctor@hospital.com",
    "fullName": "Dr. John Doe",
    "role": "staff"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### Lab Report Endpoints

All lab report endpoints require authentication.

#### Upload Lab Report
```http
POST /api/reports/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
  - image: [file]
  - patientId: "P001" (optional)
  - patientName: "John Doe" (optional)
  - reportType: "Blood Test" (optional)
```

#### Get All Reports
```http
GET /api/reports?page=1&limit=20&patientId=P001&status=completed
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Report by ID
```http
GET /api/reports/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Report
```http
PUT /api/reports/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "patientId": "P001",
  "patientName": "John Doe",
  "reportType": "Blood Test",
  "ocrText": "Updated text...",
  "extractedData": {}
}
```

#### Delete Report
```http
DELETE /api/reports/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Search Reports
```http
GET /api/reports/search?query=hemoglobin
Authorization: Bearer YOUR_JWT_TOKEN
```

### Status Endpoint
```http
GET /api/status
```

## Testing with Postman

1. Import the collection (create manually or use provided)
2. Set environment variable `baseUrl` = `http://localhost:3008`
3. Test signup → login → get token → test protected routes

## OCR Configuration

### Using Tesseract (Default)
- Free and runs locally
- No API key needed
- Set `USE_TESSERACT=true` in `.env`

### Using Google Vision API
- More accurate
- Requires Google Cloud account and API key
- Set `GOOGLE_VISION_API_KEY` in `.env`
- Set `USE_TESSERACT=false`

## Deployment on Render.com

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect to your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables in Render dashboard
6. Deploy!

## Troubleshooting

### Database Connection Fails
- Check DATABASE_URL is correct
- Ensure Neon database is active
- Check firewall/network settings

### OCR Not Working
- Ensure image is clear and high quality
- Check file size (max 10 MB)
- Try different OCR method (Tesseract vs Google Vision)

### Token Expired Error
- Login again to get new token
- Check JWT_SECRET is set correctly

## Security Best Practices

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ CORS configured properly
- ✅ Environment variables for secrets
- ✅ Input validation on all endpoints
- ✅ File upload restrictions (images only, 10 MB max)

## Support

For issues or questions, contact the development team.

