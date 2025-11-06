-- ============================================================
-- SQL TO VERIFY NEW C.O.D-HOMA IQ ENTRY IN NEON DATABASE
-- Run these in Neon SQL Console: https://console.neon.tech
-- Database: AI_OCR
-- ============================================================

-- 1. CHECK LATEST REPORT (Should be indtotalscore15 with NEW system)
-- ============================================================
SELECT 
    patient_name,
    patient_id,
    TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI:SS') as uploaded_time,
    CASE 
        WHEN extracted_data->'drNehruScore' IS NOT NULL 
        THEN '✅ NEW C.O.D-HOMA IQ'
        WHEN extracted_data->'homaIqScore' IS NOT NULL 
        THEN '⚪ OLD HOMA-IQ'
        ELSE '❌ NO SCORE'
    END as scoring_system,
    COALESCE(
        (extracted_data->'drNehruScore'->>'score')::text,
        (extracted_data->'homaIqScore'->>'homaIQScore')::text
    ) as score,
    COALESCE(
        extracted_data->'drNehruScore'->>'riskLevel',
        extracted_data->'homaIqScore'->>'riskLevel'
    ) as risk_level
FROM lab_reports
ORDER BY uploaded_at DESC
LIMIT 1;

-- EXPECTED OUTPUT:
-- patient_name: indtotalscore15
-- patient_id: 00015
-- scoring_system: ✅ NEW C.O.D-HOMA IQ
-- score: 70
-- risk_level: High Risk


-- 2. GET FULL C.O.D-HOMA IQ DATA FOR LATEST REPORT
-- ============================================================
SELECT 
    patient_name,
    patient_id,
    -- Score details
    (extracted_data->'drNehruScore'->>'score')::integer as cod_homa_score,
    extracted_data->'drNehruScore'->>'maxScore' as max_score,
    extracted_data->'drNehruScore'->>'riskLevel' as risk_level,
    extracted_data->'drNehruScore'->>'riskColor' as risk_color,
    (extracted_data->'drNehruScore'->>'abnormalCount')::integer as abnormal_count,
    -- Doctor info
    extracted_data->'drNehruScore'->'doctorInfo'->>'name' as doctor_name,
    extracted_data->'drNehruScore'->'doctorInfo'->>'phone' as doctor_phone,
    extracted_data->'drNehruScore'->'doctorInfo'->>'website' as doctor_website,
    -- Patient data
    extracted_data->'patientData'->>'waist' as waist_cm,
    -- Family history
    extracted_data->'patientData'->'familyHistory'->>'diabetes' as family_diabetes,
    extracted_data->'patientData'->'familyHistory'->>'hypertension' as family_htm,
    extracted_data->'patientData'->'familyHistory'->>'cad' as family_cad,
    -- Past history
    extracted_data->'patientData'->'pastHistory'->>'cad' as past_cad,
    extracted_data->'patientData'->'pastHistory'->>'cva' as past_cva,
    -- Lifestyle
    extracted_data->'patientData'->'lifestyle'->>'smoking' as smoking,
    extracted_data->'patientData'->'lifestyle'->>'alcohol' as alcohol,
    -- Lab values (check decimal fix)
    extracted_data->'labValues'->>'insulin' as insulin,
    extracted_data->'labValues'->>'c_peptide' as c_peptide
FROM lab_reports
WHERE extracted_data->'drNehruScore' IS NOT NULL
ORDER BY uploaded_at DESC
LIMIT 1;

-- EXPECTED OUTPUT:
-- cod_homa_score: 70
-- risk_level: High Risk
-- risk_color: red
-- doctor_phone: 09963721999
-- doctor_website: www.homahealthcarecenter.in
-- insulin: Should be 15.84 (NOT 1584!)
-- c_peptide: Should be < 10 (NOT > 100!)


