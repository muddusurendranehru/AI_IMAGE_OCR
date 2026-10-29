const { normalizeIndiaMobile } = require('../utils/indiaMobile');

const AUTO_COLUMNS = new Set(['id', 'created_at', 'updated_at']);

let patientAssessmentColumnsCache = null;

async function getPatientAssessmentColumns(pool) {
  if (patientAssessmentColumnsCache) {
    return patientAssessmentColumnsCache;
  }

  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'patient_assessments'
     ORDER BY ordinal_position`
  );

  patientAssessmentColumnsCache = new Set(result.rows.map((row) => row.column_name));
  return patientAssessmentColumnsCache;
}

function buildAssessmentFieldMap(body, enteredBy, normalizedMobile) {
  const d = body || {};
  const map = {
    patient_name: d.patient_name,
    mobile_number: normalizedMobile,
    email: d.email || null,
    clerk_user_id: d.clerk_user_id || null,
    patient_age: d.patient_age,
    patient_sex: d.patient_sex,
    registration_no: d.registration_no,
    assessment_date: d.assessment_date,
    height_cm: d.height_cm,
    weight_kg: d.weight_kg,
    waist_cm: d.waist_cm,
    hip_cm: d.hip_cm,
    neck_cm: d.neck_cm,
    calf_cm: d.calf_cm,
    muac_cm: d.muac_cm,
    handgrip_kg: d.handgrip_kg,
    gait_time_sec: d.gait_time_sec,
    chair_stand_sec: d.chair_stand_sec,
    fasting_glucose: d.fasting_glucose,
    fasting_insulin: d.fasting_insulin,
    triglycerides: d.triglycerides,
    hba1c: d.hba1c,
    ldl: d.ldl,
    hdl: d.hdl,
    c_peptide: d.c_peptide,
    proinsulin: d.proinsulin,
    fecal_elastase: d.fecal_elastase,
    vitamin_b12: d.vitamin_b12,
    folic_acid: d.folic_acid,
    vitamin_d: d.vitamin_d,
    serum_calcium: d.serum_calcium,
    serum_ferritin: d.serum_ferritin,
    transferrin_sat: d.transferrin_sat,
    cigarettes_per_day: d.cigarettes_per_day,
    years_smoked: d.years_smoked,
    alcohol_vol_ml: d.alcohol_vol_ml,
    alcohol_abv: d.alcohol_abv,
    drinks_per_week: d.drinks_per_week,
    bedtime: d.bedtime,
    daily_steps: d.daily_steps,
    comorbidities: d.comorbidities,
    family_history: d.family_history,
    statin_duration: d.statin_duration,
    bp_med_duration: d.bp_med_duration,
    sugar_med_duration: d.sugar_med_duration,
    homa_ir: d.homa_ir,
    tyg_index: d.tyg_index,
    bmi: d.bmi,
    whr: d.whr,
    whtr: d.whtr,
    cwr: d.cwr,
    entered_by: enteredBy,
    staff_user_id: enteredBy,
    uploaded_by: enteredBy
  };

  return map;
}

async function insertIntoPatientAssessments(pool, body, enteredBy) {
  const mobileResult = normalizeIndiaMobile(body.mobile_number);
  if (!mobileResult.ok) {
    const err = new Error(mobileResult.error);
    err.statusCode = 400;
    throw err;
  }

  const columns = await getPatientAssessmentColumns(pool);
  if (!columns.size) {
    const err = new Error(
      'patient_assessments table is not available on this database. Contact administrator.'
    );
    err.statusCode = 503;
    throw err;
  }

  const fieldMap = buildAssessmentFieldMap(body, enteredBy, mobileResult.mobile);
  const insertColumns = [];
  const values = [];

  for (const [column, value] of Object.entries(fieldMap)) {
    if (!columns.has(column) || AUTO_COLUMNS.has(column)) {
      continue;
    }
    if (value === undefined) {
      continue;
    }
    insertColumns.push(column);
    values.push(value);
  }

  if (!insertColumns.length) {
    const err = new Error('No matching columns found on patient_assessments for this payload.');
    err.statusCode = 500;
    throw err;
  }

  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
  const query = `INSERT INTO patient_assessments (${insertColumns.join(', ')})
                 VALUES (${placeholders})
                 RETURNING id, created_at`;

  const result = await pool.query(query, values);
  return {
    id: result.rows[0].id,
    created_at: result.rows[0].created_at,
    mobile_number: mobileResult.mobile
  };
}

async function insertIntoCalculatorAssessments(pool, body, enteredBy) {
  const d = body;
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
      ) RETURNING id;
    `;

  const values = [
    d.patient_name,
    d.patient_age,
    d.patient_sex,
    d.registration_no,
    d.assessment_date,
    d.height_cm,
    d.weight_kg,
    d.waist_cm,
    d.hip_cm,
    d.neck_cm,
    d.calf_cm,
    d.muac_cm,
    d.handgrip_kg,
    d.gait_time_sec,
    d.chair_stand_sec,
    d.fasting_glucose,
    d.fasting_insulin,
    d.triglycerides,
    d.hba1c,
    d.ldl,
    d.hdl,
    d.c_peptide,
    d.proinsulin,
    d.fecal_elastase,
    d.vitamin_b12,
    d.folic_acid,
    d.vitamin_d,
    d.serum_calcium,
    d.serum_ferritin,
    d.transferrin_sat,
    d.cigarettes_per_day,
    d.years_smoked,
    d.alcohol_vol_ml,
    d.alcohol_abv,
    d.drinks_per_week,
    d.bedtime,
    d.daily_steps,
    d.comorbidities,
    d.family_history,
    d.statin_duration,
    d.bp_med_duration,
    d.sugar_med_duration,
    d.homa_ir,
    d.tyg_index,
    d.bmi,
    d.whr,
    d.whtr,
    d.cwr,
    enteredBy
  ];

  await pool.query(query, values);
}

async function calculatorAssessmentsTableExists(pool) {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'calculator_assessments'
     ) AS exists`
  );
  return result.rows[0].exists;
}

function clearPatientAssessmentColumnsCache() {
  patientAssessmentColumnsCache = null;
}

module.exports = {
  insertIntoPatientAssessments,
  insertIntoCalculatorAssessments,
  calculatorAssessmentsTableExists,
  getPatientAssessmentColumns,
  clearPatientAssessmentColumnsCache,
  normalizeIndiaMobile
};
