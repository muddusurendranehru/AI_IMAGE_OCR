-- ============================================================
-- SQL QUERIES TO CHECK NEW C.O.D-HOMA IQ ENTRIES
-- Database: AI_OCR (Neon PostgreSQL)
-- ============================================================

-- 1. CHECK ALL REPORTS WITH NEW SCORING SYSTEM
-- This finds reports that have the new drNehruScore field
-- ============================================================
SELECT 
    id,
    patient_name,
    patient_id,
    report_type,
    status,
    uploaded_at,
    processed_at,
    -- Check if drNehruScore exists
    CASE 
        WHEN extracted_data->'drNehruScore' IS NOT NULL 
        THEN '✅ NEW C.O.D-HOMA IQ'
        WHEN extracted_data->'homaIqScore' IS NOT NULL 
        THEN '⚪ OLD HOMA-IQ'
        ELSE '❌ NO SCORE'
    END as scoring_system,
    -- Get the score value
    CASE 
        WHEN extracted_data->'drNehruScore' IS NOT NULL 
        THEN (extracted_data->'drNehruScore'->>'score')::integer
        WHEN extracted_data->'homaIqScore' IS NOT NULL 
        THEN (extracted_data->'homaIqScore'->>'homaIQScore')::integer
        ELSE NULL
    END as score,
    -- Get risk level
    CASE 
        WHEN extracted_data->'drNehruScore' IS NOT NULL 
        THEN extracted_data->'drNehruScore'->>'riskLevel'
        WHEN extracted_data->'homaIqScore' IS NOT NULL 
        THEN extracted_data->'homaIqScore'->>'riskLevel'
        ELSE NULL
    END as risk_level,
    -- Get risk color
    CASE 
        WHEN extracted_data->'drNehruScore' IS NOT NULL 
        THEN extracted_data->'drNehruScore'->>'riskColor'
        WHEN extracted_data->'homaIqScore' IS NOT NULL 
        THEN extracted_data->'homaIqScore'->>'riskColor'
        ELSE NULL
    END as risk_color
FROM lab_reports
ORDER BY uploaded_at DESC;


-- ============================================================
-- 2. CHECK NEW ENTRIES ONLY (with C.O.D-HOMA IQ Score)
-- ============================================================
SELECT 
    id,
    patient_name,
    patient_id,
    uploaded_at,
    extracted_data->'drNehruScore'->>'score' as cod_homa_score,
    extracted_data->'drNehruScore'->>'riskLevel' as risk_level,
    extracted_data->'drNehruScore'->>'riskColor' as risk_color,
    extracted_data->'drNehruScore'->>'abnormalCount' as abnormal_count,
    extracted_data->'drNehruScore'->>'recommendation' as recommendation
FROM lab_reports
WHERE extracted_data->'drNehruScore' IS NOT NULL
ORDER BY uploaded_at DESC;


-- ============================================================
-- 3. GET DETAILED C.O.D-HOMA IQ SCORE FOR LATEST REPORT
-- ============================================================
SELECT 
    id,
    patient_name,
    patient_id,
    uploaded_at,
    jsonb_pretty(extracted_data->'drNehruScore') as detailed_score
FROM lab_reports
WHERE extracted_data->'drNehruScore' IS NOT NULL
ORDER BY uploaded_at DESC
LIMIT 1;


-- ============================================================
-- 4. CHECK DECIMAL FIXES (Insulin & C-Peptide)
-- ============================================================
SELECT 
    id,
    patient_name,
    uploaded_at,
    extracted_data->'labValues'->>'insulin' as insulin_value,
    extracted_data->'labValues'->>'c_peptide' as c_peptide_value,
    CASE 
        WHEN (extracted_data->'labValues'->>'insulin')::numeric > 100 
        THEN '❌ WRONG (missing decimal)'
        WHEN (extracted_data->'labValues'->>'insulin')::numeric BETWEEN 2 AND 25 
        THEN '✅ CORRECT'
        ELSE '⚠️ CHECK'
    END as insulin_status,
    CASE 
        WHEN (extracted_data->'labValues'->>'c_peptide')::numeric > 50 
        THEN '❌ WRONG (missing decimal)'
        WHEN (extracted_data->'labValues'->>'c_peptide')::numeric BETWEEN 0.5 AND 10 
        THEN '✅ CORRECT'
        ELSE '⚠️ CHECK'
    END as c_peptide_status
