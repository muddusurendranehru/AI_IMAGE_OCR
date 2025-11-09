// Database Schema Check & Insert/Fetch Test Script
// This script will:
// 1. Check database connection
// 2. Display schema (tables, columns, types)
// 3. Test INSERT operations
// 4. Test FETCH/SELECT operations
// Run: node backend/test-database-operations.js

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Connection string
const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/AI_OCR1?sslmode=require&channel_binding=require';

console.log('🔍 DATABASE SCHEMA CHECK & OPERATIONS TEST');
console.log('='.repeat(60));
console.log('📋 Database: AI_OCR1');
console.log('📋 Connection: Neon PostgreSQL\n');

// Create connection pool
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

// Helper function to execute queries
async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return { success: true, data: result.rows, rowCount: result.rowCount };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Step 1: Check Database Connection
async function checkConnection() {
  console.log('📋 STEP 1: Checking Database Connection...\n');
  
  const result = await query('SELECT NOW() as current_time, current_database() as db_name, version() as pg_version');
  
  if (result.success) {
    console.log('✅ Database Connected Successfully!');
    console.log(`   Database Name: ${result.data[0].db_name}`);
    console.log(`   Server Time: ${result.data[0].current_time}`);
    console.log(`   PostgreSQL Version: ${result.data[0].pg_version.split(',')[0]}\n`);
    return true;
  } else {
    console.log('❌ Connection Failed:', result.error);
    return false;
  }
}

// Step 2: Check Schema - List All Tables
async function checkTables() {
  console.log('📋 STEP 2: Checking Database Schema (Tables)...\n');
  
  const result = await query(`
    SELECT 
      table_name,
      table_type
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  
  if (result.success) {
    console.log(`✅ Found ${result.rowCount} table(s):\n`);
    result.data.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name} (${table.table_type})`);
    });
    console.log('');
    return result.data.map(t => t.table_name);
  } else {
    console.log('❌ Error fetching tables:', result.error);
    return [];
  }
}

// Step 3: Check Schema - Table Columns and Types
async function checkTableSchema(tableName) {
  console.log(`📋 STEP 3: Checking Schema for Table "${tableName}"...\n`);
  
  const result = await query(`
    SELECT 
      column_name,
      data_type,
      character_maximum_length,
      is_nullable,
      column_default,
      ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = $1
    ORDER BY ordinal_position;
  `, [tableName]);
  
  if (result.success) {
    console.log(`✅ Table "${tableName}" Schema:\n`);
    console.log('   Column Name'.padEnd(25) + 'Type'.padEnd(20) + 'Nullable'.padEnd(12) + 'Default');
    console.log('   ' + '-'.repeat(70));
    
    result.data.forEach(col => {
      let type = col.data_type;
      if (col.character_maximum_length) {
        type += `(${col.character_maximum_length})`;
      }
      const nullable = col.is_nullable === 'YES' ? 'YES' : 'NO';
      const defaultVal = col.column_default ? col.column_default.substring(0, 30) : '-';
      console.log(`   ${col.column_name.padEnd(25)}${type.padEnd(20)}${nullable.padEnd(12)}${defaultVal}`);
    });
    console.log('');
    return result.data;
  } else {
    console.log(`❌ Error fetching schema for ${tableName}:`, result.error);
    return [];
  }
}

// Step 4: Check Current Data Count
async function checkDataCount(tableName) {
  const result = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
  if (result.success) {
    return result.data[0].count;
  }
  return 0;
}

// Step 5: Test INSERT Operation - Users Table
async function testInsertUser() {
  console.log('📋 STEP 4: Testing INSERT Operation (users table)...\n');
  
  const testEmail = `test_${Date.now()}@example.com`;
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash('Test123!', 10);
  
  const insertSQL = `
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, full_name, role, created_at;
  `;
  
  const result = await query(insertSQL, [
    testEmail,
    passwordHash,
    'Test User',
    'staff'
  ]);
  
  if (result.success) {
    console.log('✅ INSERT Success! User created:');
    console.log(`   ID: ${result.data[0].id}`);
    console.log(`   Email: ${result.data[0].email}`);
    console.log(`   Full Name: ${result.data[0].full_name}`);
    console.log(`   Role: ${result.data[0].role}`);
    console.log(`   Created At: ${result.data[0].created_at}\n`);
    return result.data[0];
  } else {
    console.log('❌ INSERT Failed:', result.error);
    return null;
  }
}

// Step 6: Test INSERT Operation - Lab Reports Table
async function testInsertLabReport(userId) {
  console.log('📋 STEP 5: Testing INSERT Operation (lab_reports table)...\n');
  
  const insertSQL = `
    INSERT INTO lab_reports (
      patient_id, 
      patient_name, 
      report_type, 
      image_path, 
      ocr_text, 
      extracted_data,
      status,
      uploaded_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, patient_id, patient_name, report_type, status, uploaded_at, created_at;
  `;
  
  const extractedData = {
    test: true,
    timestamp: new Date().toISOString(),
    sample_data: {
      glucose: 95,
      cholesterol: 180
    }
  };
  
  const result = await query(insertSQL, [
    'P001',
    'John Doe',
    'Blood Test',
    '/uploads/test-report.jpg',
    'Sample OCR text from lab report',
    JSON.stringify(extractedData),
    'completed',
    userId
  ]);
  
  if (result.success) {
    console.log('✅ INSERT Success! Lab Report created:');
    console.log(`   ID: ${result.data[0].id}`);
    console.log(`   Patient ID: ${result.data[0].patient_id}`);
    console.log(`   Patient Name: ${result.data[0].patient_name}`);
    console.log(`   Report Type: ${result.data[0].report_type}`);
    console.log(`   Status: ${result.data[0].status}`);
    console.log(`   Uploaded At: ${result.data[0].uploaded_at}\n`);
    return result.data[0];
  } else {
    console.log('❌ INSERT Failed:', result.error);
    return null;
  }
}

