// Simple Database Connection Test
const { Pool } = require('pg');
require('dotenv').config();

console.log('\n🔍 DATABASE CONNECTION DIAGNOSTIC\n');
console.log('='.repeat(50));

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL is MISSING from .env file!');
    console.log('Please add DATABASE_URL to backend/.env');
    process.exit(1);
}

console.log('✅ DATABASE_URL found in .env');
console.log('URL:', process.env.DATABASE_URL.substring(0, 50) + '...');

// Extract database name from URL
const dbMatch = process.env.DATABASE_URL.match(/\/([^?]+)\?/);
const dbName = dbMatch ? dbMatch[1] : 'unknown';
console.log('Database Name:', dbName);
console.log('='.repeat(50) + '\n');

// Try to connect
console.log('🔌 Attempting connection (timeout: 15 seconds)...\n');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
});

pool.query('SELECT NOW() as current_time, current_database() as db_name')
    .then(result => {
        console.log('✅✅✅ SUCCESS! DATABASE CONNECTED! ✅✅✅\n');
        console.log('Connected to:', result.rows[0].db_name);
        console.log('Current time:', result.rows[0].current_time);
        console.log('\nYour database is working fine! 🎉\n');
        pool.end();
        process.exit(0);
    })
    .catch(error => {
        console.log('❌❌❌ CONNECTION FAILED! ❌❌❌\n');
        console.log('Error Message:', error.message);
        console.log('Error Code:', error.code || 'N/A');
        console.log('\n📋 DIAGNOSIS:\n');
        
        if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
            console.log('🔴 PROBLEM: Database is sleeping or network timeout');
            console.log('✅ FIX: Go to Neon console and click on your database to wake it up');
            console.log('       Wait 30 seconds and try again');
        } else if (error.message.includes('authentication') || error.code === '28P01') {
            console.log('🔴 PROBLEM: Wrong username or password');
            console.log('✅ FIX: Copy connection string from Neon console again');
        } else if (error.message.includes('does not exist') || error.code === '3D000') {
            console.log('🔴 PROBLEM: Database name is wrong');
            console.log('✅ FIX: Check database name in Neon console (should be: AI_OCR)');
        } else if (error.message.includes('getaddrinfo') || error.message.includes('ENOTFOUND')) {
            console.log('🔴 PROBLEM: Cannot reach Neon servers (network issue)');
            console.log('✅ FIX: Check internet connection, disable VPN, check firewall');
        } else {
            console.log('🔴 PROBLEM: Unknown error');
            console.log('✅ FIX: Copy the error above and check Neon documentation');
        }
        
        console.log('\n');
        pool.end();
        process.exit(1);
    });

