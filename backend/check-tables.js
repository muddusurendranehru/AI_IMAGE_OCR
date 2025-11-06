// Check Database Tables - See All Stored Data
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkTables() {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('📊 DATABASE TABLES - SUCCESS DATA');
        console.log('='.repeat(60) + '\n');

        // Check USERS table
        const usersResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        console.log('👥 USERS TABLE (' + usersResult.rowCount + ' records):');
        console.log('='.repeat(60));
        usersResult.rows.forEach((user, index) => {
            console.log(`\n${index + 1}. User ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Name: ${user.full_name || 'N/A'}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Created: ${user.created_at}`);
        });

        // Check LAB_REPORTS table
        console.log('\n\n' + '='.repeat(60));
        const reportsResult = await pool.query(`
            SELECT 
                id, 
                patient_id, 
                patient_name, 
                report_type,
                status,
                uploaded_at,
                uploaded_by_user_id,
                extracted_data
            FROM lab_reports 
            ORDER BY uploaded_at DESC
        `);
        
        console.log('🔬 LAB_REPORTS TABLE (' + reportsResult.rowCount + ' records):');
        console.log('='.repeat(60));
        
        reportsResult.rows.forEach((report, index) => {
            console.log(`\n${index + 1}. Report ID: ${report.id}`);
            console.log(`   Patient: ${report.patient_name} (${report.patient_id})`);
            console.log(`   Type: ${report.report_type}`);
            console.log(`   Status: ${report.status}`);
            console.log(`   Uploaded: ${report.uploaded_at}`);
            console.log(`   By User ID: ${report.uploaded_by_user_id || 'N/A'}`);
            
            // Show extracted data highlights
            if (report.extracted_data) {
                const data = report.extracted_data;
                console.log(`   📊 Extracted Data:`);
                
                if (data.homaIQScore) {
                    console.log(`      HOMA-IQ Score: ${data.homaIQScore.score} (${data.homaIQScore.riskLevel})`);
                }
                
                if (data.healthMetrics) {
                    const hm = data.healthMetrics;
                    if (hm.homaIR) console.log(`      HOMA-IR: ${hm.homaIR.value} (${hm.homaIR.status})`);
                    if (hm.tygIndex) console.log(`      TYG Index: ${hm.tygIndex.value} (${hm.tygIndex.status})`);
                    if (hm.bmi) console.log(`      BMI: ${hm.bmi.value} (${hm.bmi.status})`);
                    if (hm.waistCircumference) console.log(`      Waist: ${hm.waistCircumference.value} cm (${hm.waistCircumference.status})`);
                }
                
                if (data.labValues) {
                    console.log(`      Lab Values Found: ${Object.keys(data.labValues).length} values`);
                    const values = data.labValues;
                    if (values.cholesterol) console.log(`         Cholesterol: ${values.cholesterol}`);
                    if (values.glucose) console.log(`         Glucose: ${values.glucose}`);
                    if (values.triglycerides) console.log(`         Triglycerides: ${values.triglycerides}`);
                }
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ DATABASE CHECK COMPLETE!');
        console.log('='.repeat(60) + '\n');

        pool.end();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        pool.end();
        process.exit(1);
    }
}

checkTables();

