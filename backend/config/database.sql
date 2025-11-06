-- Database Setup Script for Neon PostgreSQL
-- Database Name: AI_OCR
-- Tables: 2 (users, lab_reports)

-- =====================================================
-- TABLE 1: USERS (for authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- TABLE 2: LAB_REPORTS (for OCR results)
-- =====================================================
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(100),
    patient_name VARCHAR(255),
    report_type VARCHAR(100),
    image_path VARCHAR(500) NOT NULL,
    ocr_text TEXT,
    extracted_data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_uploaded_by ON lab_reports(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_lab_reports_status ON lab_reports(status);
CREATE INDEX IF NOT EXISTS idx_lab_reports_uploaded_at ON lab_reports(uploaded_at DESC);

-- =====================================================
-- DISPLAY TABLE CONTENTS (for verification)
-- =====================================================

-- View all users (excluding password for security)
CREATE OR REPLACE VIEW users_display AS
SELECT id, email, full_name, role, created_at, updated_at
FROM users;

-- View all lab reports with user info
CREATE OR REPLACE VIEW lab_reports_display AS
SELECT 
    lr.id,
    lr.patient_id,
    lr.patient_name,
    lr.report_type,
    lr.ocr_text,
    lr.status,
    lr.uploaded_at,
    lr.processed_at,
    u.email as uploaded_by_email,
    u.full_name as uploaded_by_name
FROM lab_reports lr
LEFT JOIN users u ON lr.uploaded_by = u.id
ORDER BY lr.uploaded_at DESC;

-- =====================================================
-- SAMPLE DATA (for testing - remove in production)
-- =====================================================

-- Insert a test user (password: Test123!)
-- Password hash is bcrypt hash of "Test123!"
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('test@hospital.com', '$2b$10$rjFvZgHxBKlGMxvqA6I9HOhpJjZ9yCxoWxvKUU6kF3wQH6EbZ6VFy', 'Test Doctor', 'doctor')
ON CONFLICT (email) DO NOTHING;

-- Insert a sample lab report
INSERT INTO lab_reports (patient_id, patient_name, report_type, image_path, ocr_text, status)
VALUES ('P001', 'John Doe', 'Blood Test', '/uploads/sample.jpg', 'Sample OCR text', 'completed')
ON CONFLICT DO NOTHING;

