# 🚀 Quick Setup Instructions - OCR Lab Report Web App

## For Local Development

### Prerequisites
- Node.js 18+ installed
- Git installed
- Neon PostgreSQL account

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/AI_IMAGE_OCR.git
cd AI_IMAGE_OCR
```

### Step 2: Setup Database

1. Create Neon account: https://neon.tech
2. Create project with database name: **AI_OCR**
3. Copy connection string
4. Run database schema:
```bash
psql "YOUR_CONNECTION_STRING" -f backend/config/database.sql
```

### Step 3: Setup Backend

```bash
# Install backend dependencies
npm install

# Create .env file in root directory
cat > .env << 'EOL'
DATABASE_URL=your_neon_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_change_this_to_something_strong
PORT=3008
NODE_ENV=development
USE_TESSERACT=true
FRONTEND_URL=http://localhost:3000
EOL

# Start backend
npm run dev
```

Backend should start at `http://localhost:3008`

### Step 4: Setup Frontend

```bash
# Navigate to frontend
cd frontend

# Install frontend dependencies
npm install

# Create .env file in frontend directory
cat > .env << 'EOL'
REACT_APP_API_URL=http://localhost:3008/api
EOL

# Start frontend
npm start
```

Frontend should open at `http://localhost:3000`

### Step 5: Test the App

1. Sign Up: Go to http://localhost:3000/signup
2. Create account with any email/password
3. Login with your credentials
4. Upload a lab report image
5. View the OCR results!

---

## For Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

---

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Ensure Neon database is active
- Verify Node.js version (should be 18+)

### Frontend can't connect
- Ensure backend is running first
- Check REACT_APP_API_URL in frontend/.env
- Clear browser cache

### Database connection fails
- Check connection string format
- Ensure `?sslmode=require` is at the end
- Verify Neon project is active

---

## Quick Commands

```bash
# Backend
npm run dev          # Start backend in development mode
npm start            # Start backend in production mode

# Frontend
cd frontend
npm start            # Start frontend in development mode
npm run build        # Build frontend for production

# Database
psql "CONNECTION_STRING" -f backend/config/database.sql  # Run schema
```

---

## Default Test Account

After running the database schema, you can use:
- **Email**: test@hospital.com
- **Password**: Test123!

Or create your own account via Sign Up.

---

## Need Help?

- Backend README: [backend/README.md](backend/README.md)
- Frontend README: [frontend/README.md](frontend/README.md)
- Full Documentation: [README.md](README.md)
- Deployment Guide: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

