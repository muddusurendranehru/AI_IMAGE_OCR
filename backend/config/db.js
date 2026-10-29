// Database Connection Configuration for Neon PostgreSQL
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const poolSsl = { rejectUnauthorized: false };

// Primary pool: staff auth, lab reports, calculator_assessments legacy (AI_OCR1)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: poolSsl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

let patientAssessmentsPool = null;

function getPatientAssessmentsDatabaseUrl() {
  return (
    process.env.PATIENT_ASSESSMENTS_DATABASE_URL ||
    process.env.HOMA_MVP_DATABASE_URL ||
    null
  );
}

/** HOMA MVP Neon DB (drmuddusmvp1) — patient_assessments for /admin search */
function getPatientAssessmentsPool() {
  const connectionString = getPatientAssessmentsDatabaseUrl();
  if (!connectionString) {
    return null;
  }
  if (!patientAssessmentsPool) {
    patientAssessmentsPool = new Pool({
      connectionString,
      ssl: poolSsl,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    patientAssessmentsPool.on('connect', () => {
      console.log('✅ Connected to Neon patient_assessments database (HOMA MVP)');
    });
    patientAssessmentsPool.on('error', (err) => {
      console.error('❌ Patient assessments pool error:', err.message);
    });
  }
  return patientAssessmentsPool;
}

pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL database (primary / AI_OCR)');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
});

async function testConnection() {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout after 10 seconds')), 10000);
    });

    const queryPromise = pool.query('SELECT NOW()');
    const result = await Promise.race([queryPromise, timeoutPromise]);

    console.log('✅ Database connection successful at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.warn('⚠️ Server will continue but database operations may fail');
    console.warn('   Database will retry on first request');
    return false;
  }
}

async function displayTables() {
  try {
    console.log('\n📊 DATABASE CONTENTS:\n');

    const usersResult = await pool.query('SELECT * FROM users_display');
    console.log('👥 USERS TABLE:', usersResult.rowCount, 'records');
    console.table(usersResult.rows);

    const reportsResult = await pool.query('SELECT * FROM lab_reports_display');
    console.log('\n🔬 LAB_REPORTS TABLE:', reportsResult.rowCount, 'records');
    console.table(reportsResult.rows);

    return true;
  } catch (error) {
    console.error('❌ Error displaying tables:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  getPatientAssessmentsPool,
  getPatientAssessmentsDatabaseUrl,
  query: (text, params) => pool.query(text, params),
  testConnection,
  displayTables
};
