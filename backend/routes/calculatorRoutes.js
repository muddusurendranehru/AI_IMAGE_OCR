// backend/routes/calculator.js
// Route for saving HOMA Metabolic Calculator assessments to Neon.
// Protected by the same authenticateToken middleware used for lab report uploads.

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/db');
const {
  insertIntoPatientAssessments,
  insertIntoCalculatorAssessments,
  calculatorAssessmentsTableExists,
  getPatientAssessmentColumns
} = require('../services/patientAssessmentPersistence');

// POST /api/calculator/save  -- save a new assessment (staff must be logged in)
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const enteredBy = req.user.id || req.user.userId || null;
    const saved = await insertIntoPatientAssessments(pool, req.body, enteredBy);

    try {
      if (await calculatorAssessmentsTableExists(pool)) {
        await insertIntoCalculatorAssessments(pool, req.body, enteredBy);
      }
    } catch (legacyErr) {
      console.warn('Calculator legacy table save skipped:', legacyErr.message);
    }

    res.json({
      success: true,
      id: saved.id,
      created_at: saved.created_at,
      mobile_number: saved.mobile_number,
      table: 'patient_assessments'
    });
  } catch (err) {
    const status = err.statusCode || 500;
    if (status >= 500) {
      console.error('Calculator save error:', err.message);
    }
    res.status(status).json({ success: false, error: err.message });
  }
});

// GET /api/calculator/list -- list past assessments (staff must be logged in)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const patientColumns = await getPatientAssessmentColumns(pool);
    if (patientColumns.size) {
      const selectCols = [
        'id',
        'patient_name',
        'mobile_number',
        'email',
        'patient_age',
        'patient_sex',
        'homa_ir',
        'tyg_index',
        'bmi',
        'created_at'
      ].filter((col) => patientColumns.has(col));

      const result = await pool.query(
        `SELECT ${selectCols.join(', ')} FROM patient_assessments ORDER BY created_at DESC NULLS LAST LIMIT 100`
      );
      return res.json({ success: true, assessments: result.rows, source: 'patient_assessments' });
    }

    const result = await pool.query(
      'SELECT id, patient_name, patient_age, patient_sex, homa_ir, tyg_index, bmi, created_at FROM calculator_assessments ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, assessments: result.rows, source: 'calculator_assessments' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
