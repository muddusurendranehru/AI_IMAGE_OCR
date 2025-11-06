# 🔬 OCR Lab Report Web App

> Full-stack web application for hospital and clinic staff to digitize and manage lab reports using OCR technology

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)

## 🎯 Overview

The OCR Lab Report Web App is a comprehensive solution for hospitals and clinics to:
- **Digitize** printed lab reports through OCR technology
- **Store** patient lab data securely in a PostgreSQL database
- **Manage** reports through an intuitive dashboard
- **Extract** structured data from lab reports automatically
- **Search** and retrieve reports quickly

Perfect for healthcare facilities looking to modernize their lab report management system.

## ✨ Features

### Core Features
- 🔐 **User Authentication** - Secure signup, login, and JWT-based authorization
- 📤 **OCR Processing** - Automatic text extraction from lab report images using Tesseract.js
- 📊 **Dashboard** - Modern, responsive interface for managing lab reports
- 🔍 **Smart Search** - Search by patient ID, name, or report type
- 💾 **Database Storage** - Secure storage in Neon PostgreSQL with UUID primary keys
- 📱 **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🎯 **Data Extraction** - Automatic extraction of patient info and test results

### Technical Features
- **Backend-First Development** - Fully tested backend before frontend implementation
- **RESTful API** - Clean API design following best practices
- **Protected Routes** - Middleware-based authentication and authorization
- **File Upload** - Secure image upload with validation
- **Error Handling** - Comprehensive error handling throughout
- **CORS Support** - Configured for frontend-backend communication

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Neon PostgreSQL
- **Authentication**: JWT + bcrypt
- **OCR Engine**: Tesseract.js / Google Vision API
- **File Upload**: Multer

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Styling**: CSS3 (Grid, Flexbox, Animations)

### Database Schema
- **Database Name**: `AI_OCR`
- **Tables**: 2 (users, lab_reports)
- **Primary Keys**: UUID (gen_random_uuid())

### Deployment
- **Backend**: Render.com (Web Service)
- **Frontend**: Render.com (Static Site)
- **Database**: Neon.tech (Serverless PostgreSQL)

## 🏗 Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP/HTTPS
         │ Axios
         ▼
┌─────────────────┐
│   Backend       │
│   (Express)     │
│   Port: 3008    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│  Neon  │ │ Tesseract│
│  PG DB │ │   OCR    │
└────────┘ └──────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Neon PostgreSQL account
- Git

### Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/AI_IMAGE_OCR.git
cd AI_IMAGE_OCR
```

#### 2. Setup Database

1. Create account at [Neon.tech](https://neon.tech)
2. Create new project with database name: **AI_OCR**
3. Run the SQL script:
```bash
psql YOUR_CONNECTION_STRING -f backend/config/database.sql
```

#### 3. Setup Backend

```bash
# Install dependencies
npm install

# Create .env file
cat > .env << EOL
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=3008
NODE_ENV=development
USE_TESSERACT=true
FRONTEND_URL=http://localhost:3000
EOL

# Start backend server
npm run dev
```

Backend will start at `http://localhost:3008`

#### 4. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
REACT_APP_API_URL=http://localhost:3008/api
EOL

# Start frontend server
npm start
```

Frontend will open at `http://localhost:3000`

### Test the Application

1. **Sign Up**: Navigate to `http://localhost:3000/signup`
   - Email: `doctor@hospital.com`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
   - Full Name: `Dr. John Doe`

2. **Login**: Use credentials to login

3. **Upload Lab Report**: 
   - Click "Upload Report"
   - Select a lab report image
   - Fill optional fields
   - Click "Upload & Process"
   - Watch OCR magic happen! ✨

## 📁 Project Structure

```
AI_IMAGE_OCR/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Database connection
│   │   └── database.sql          # SQL schema
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   └── labReportController.js # Report logic
│   ├── middleware/
│   │   └── auth.js               # Auth middleware
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── labReportRoutes.js    # Report endpoints
│   ├── services/
│   │   └── ocrService.js         # OCR processing
│   ├── app.js                    # Main Express app
│   └── README.md
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Auth.css
│   │   │   └── Dashboard.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── README.md
├── uploads/                      # Uploaded images
├── data/                         # Local data storage
├── package.json                  # Backend dependencies
└── README.md                     # This file
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3008/api`
- Production: `https://your-app.onrender.com/api`

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

**Response:**
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

### Lab Report Endpoints

All lab report endpoints require authentication header:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Upload Lab Report
```http
POST /api/reports/upload
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

#### Search Reports
```http
GET /api/reports/search?query=hemoglobin
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Delete Report
```http
DELETE /api/reports/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

For complete API documentation, see [backend/README.md](backend/README.md)

## 🚢 Deployment

### Deploy Backend on Render

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - **Name**: ocr-lab-report-backend
     - **Root Directory**: Leave empty (or specify if needed)
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment Variables**:
       ```
       DATABASE_URL=your_neon_connection_string
       JWT_SECRET=your_secret_key
       USE_TESSERACT=true
       FRONTEND_URL=your_frontend_url
       ```

3. **Deploy** and copy the backend URL

### Deploy Frontend on Render

1. **Update Frontend Environment**
   - Update `REACT_APP_API_URL` in Render environment variables to your backend URL

2. **Create Static Site on Render**
   - Click "New +" → "Static Site"
   - Connect GitHub repository
   - Configure:
     - **Name**: ocr-lab-report-frontend
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`
     - **Environment Variables**:
       ```
       REACT_APP_API_URL=https://your-backend.onrender.com/api
       ```

3. **Deploy** and access your app!

## 🧪 Testing

### Manual Testing

#### Backend Testing with Postman/cURL
```bash
# Test signup
curl -X POST http://localhost:3008/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123"}'

# Test login
curl -X POST http://localhost:3008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123"}'

# Test protected endpoint
curl http://localhost:3008/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Frontend Testing
1. Open browser to `http://localhost:3000`
2. Test signup flow
3. Test login flow
4. Test dashboard features
5. Test upload functionality
6. Test search functionality
7. Test mobile responsiveness (Chrome DevTools)

## 🤝 Contributing

### Development Workflow

1. **Backend First**
   - Complete all backend features
   - Test thoroughly with Postman
   - Ensure 100% working backend

2. **Then Frontend**
   - Build React components
   - Connect to backend APIs
   - Test complete flow

3. **Alignment**
   - Ensure frontend-backend alignment
   - Consistent naming (universal approach for names)
   - Proper error handling

### Coding Standards
- Use meaningful variable names
- Comment complex logic
- Follow user rules (see `.cursorrules`)
- UUID for all primary keys
- Middleware for authentication
- Error handling on all endpoints

## 🐛 Troubleshooting

### Common Issues

**Database Connection Fails**
- Check DATABASE_URL is correct
- Ensure Neon database is active
- Run the SQL schema script

**OCR Not Working**
- Ensure image quality is good
- Check file size (max 10 MB)
- Try different OCR method (Tesseract vs Google Vision)

**CORS Errors**
- Check FRONTEND_URL in backend .env
- Ensure CORS middleware is configured

**Token Expired**
- Login again to get new token
- Check JWT expiration time

## 📝 License

ISC License

## 👥 Authors

Your Development Team

## 🙏 Acknowledgments

- Tesseract.js for OCR capabilities
- Neon for serverless PostgreSQL
- Render for easy deployment
- React and Express communities

---

**Ready to digitize your lab reports? Get started now! 🚀**

For detailed setup instructions:
- Backend: See [backend/README.md](backend/README.md)
- Frontend: See [frontend/README.md](frontend/README.md)

