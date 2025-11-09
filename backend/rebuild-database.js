// Database Rebuild Script for Neon PostgreSQL
// This script will recreate all tables in the AI_OCR1 database
// Run: node backend/rebuild-database.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Connection string from environment or use provided one
const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/AI_OCR1?sslmode=require&channel_binding=require';

console.log('🔧 DATABASE REBUILD SCRIPT');
console.log('==========================\n');
console.log('📋 Database: AI_OCR1');
console.log('📋 Connection: Neon PostgreSQL\n');

// Create connection pool
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

// Read SQL schema file
const sqlFilePath = path.join(__dirname, 'config', 'database.sql');
let sqlSchema = '';

try {
  sqlSchema = fs.readFileSync(sqlFilePath, 'utf8');
  console.log('✅ SQL schema file loaded\n');
} catch (error) {
  console.error('❌ Error reading SQL file:', error.message);
  process.exit(1);
}

// Function to execute SQL commands
async function executeSQL(sql) {
  try {
    const result = await pool.query(sql);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to check if table exists
async function tableExists(tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    console.error(`❌ Error checking table ${tableName}:`, error.message);
    return false;
  }
}

// Function to drop table if exists
async function dropTable(tableName) {
  const exists = await tableExists(tableName);
  if (exists) {
    console.log(`🗑️  Dropping existing table: ${tableName}`);
    const result = await executeSQL(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
    if (result.success) {
      console.log(`✅ Table ${tableName} dropped\n`);
    } else {
      console.log(`⚠️  Warning: Could not drop ${tableName}: ${result.error}\n`);
    }
  } else {
    console.log(`ℹ️  Table ${tableName} does not exist (skipping drop)\n`);
  }
}

// Main rebuild function
async function rebuildDatabase() {
  let client;
  
  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    client = await pool.connect();
    const testResult = await client.query('SELECT NOW(), current_database()');
    console.log('✅ Connected to database:', testResult.rows[0].current_database);
    console.log('✅ Server time:', testResult.rows[0].now);
    console.log('');
    client.release();

    // Step 1: Drop existing tables (in reverse order due to foreign keys)
    console.log('📋 STEP 1: Dropping existing tables (if any)...\n');
    await dropTable('lab_reports');
    await dropTable('users');

    // Step 2: Create tables
    console.log('📋 STEP 2: Creating tables...\n');
    
    // Execute SQL statements directly (more reliable than parsing)
    const sqlStatements = [
      {
        sql: `CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'staff',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );`,
        name: 'users table'
      },
      {
        sql: `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
        name: 'idx_users_email'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS lab_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id VARCHAR(100),
          patient_name VARCHAR(255),
          report_type VARCHAR(100),
          image_path VARCHAR(500) NOT NULL,
          ocr_text TEXT,
          extracted_data JSONB,
          status VARCHAR(50) DEFAULT 'pending',
          uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
          uploaded_at TIMESTAMP DEFAULT NOW(),
          processed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );`,
        name: 'lab_reports table'
      },
      {
        sql: `CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON lab_reports(patient_id);`,
        name: 'idx_lab_reports_patient_id'
      },
      {
        sql: `CREATE INDEX IF NOT EXISTS idx_lab_reports_uploaded_by ON lab_reports(uploaded_by);`,
        name: 'idx_lab_reports_uploaded_by'
      },
      {
        sql: `CREATE INDEX IF NOT EXISTS idx_lab_reports_status ON lab_reports(status);`,
        name: 'idx_lab_reports_status'
      },
      {
        sql: `CREATE INDEX IF NOT EXISTS idx_lab_reports_uploaded_at ON lab_reports(uploaded_at DESC);`,
        name: 'idx_lab_reports_uploaded_at'
      },
      {
        sql: `CREATE OR REPLACE VIEW users_display AS
          SELECT id, email, full_name, role, created_at, updated_at
          FROM users;`,
        name: 'users_display view'
      },
      {
        sql: `CREATE OR REPLACE VIEW lab_reports_display AS
          SELECT 
            lr.id,
            lr.patient_id,
            lr.patient_name,
            lr.report_type,
            lr.ocr_text,
            lr.status,
            lr.uploaded_at,
            lr.processed_at,
            u.email as uploaded_by_email,
            u.full_name as uploaded_by_name
          FROM lab_reports lr
          LEFT JOIN users u ON lr.uploaded_by = u.id
          ORDER BY lr.uploaded_at DESC;`,
        name: 'lab_reports_display view'
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const stmt of sqlStatements) {
      const result = await executeSQL(stmt.sql);
      
      if (result.success) {
        successCount++;
        if (stmt.name.includes('table')) {
          console.log(`✅ Created ${stmt.name}`);
        } else if (stmt.name.includes('idx_')) {
          console.log(`✅ Created index: ${stmt.name}`);
        } else if (stmt.name.includes('view')) {
          console.log(`✅ Created ${stmt.name}`);
        }
      } else {
        errorCount++;
        // Only log non-critical errors
        if (!result.error.includes('already exists') && 
            !result.error.includes('does not exist')) {
          console.log(`⚠️  ${stmt.name}: ${result.error.substring(0, 100)}`);
        }
      }
    }

    console.log(`\n✅ Executed ${successCount} SQL statements successfully`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements had warnings (may be expected)\n`);
    }

    // Step 3: Verify tables were created
    console.log('📋 STEP 3: Verifying tables...\n');
    
    const usersExists = await tableExists('users');
    const reportsExists = await tableExists('lab_reports');
    
    if (usersExists) {
      console.log('✅ Table "users" exists');
      const usersColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      console.log(`   Columns: ${usersColumns.rows.map(r => r.column_name).join(', ')}`);
    } else {
      console.log('❌ Table "users" NOT found!');
    }
    
    console.log('');
    
    if (reportsExists) {
      console.log('✅ Table "lab_reports" exists');
      const reportsColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'lab_reports' 
        ORDER BY ordinal_position;
      `);
      console.log(`   Columns: ${reportsColumns.rows.map(r => r.column_name).join(', ')}`);
    } else {
      console.log('❌ Table "lab_reports" NOT found!');
    }

    // Step 4: Test data insertion
    console.log('\n📋 STEP 4: Testing data operations...\n');
    
    // Test insert into users
    const testUserResult = await pool.query(`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name;
    `, ['test@rebuild.com', '$2b$10$test', 'Test User', 'staff']);
    
    if (testUserResult.rowCount > 0) {
      console.log('✅ Test user inserted:', testUserResult.rows[0].email);
    } else {
      console.log('ℹ️  Test user already exists (skipped)');
    }

    // Count records
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const reportCount = await pool.query('SELECT COUNT(*) FROM lab_reports');
    
    console.log(`\n📊 DATABASE STATUS:`);
    console.log(`   Users: ${userCount.rows[0].count} records`);
    console.log(`   Lab Reports: ${reportCount.rows[0].count} records`);

    console.log('\n✅ DATABASE REBUILD COMPLETE!');
    console.log('==========================\n');
    console.log('🎉 Your Neon PostgreSQL database is ready!');
    console.log('📋 Database: AI_OCR1');
    console.log('📋 Tables: users, lab_reports');
    console.log('\n✅ You can now start your backend server!');

  } catch (error) {
    console.error('\n❌ REBUILD FAILED!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your DATABASE_URL in .env file');
    console.error('2. Verify Neon database is active');
    console.error('3. Check network connection');
    process.exit(1);
  } finally {
    if (client && !client.released) {
      client.release();
    }
    await pool.end();
  }
}

// Run rebuild
rebuildDatabase().catch(console.error);