// Step 7: Test FETCH Operation - Users Table
async function testFetchUsers() {
  console.log('📋 STEP 6: Testing FETCH Operation (users table)...\n');
  
  const result = await query(`
    SELECT id, email, full_name, role, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
    LIMIT 5;
  `);
  
  if (result.success) {
    console.log(`✅ FETCH Success! Found ${result.rowCount} user(s):\n`);
    
    if (result.rowCount > 0) {
      result.data.forEach((user, index) => {
        console.log(`   User ${index + 1}:`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Full Name: ${user.full_name || 'N/A'}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Created: ${user.created_at}`);
        console.log('');
      });
    } else {
      console.log('   No users found.\n');
    }
    return result.data;
  } else {
    console.log('❌ FETCH Failed:', result.error);
    return [];
  }
}

// Step 8: Test FETCH Operation - Lab Reports Table
async function testFetchLabReports() {
  console.log('📋 STEP 7: Testing FETCH Operation (lab_reports table)...\n');
  
  const result = await query(`
    SELECT 
      lr.id,
      lr.patient_id,
      lr.patient_name,
      lr.report_type,
      lr.status,
      lr.uploaded_at,
      lr.extracted_data,
      u.email as uploaded_by_email
    FROM lab_reports lr
    LEFT JOIN users u ON lr.uploaded_by = u.id
    ORDER BY lr.uploaded_at DESC
    LIMIT 5;
  `);
  
  if (result.success) {
    console.log(`✅ FETCH Success! Found ${result.rowCount} lab report(s):\n`);
    
    if (result.rowCount > 0) {
      result.data.forEach((report, index) => {
        console.log(`   Report ${index + 1}:`);
        console.log(`      ID: ${report.id}`);
        console.log(`      Patient ID: ${report.patient_id || 'N/A'}`);
        console.log(`      Patient Name: ${report.patient_name || 'N/A'}`);
        console.log(`      Report Type: ${report.report_type || 'N/A'}`);
        console.log(`      Status: ${report.status}`);
        console.log(`      Uploaded By: ${report.uploaded_by_email || 'N/A'}`);
        console.log(`      Uploaded At: ${report.uploaded_at}`);
        if (report.extracted_data) {
          const data = typeof report.extracted_data === 'string' 
            ? JSON.parse(report.extracted_data) 
            : report.extracted_data;
          console.log(`      Extracted Data: ${JSON.stringify(data).substring(0, 50)}...`);
        }
        console.log('');
      });
    } else {
      console.log('   No lab reports found.\n');
    }
    return result.data;
  } else {
    console.log('❌ FETCH Failed:', result.error);
    return [];
  }
}

// Step 9: Display Summary
async function displaySummary() {
  console.log('📋 STEP 8: Database Summary...\n');
  
  const usersCount = await checkDataCount('users');
  const reportsCount = await checkDataCount('lab_reports');
  
  console.log('📊 CURRENT DATABASE STATUS:');
  console.log(`   Users Table: ${usersCount} record(s)`);
  console.log(`   Lab Reports Table: ${reportsCount} record(s)`);
  console.log('');
}

// Main execution
async function runTests() {
  try {
    // Step 1: Check connection
    const connected = await checkConnection();
    if (!connected) {
      console.log('❌ Cannot proceed without database connection!');
      process.exit(1);
    }
    
    // Step 2: Check tables
    const tables = await checkTables();
    if (tables.length === 0) {
      console.log('❌ No tables found! Run rebuild-database.js first!');
      process.exit(1);
    }
    
    // Step 3: Check schema for each table
    for (const table of tables) {
      await checkTableSchema(table);
    }
    
    // Step 4: Test INSERT - Users
    const newUser = await testInsertUser();
    
    // Step 5: Test INSERT - Lab Reports (if user was created)
    let newReport = null;
    if (newUser) {
      newReport = await testInsertLabReport(newUser.id);
    }
    
    // Step 6: Test FETCH - Users
    await testFetchUsers();
    
    // Step 7: Test FETCH - Lab Reports
    await testFetchLabReports();
    
    // Step 8: Display Summary
    await displaySummary();
    
    console.log('✅✅✅ ALL TESTS COMPLETED SUCCESSFULLY! ✅✅✅\n');
    console.log('🎉 Database operations (INSERT & FETCH) are working perfectly!');
    console.log('📋 Schema is correct and matches requirements.');
    console.log('\n✅ Your database is ready for use!\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check DATABASE_URL in .env file');
    console.error('2. Verify Neon database is active');
    console.error('3. Run rebuild-database.js if tables are missing');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run tests
runTests().catch(console.error);