FROM lab_reports
WHERE 
    extracted_data->'labValues'->>'insulin' IS NOT NULL 
    OR extracted_data->'labValues'->>'c_peptide' IS NOT NULL
ORDER BY uploaded_at DESC;


-- ============================================================
-- 5. COUNT REPORTS BY SCORING SYSTEM
-- ============================================================
SELECT 
    CASE 
        WHEN extracted_data->'drNehruScore' IS NOT NULL 
        THEN '✅ NEW (C.O.D-HOMA IQ)'
        WHEN extracted_data->'homaIqScore' IS NOT NULL 
        THEN '⚪ OLD (HOMA-IQ)'
        ELSE '❌ NO SCORE'
    END as system_type,
    COUNT(*) as total_reports,
    MIN(uploaded_at) as first_report,
    MAX(uploaded_at) as latest_report
FROM lab_reports
GROUP BY system_type
ORDER BY latest_report DESC;


-- ============================================================
-- 6. GET ALL LAB VALUES WITH C.O.D-HOMA IQ SCORE
-- ============================================================
SELECT 
    patient_name,
    patient_id,
    uploaded_at,
    -- Lab Values
    extracted_data->'labValues'->>'glucose' as fbs,
    extracted_data->'labValues'->>'insulin' as insulin,
    extracted_data->'labValues'->>'postLunchSugar' as plbs,
    extracted_data->'labValues'->>'hba1c' as hba1c,
    extracted_data->'labValues'->>'ldl' as ldl,
    extracted_data->'labValues'->>'cholesterol' as total_cholesterol,
    extracted_data->'labValues'->>'hdl' as hdl,
    extracted_data->'labValues'->>'triglycerides' as triglycerides,
    -- Calculated Metrics
    extracted_data->'patientData'->>'waist' as waist_cm,
    extracted_data->'drNehruScore'->'details'->1->>'value' as homa_ir,
    extracted_data->'drNehruScore'->'details'->2->>'value' as tyg_index,
    -- Score
    extracted_data->'drNehruScore'->>'score' as cod_homa_score,
    extracted_data->'drNehruScore'->>'riskLevel' as risk_level
FROM lab_reports
WHERE extracted_data->'drNehruScore' IS NOT NULL
ORDER BY uploaded_at DESC;


-- ============================================================
-- 7. CHECK DOCTOR INFO IN REPORTS
-- ============================================================
SELECT 
    patient_name,
    uploaded_at,
    extracted_data->'drNehruScore'->'doctorInfo'->>'name' as doctor_name,
    extracted_data->'drNehruScore'->'doctorInfo'->>'phone' as phone,
    extracted_data->'drNehruScore'->'doctorInfo'->>'website' as website,
    extracted_data->'drNehruScore'->>'recommendation' as recommendation
FROM lab_reports
WHERE extracted_data->'drNehruScore' IS NOT NULL
ORDER BY uploaded_at DESC;


-- ============================================================
-- 8. SIMPLE CHECK - SHOW LATEST 5 REPORTS
-- ============================================================
SELECT 
    patient_name,
    TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI:SS') as uploaded,
    CASE 
        WHEN extracted_data->'drNehruScore' IS NOT NULL 
        THEN 'NEW'
        ELSE 'OLD'
    END as type,
    COALESCE(
        extracted_data->'drNehruScore'->>'score',
        extracted_data->'homaIqScore'->>'homaIQScore'
    ) as score
FROM lab_reports
ORDER BY uploaded_at DESC
LIMIT 5;

