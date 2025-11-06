# OCR Lab Report Frontend

## Overview
React-based frontend dashboard for the OCR Lab Report Web App. Provides user authentication, lab report upload, and management interface for hospital staff.

## Features
- ✅ User Authentication (Sign Up, Login, Logout)
- ✅ Protected Routes with JWT
- ✅ Lab Report Upload with OCR Processing
- ✅ View and Search Reports
- ✅ Real-time Report Details
- ✅ Mobile-Responsive Design
- ✅ Modern UI/UX

## Tech Stack
- **Framework**: React 18
- **Router**: React Router DOM v6
- **HTTP Client**: Axios
- **Styling**: CSS3 with CSS Grid & Flexbox
- **Deployment**: Render.com (static site)

## Prerequisites
- Node.js 18+ installed
- Backend API running (see backend README)

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `.env` file in `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:3008/api
```

For production:
```env
REACT_APP_API_URL=https://your-backend-app.onrender.com/api
```

### 3. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   └── ProtectedRoute.js   # Auth protection wrapper
│   ├── pages/
│   │   ├── Login.js            # Login page
│   │   ├── Signup.js           # Sign up page
│   │   ├── Dashboard.js        # Main dashboard
│   │   ├── Auth.css            # Auth pages styles
│   │   └── Dashboard.css       # Dashboard styles
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.js                  # Main app component
│   ├── App.css                 # App styles
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
├── package.json
└── README.md
```

## Pages & Routes

### Public Routes
- `/` - Redirects to login
- `/login` - User login page
- `/signup` - User registration page

### Protected Routes (Require Authentication)
- `/dashboard` - Main dashboard with all features

## Features Breakdown

### Authentication
- Sign up with email, password, confirm password, and full name
- Login with email and password
- JWT token storage in localStorage
- Auto-redirect on token expiration
- Logout functionality

### Dashboard
- Upload lab reports (images up to 10 MB)
- View all uploaded reports in grid layout
- Search reports by patient ID, name, or report type
- View detailed report information in modal
- Delete reports
- Pagination for large datasets
- Real-time OCR processing feedback

### Mobile Responsiveness
- Mobile-first design approach
- Responsive layouts for all screen sizes
- Touch-friendly interface
- Optimized for tablets and smartphones

## API Integration

The frontend communicates with the backend API using Axios. All API calls are centralized in `services/api.js`:

### Authentication API
- `authAPI.signup()` - Register new user
- `authAPI.login()` - User login
- `authAPI.logout()` - User logout
- `authAPI.getCurrentUser()` - Get current user info

### Reports API
- `reportsAPI.uploadReport()` - Upload lab report
- `reportsAPI.getAllReports()` - Fetch all reports
- `reportsAPI.getReportById()` - Fetch single report
- `reportsAPI.updateReport()` - Update report
- `reportsAPI.deleteReport()` - Delete report
- `reportsAPI.searchReports()` - Search reports

## Authentication Flow

1. User accesses the app
2. If no token, redirect to `/login`
3. User logs in or signs up
4. Token saved to localStorage
5. User redirected to `/dashboard`
6. Token automatically added to all API requests
7. On token expiration, auto-logout and redirect to login

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Deployment on Render.com

1. **Push code to GitHub**

2. **Create Static Site on Render**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: ocr-lab-report-frontend
     - **Root Directory**: frontend
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

3. **Add Environment Variables**
   - `REACT_APP_API_URL` = Your backend URL (e.g., `https://your-backend.onrender.com/api`)

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Access your app at the provided URL

## Environment Variables

### Development
```env
REACT_APP_API_URL=http://localhost:3008/api
```

### Production
```env
REACT_APP_API_URL=https://your-backend-app.onrender.com/api
```

## Troubleshooting

### CORS Errors
- Ensure backend CORS is configured to allow frontend URL
- Check `FRONTEND_URL` in backend `.env` matches your frontend URL

### API Connection Failed
- Verify backend is running
- Check `REACT_APP_API_URL` is correct
- Ensure no firewall blocking requests

### Token Expired
- Login again to get new token
- Check JWT expiration time in backend

### Upload Fails
- Ensure file is an image
- Check file size (max 10 MB)
- Verify backend is processing OCR correctly

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization
- Code splitting with React.lazy (can be added)
- Image optimization
- Minified production builds
- Gzip compression on Render

## Security Features
- JWT token authentication
- Protected routes
- Token expiration handling
- XSS protection
- HTTPS in production

## Future Enhancements
- Dark mode toggle
- Report editing interface
- Advanced filtering options
- Export reports to PDF
- Batch upload
- User profile management
- Notifications system

## Support
For issues or questions, contact the development team.

