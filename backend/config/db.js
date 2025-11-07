// Database Connection Configuration for Neon PostgreSQL
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon PostgreSQL
    },
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000, // 15 seconds for Neon wakeup (free tier can be slow)
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to Neon PostgreSQL database: AI_OCR');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

// Helper function to test connection with timeout
async function testConnection() {
    try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database connection timeout after 15 seconds')), 15000);
        });
        
        const queryPromise = pool.query('SELECT NOW()');
        const result = await Promise.race([queryPromise, timeoutPromise]);
        
        console.log('✅ Database connection successful at:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.warn('⚠️ Server will continue but database operations may fail');
        return false;
    }
}

// Helper function to display table contents
async function displayTables() {
    try {
        console.log('\n📊 DATABASE CONTENTS:\n');
        
        // Display users table
        const usersResult = await pool.query('SELECT * FROM users_display');
        console.log('👥 USERS TABLE:', usersResult.rowCount, 'records');
        console.table(usersResult.rows);
        
        // Display lab_reports table
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
    query: (text, params) => pool.query(text, params),
    testConnection,
    displayTables
};