-- 3. COUNT ALL REPORTS BY SCORING SYSTEM
-- ============================================================
SELECT 
    CASE 
        WHEN extracted_data->'drNehruScore' IS NOT NULL 
        THEN '✅ NEW C.O.D-HOMA IQ'
        WHEN extracted_data->'homaIqScore' IS NOT NULL 
        THEN '⚪ OLD HOMA-IQ'
        ELSE '❌ NO SCORE'
    END as system_type,
    COUNT(*) as total_reports,
    MAX(uploaded_at) as latest_upload
FROM lab_reports
GROUP BY system_type
ORDER BY latest_upload DESC;

-- EXPECTED OUTPUT:
-- NEW C.O.D-HOMA IQ: 1 report (indtotalscore15)
-- OLD HOMA-IQ: 4 reports
-- NO SCORE: 2 reports


-- 4. SHOW ALL REPORTS (OLD vs NEW)
-- ============================================================
SELECT 
    patient_name,
    patient_id,
    TO_CHAR(uploaded_at, 'MM/DD HH24:MI') as uploaded,
    CASE 
        WHEN extracted_data->'drNehruScore' IS NOT NULL THEN 'NEW'
        WHEN extracted_data->'homaIqScore' IS NOT NULL THEN 'OLD'
        ELSE 'NONE'
    END as type,
    COALESCE(
        (extracted_data->'drNehruScore'->>'score')::text,
        (extracted_data->'homaIqScore'->>'homaIQScore')::text,
        'N/A'
    ) as score
FROM lab_reports
ORDER BY uploaded_at DESC;

-- EXPECTED OUTPUT:
-- indtotalscore15 | 00015 | 11/05 17:26 | NEW | 70
-- indraneel1      | 0009  | 11/04 11:37 | OLD | 80
-- ...


-- 5. GET DETAILED SCORE BREAKDOWN (NEW ENTRIES ONLY)
-- ============================================================
SELECT 
    patient_name,
    jsonb_pretty(extracted_data->'drNehruScore') as complete_score_data
FROM lab_reports
WHERE extracted_data->'drNehruScore' IS NOT NULL
ORDER BY uploaded_at DESC
LIMIT 1;

-- This shows the complete JSON structure with:
-- - score, maxScore, riskLevel, riskColor
-- - abnormalCount
-- - details array (all 12+ parameters with points)
-- - doctorInfo (name, phone, website)
-- - recommendation message


-- 6. VERIFY DECIMAL FIX (Insulin & C-Peptide)
-- ============================================================
SELECT 
    patient_name,
    extracted_data->'labValues'->>'insulin' as insulin_value,
    extracted_data->'labValues'->>'c_peptide' as c_peptide_value,
    CASE 
        WHEN (extracted_data->'labValues'->>'insulin')::numeric > 100 
        THEN '❌ DECIMAL ERROR'
        WHEN (extracted_data->'labValues'->>'insulin')::numeric BETWEEN 2 AND 30 
        THEN '✅ CORRECT'
        ELSE 'N/A'
    END as insulin_status
FROM lab_reports
WHERE extracted_data->'labValues'->>'insulin' IS NOT NULL
ORDER BY uploaded_at DESC
LIMIT 3;

-- EXPECTED: All insulin values should be < 30 (✅ CORRECT)


-- ============================================================
-- QUICK VERIFICATION (One Query)
-- ============================================================
SELECT 
    '✅ NEW C.O.D-HOMA IQ Entry Found!' as status,
    patient_name,
    patient_id,
    (extracted_data->'drNehruScore'->>'score')::integer || '/100' as score,
    extracted_data->'drNehruScore'->>'riskLevel' as risk,
    extracted_data->'drNehruScore'->'doctorInfo'->>'phone' as dr_nehru_phone
FROM lab_reports
WHERE extracted_data->'drNehruScore' IS NOT NULL
ORDER BY uploaded_at DESC
LIMIT 1;

-- If this returns indtotalscore15 with score 70/100 and phone 09963721999,
-- then NEW C.O.D-HOMA IQ system is WORKING and SAVING correctly! ✅

