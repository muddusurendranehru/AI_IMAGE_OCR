// Verify Database - Check C.O.D-HOMA IQ Score in Neon PostgreSQL
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function verifyDatabase() {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 VERIFYING C.O.D-HOMA IQ SCORE IN DATABASE');
    console.log('Database: AI_OCR (Neon PostgreSQL)');
    console.log('='.repeat(70) + '\n');

    try {
        // Test connection
        console.log('📡 Testing connection...');
        const connectionTest = await pool.query('SELECT NOW()');
        console.log('✅ Connected to database at:', connectionTest.rows[0].now);
        console.log('');

        // Check total reports
        console.log('📊 REPORT STATISTICS:');
        console.log('-'.repeat(70));
        const totalReports = await pool.query('SELECT COUNT(*) FROM lab_reports');
        console.log(`Total Reports: ${totalReports.rows[0].count}`);

        // Check reports by scoring system
        const bySystem = await pool.query(`
            SELECT 
                CASE 
                    WHEN extracted_data->'drNehruScore' IS NOT NULL 
                    THEN 'NEW (C.O.D-HOMA IQ)'
                    WHEN extracted_data->'homaIqScore' IS NOT NULL 
                    THEN 'OLD (HOMA-IQ)'
                    ELSE 'NO SCORE'
                END as system_type,
                COUNT(*) as total
            FROM lab_reports
            GROUP BY system_type
            ORDER BY system_type DESC
        `);

        console.log('\nReports by Scoring System:');
        bySystem.rows.forEach(row => {
            console.log(`  - ${row.system_type}: ${row.total} reports`);
        });
        console.log('');

        // Get latest 5 reports
        console.log('\n📋 LATEST 5 REPORTS:');
        console.log('-'.repeat(70));
        const latestReports = await pool.query(`
            SELECT 
                patient_name,
                patient_id,
                TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI:SS') as uploaded,
                CASE 
                    WHEN extracted_data->'drNehruScore' IS NOT NULL 
                    THEN '✅ NEW'
                    WHEN extracted_data->'homaIqScore' IS NOT NULL 
                    THEN '⚪ OLD'
                    ELSE '❌ NONE'
                END as type,
                COALESCE(
                    extracted_data->'drNehruScore'->>'score',
                    extracted_data->'homaIqScore'->>'homaIQScore'
                ) as score,
                COALESCE(
                    extracted_data->'drNehruScore'->>'riskLevel',
                    extracted_data->'homaIqScore'->>'riskLevel'
                ) as risk_level
            FROM lab_reports
            ORDER BY uploaded_at DESC
            LIMIT 5
        `);

        latestReports.rows.forEach((report, idx) => {
            console.log(`\n${idx + 1}. ${report.patient_name || 'Unknown'} (${report.patient_id || 'N/A'})`);
            console.log(`   Uploaded: ${report.uploaded}`);
            console.log(`   System: ${report.type}`);
            console.log(`   Score: ${report.score || 'N/A'}`);
            console.log(`   Risk: ${report.risk_level || 'N/A'}`);
        });
        console.log('');

        // Check for NEW C.O.D-HOMA IQ entries
        console.log('\n🎯 NEW C.O.D-HOMA IQ SCORE ENTRIES:');
        console.log('-'.repeat(70));
        const newEntries = await pool.query(`
            SELECT 
                id,
                patient_name,
                patient_id,
                TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI:SS') as uploaded,
                (extracted_data->'drNehruScore'->>'score')::integer as cod_score,
                extracted_data->'drNehruScore'->>'riskLevel' as risk_level,
                extracted_data->'drNehruScore'->>'riskColor' as risk_color,
                (extracted_data->'drNehruScore'->>'abnormalCount')::integer as abnormal_count
            FROM lab_reports
            WHERE extracted_data->'drNehruScore' IS NOT NULL
            ORDER BY uploaded_at DESC
        `);

        if (newEntries.rows.length === 0) {
            console.log('⚠️  No reports with C.O.D-HOMA IQ Score found yet.');
            console.log('   Upload a new report to test the new scoring system!');
        } else {
            console.log(`✅ Found ${newEntries.rows.length} report(s) with C.O.D-HOMA IQ Score:\n`);
            newEntries.rows.forEach((report, idx) => {
                console.log(`${idx + 1}. ${report.patient_name || 'Unknown'}`);
                console.log(`   ID: ${report.id}`);
                console.log(`   Uploaded: ${report.uploaded}`);
                console.log(`   C.O.D-HOMA IQ Score: ${report.cod_score}/100`);
                console.log(`   Risk Level: ${report.risk_level}`);
                console.log(`   Risk Color: ${report.risk_color}`);
                console.log(`   Abnormal Parameters: ${report.abnormal_count}`);
                console.log('');
            });
        }

        // Check decimal fixes
        console.log('\n🔧 DECIMAL FIX VERIFICATION (Insulin & C-Peptide):');
        console.log('-'.repeat(70));
        const decimalCheck = await pool.query(`
            SELECT 
                patient_name,
                TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI:SS') as uploaded,
                extracted_data->'labValues'->>'insulin' as insulin,
                extracted_data->'labValues'->>'c_peptide' as c_peptide,
                CASE 
                    WHEN (extracted_data->'labValues'->>'insulin')::numeric > 100 
                    THEN '❌ WRONG'
                    WHEN (extracted_data->'labValues'->>'insulin')::numeric BETWEEN 2 AND 30 
                    THEN '✅ CORRECT'
                    ELSE '⚠️ CHECK'
                END as insulin_status
            FROM lab_reports
            WHERE extracted_data->'labValues'->>'insulin' IS NOT NULL
            ORDER BY uploaded_at DESC
            LIMIT 5
        `);

        if (decimalCheck.rows.length > 0) {
            decimalCheck.rows.forEach((report, idx) => {
                console.log(`${idx + 1}. ${report.patient_name || 'Unknown'}`);
                console.log(`   Insulin: ${report.insulin} μU/mL - ${report.insulin_status}`);
                if (report.c_peptide) {
                    console.log(`   C-Peptide: ${report.c_peptide} ng/mL`);
                }
                console.log('');
            });
        } else {
            console.log('No reports with insulin values found.');
        }

        // Check Dr. Nehru info
        console.log('\n📞 DR. NEHRU CONTACT INFO IN DATABASE:');
        console.log('-'.repeat(70));
        const doctorInfo = await pool.query(`
            SELECT 
                patient_name,
                extracted_data->'drNehruScore'->'doctorInfo'->>'name' as doctor_name,
                extracted_data->'drNehruScore'->'doctorInfo'->>'phone' as phone,
                extracted_data->'drNehruScore'->'doctorInfo'->>'website' as website
            FROM lab_reports
            WHERE extracted_data->'drNehruScore' IS NOT NULL
            ORDER BY uploaded_at DESC
            LIMIT 1
        `);

        if (doctorInfo.rows.length > 0) {
            const doc = doctorInfo.rows[0];
            console.log('✅ Doctor info found in latest report:');
            console.log(`   Name: ${doc.doctor_name}`);
            console.log(`   Phone: ${doc.phone}`);
            console.log(`   Website: ${doc.website}`);
        } else {
            console.log('⚠️  No doctor info found (no new reports yet)');
        }
        console.log('');

        console.log('\n' + '='.repeat(70));
        console.log('✅ DATABASE VERIFICATION COMPLETE!');
        console.log('='.repeat(70) + '\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
}

verifyDatabase();

