-- ============================================
-- QUICK DATABASE VERIFICATION
-- Run this in Neon SQL Editor
-- ============================================

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'lab_reports');

-- 2. Check lab_reports structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lab_reports'
ORDER BY ordinal_position;

-- 3. Check if extracted_data column exists (JSONB type)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'lab_reports' 
  AND column_name = 'extracted_data';

-- 4. Count total reports
SELECT COUNT(*) as total_reports FROM lab_reports;

-- 5. Check recent reports with drNehruScore
SELECT 
  id,
  patient_name,
  created_at,
  (extracted_data->>'drNehruScore')::jsonb->>'score' as dr_nehru_score,
  (extracted_data->>'drNehruScore')::jsonb->>'riskLevel' as risk_level
FROM lab_reports 
WHERE extracted_data->>'drNehruScore' IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check if temp report exists (the one causing error)
SELECT 
  id,
  patient_name,
  status,
  created_at,
  user_id
FROM lab_reports 
WHERE id = 'temp-1763024014775';

