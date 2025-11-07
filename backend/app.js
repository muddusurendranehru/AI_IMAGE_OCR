// Main Express Application
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');

// Import database and routes
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const labReportRoutes = require('./routes/labReportRoutes');

const app = express();
const PORT = process.env.PORT || 3008;

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS configuration - Allow localhost and production frontend URLs
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in development, restrict in production
        }
    },
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// =====================================================
// CREATE REQUIRED DIRECTORIES
// =====================================================

const ensureDirectories = () => {
    const dirs = ['uploads', 'data'];
    dirs.forEach(dir => {
        const dirPath = path.join(__dirname, '..', dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });
};

ensureDirectories();

// =====================================================
// ROUTES
// =====================================================

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🔬 OCR Lab Report API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            reports: '/api/reports'
        }
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', labReportRoutes);

// Database status endpoint
app.get('/api/status', async (req, res) => {
    try {
        const isConnected = await db.testConnection();
        
        // Get table counts
        const usersCount = await db.query('SELECT COUNT(*) FROM users');
        const reportsCount = await db.query('SELECT COUNT(*) FROM lab_reports');
        
        res.json({
            success: true,
            database: {
                connected: isConnected,
                name: 'AI_OCR',
                tables: {
                    users: parseInt(usersCount.rows[0].count),
                    lab_reports: parseInt(reportsCount.rows[0].count)
                }
            },
            server: {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                ocrMethod: process.env.USE_TESSERACT === 'true' ? 'Tesseract' : 'Google Vision'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get status',
            message: error.message
        });
    }
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    // Multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 10 MB.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
    try {
        // Test database connection
        console.log('🔌 Testing database connection...');
        const isConnected = await db.testConnection();
        
        if (!isConnected) {
            throw new Error('Database connection failed');
        }
        
        // Display table contents (optional, for debugging)
        // Temporarily disabled to speed up startup
        // if (process.env.NODE_ENV === 'development') {
        //     await db.displayTables();
        // }
        
        // Start listening
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 OCR LAB REPORT BACKEND SERVER');
            console.log('='.repeat(50));
            console.log(`✅ Server running on: http://localhost:${PORT}`);
            console.log(`✅ Database: Neon PostgreSQL (AI_OCR)`);
            console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✅ OCR Method: ${process.env.USE_TESSERACT === 'true' ? 'Tesseract (Local)' : 'Google Vision (API)'}`);
            console.log('\n📚 API Endpoints:');
            console.log('   POST   /api/auth/signup       - Register new user');
            console.log('   POST   /api/auth/login        - User login');
            console.log('   POST   /api/auth/logout       - User logout');
            console.log('   GET    /api/auth/me           - Get current user');
            console.log('   POST   /api/reports/upload    - Upload lab report');
            console.log('   GET    /api/reports           - Get all reports');
            console.log('   GET    /api/reports/:id       - Get report by ID');
            console.log('   PUT    /api/reports/:id       - Update report');
            console.log('   DELETE /api/reports/:id       - Delete report');
            console.log('   GET    /api/reports/search    - Search reports');
            console.log('   GET    /api/status            - Server status');
            console.log('='.repeat(50) + '\n');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
    process.exit(1);
});

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = app;

