-- ============================================================
-- QUICK DATABASE CHECK - Copy & Paste into Neon Console
-- ============================================================

-- RUN THIS ONE QUERY TO VERIFY EVERYTHING:
SELECT 
    '✅ NEW C.O.D-HOMA IQ Working!' as status,
    patient_name,
    patient_id,
    (extracted_data->'drNehruScore'->>'score')::integer || '/100' as score,
    extracted_data->'drNehruScore'->>'riskLevel' as risk,
    extracted_data->'drNehruScore'->'doctorInfo'->>'phone' as doctor_phone,
    extracted_data->'drNehruScore'->'doctorInfo'->>'website' as website,
    extracted_data->'labValues'->>'insulin' as insulin_check
FROM lab_reports
WHERE extracted_data->'drNehruScore' IS NOT NULL
ORDER BY uploaded_at DESC
LIMIT 1;

-- EXPECTED RESULT:
-- status: ✅ NEW C.O.D-HOMA IQ Working!
-- patient_name: indtotalscore15
-- patient_id: 00015
-- score: 70/100
-- risk: High Risk
-- doctor_phone: 09963721999
-- website: www.homahealthcarecenter.in
-- insulin_check: 15.84 (should be < 30, NOT 1584!)

-- IF THIS SHOWS CORRECT DATA, THEN:
-- ✅ Database saving correctly
-- ✅ C.O.D-HOMA IQ scoring working
-- ✅ Dr. Nehru info included
-- ✅ Decimal fix working
-- ✅ READY FOR GITHUB PUSH!

