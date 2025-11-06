// Quick Database Verification Script
// Run this to verify data is being saved correctly

const db = require('./config/db');

async function verifyDatabase() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 DATABASE VERIFICATION');
    console.log('='.repeat(60) + '\n');

    try {
        // Test connection
        const connected = await db.testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }

        // Check users table
        console.log('📊 TABLE 1: USERS');
        console.log('-'.repeat(60));
        const usersResult = await db.query(`
            SELECT 
                id, 
                email, 
                full_name, 
                role, 
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        if (usersResult.rows.length > 0) {
            console.log(`✅ Found ${usersResult.rows.length} user(s):\n`);
            usersResult.rows.forEach((user, idx) => {
                console.log(`${idx + 1}. Email: ${user.email}`);
                console.log(`   Name: ${user.full_name || 'N/A'}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Created: ${user.created_at}\n`);
            });
        } else {
            console.log('⚠️  No users found\n');
        }

        // Check lab_reports table
        console.log('\n📊 TABLE 2: LAB_REPORTS');
        console.log('-'.repeat(60));
        const reportsResult = await db.query(`
            SELECT 
                lr.id,
                lr.patient_name,
                lr.patient_id,
                lr.status,
                lr.report_type,
                lr.extracted_data->>'homaIQScore' as homa_iq_score,
                lr.extracted_data->'homaIRResult'->>'value' as homa_ir_value,
                lr.extracted_data->'homaIRResult'->>'status' as homa_ir_status,
                lr.extracted_data->'labValues'->>'ldl' as ldl_value,
                u.email as uploaded_by,
                TO_CHAR(lr.uploaded_at, 'YYYY-MM-DD HH24:MI:SS') as uploaded_at
            FROM lab_reports lr
            LEFT JOIN users u ON lr.uploaded_by = u.id
            ORDER BY lr.uploaded_at DESC
            LIMIT 5
        `);
        
        if (reportsResult.rows.length > 0) {
            console.log(`✅ Found ${reportsResult.rows.length} report(s):\n`);
            reportsResult.rows.forEach((report, idx) => {
                console.log(`${idx + 1}. Patient: ${report.patient_name || 'N/A'} (ID: ${report.patient_id || 'N/A'})`);
                console.log(`   Report ID: ${report.id}`);
                console.log(`   Status: ${report.status}`);
                console.log(`   Type: ${report.report_type || 'N/A'}`);
                
                if (report.homa_iq_score) {
                    console.log(`   🎯 HOMA-IQ Score: ${report.homa_iq_score}`);
                }
                
                if (report.homa_ir_value) {
                    console.log(`   📊 HOMA-IR: ${report.homa_ir_value} (${report.homa_ir_status || 'N/A'})`);
                }
                
                if (report.ldl_value) {
                    console.log(`   💊 LDL: ${report.ldl_value} mg/dL`);
                }
                
                console.log(`   Uploaded by: ${report.uploaded_by || 'N/A'}`);
                console.log(`   Uploaded at: ${report.uploaded_at}\n`);
            });
        } else {
            console.log('⚠️  No lab reports found\n');
        }

        // Get total counts
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const reportCount = await db.query('SELECT COUNT(*) FROM lab_reports');
        
        console.log('\n' + '='.repeat(60));
        console.log('📈 SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Users: ${userCount.rows[0].count}`);
        console.log(`Total Lab Reports: ${reportCount.rows[0].count}`);
        console.log('='.repeat(60) + '\n');

        console.log('✅ Database verification complete!\n');
        
    } catch (error) {
        console.error('❌ Verification error:', error.message);
    } finally {
        process.exit(0);
    }
}

// Run verification
verifyDatabase();

