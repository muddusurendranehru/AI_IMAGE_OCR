// Lab Report Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const labReportController = require('../controllers/labReportController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use absolute path relative to project root
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept images and PDFs
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            return cb(new Error('Only image files (JPG, PNG, GIF, WEBP) and PDF files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit
    }
});

// All routes require authentication
router.use(authenticateToken);

// Lab report routes
router.post('/upload', upload.single('image'), labReportController.uploadLabReport);
router.get('/', labReportController.getAllReports);
router.get('/search', labReportController.searchReports);
router.get('/:id', labReportController.getReportById);
router.put('/:id', labReportController.updateReport);
router.delete('/:id', labReportController.deleteReport);
// Batch upload configuration
const uploadMultiple = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            return cb(new Error('Only image and PDF files allowed!'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Batch upload route - multiple files for one patient
router.post('/batch-upload', uploadMultiple.array('images', 10), labReportController.batchUploadLabReports);

// Finalize report with human-verified data
router.post('/:id/finalize', labReportController.finalizeReport);

module.exports = router;

