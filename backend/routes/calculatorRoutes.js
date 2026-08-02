// backend/routes/calculator.js
// Route for saving HOMA Metabolic Calculator assessments to Neon.
// Protected by the same authenticateToken middleware used for lab report uploads.

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// POST /api/calculator/save  -- save a new assessment (staff must be logged in)
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const d = req.body;
    const enteredBy = req.user.id || req.user.userId || null;

    const query = `
      INSERT INTO calculator_assessments (
        patient_name, patient_age, patient_sex, registration_no, assessment_date,
        height_cm, weight_kg, waist_cm, hip_cm, neck_cm, calf_cm, muac_cm,
        handgrip_kg, gait_time_sec, chair_stand_sec,
        fasting_glucose, fasting_insulin, triglycerides, hba1c, ldl, hdl,
        c_peptide, proinsulin, fecal_elastase,
        vitamin_b12, folic_acid, vitamin_d, serum_calcium, serum_ferritin, transferrin_sat,
        cigarettes_per_day, years_smoked, alcohol_vol_ml, alcohol_abv, drinks_per_week,
        bedtime, daily_steps, comorbidities, family_history,
        statin_duration, bp_med_duration, sugar_med_duration,
        homa_ir, tyg_index, bmi, whr, whtr, cwr, entered_by
      ) VALUES (
        $1,$2,$3,$4,$5, $6,$7,$8,$9,$10,$11,$12, $13,$14,$15,
        $16,$17,$18,$19,$20,$21, $22,$23,$24,
        $25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35, $36,$37,$38,$39,
        $40,$41,$42, $43,$44,$45,$46,$47,$48, $49
      ) RETURNING id, created_at;
    `;

    const values = [
      d.patient_name, d.patient_age, d.patient_sex, d.registration_no, d.assessment_date,
      d.height_cm, d.weight_kg, d.waist_cm, d.hip_cm, d.neck_cm, d.calf_cm, d.muac_cm,
      d.handgrip_kg, d.gait_time_sec, d.chair_stand_sec,
      d.fasting_glucose, d.fasting_insulin, d.triglycerides, d.hba1c, d.ldl, d.hdl,
      d.c_peptide, d.proinsulin, d.fecal_elastase,
      d.vitamin_b12, d.folic_acid, d.vitamin_d, d.serum_calcium, d.serum_ferritin, d.transferrin_sat,
      d.cigarettes_per_day, d.years_smoked, d.alcohol_vol_ml, d.alcohol_abv, d.drinks_per_week,
      d.bedtime, d.daily_steps, d.comorbidities, d.family_history,
      d.statin_duration, d.bp_med_duration, d.sugar_med_duration,
      d.homa_ir, d.tyg_index, d.bmi, d.whr, d.whtr, d.cwr, enteredBy
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, id: result.rows[0].id, created_at: result.rows[0].created_at });
  } catch (err) {
    console.error('Calculator save error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/calculator/list -- list past assessments (staff must be logged in)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, patient_name, patient_age, patient_sex, homa_ir, tyg_index, bmi, created_at FROM calculator_assessments ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, assessments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
