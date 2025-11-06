// Lab Report Controller - Handles all lab report operations
const db = require('../config/db');
const ocrService = require('../services/ocrService');
const homaIqService = require('../services/homaIqService');
const healthMetricsService = require('../services/healthMetricsService');
const drNehruScoringSystem = require('../services/drNehruScoringSystem');
const path = require('path');
const fs = require('fs').promises;

/**
 * Upload and process lab report
 * POST /api/reports/upload
 */
const uploadLabReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please upload an image.'
            });
        }

        const { patientId, patientName, reportType } = req.body;
        const userId = req.user.userId;
        const imagePath = req.file.path;

        console.log('📤 Uploading lab report:', req.file.filename);
        console.log('👤 Patient ID:', patientId);
        console.log('📋 Report Type:', reportType);

        // Process image with OCR
        const ocrResult = await ocrService.processLabReport(imagePath);

        if (!ocrResult.success) {
            return res.status(500).json({
                success: false,
                error: 'OCR processing failed: ' + ocrResult.error
            });
        }

        // Validate if it's a lab report
        const validation = ocrService.validateLabReport(ocrResult.ocrText);
        
        if (!validation.isValid) {
            console.log('⚠️ Uploaded image might not be a lab report');
        }

        // Calculate HOMA-IQ Score if lab values are available
        let homaIqResult = null;
        let healthMetrics = null;
        
        if (ocrResult.extractedData.labValues && Object.keys(ocrResult.extractedData.labValues).length > 0) {
            console.log('🧮 Calculating HOMA-IQ Score...');
            homaIqResult = homaIqService.calculateHomaIQScore(ocrResult.extractedData.labValues);
            
            if (homaIqResult.success) {
                console.log(`✅ HOMA-IQ Score: ${homaIqResult.homaIQScore} (${homaIqResult.riskLevel})`);
                if (homaIqResult.abnormalCount > 0) {
                    console.log(`⚠️ ${homaIqResult.abnormalCount} abnormal parameter(s) detected`);
                }
            }
            
            // Calculate Health Metrics (HOMA-IR, TYG Index, BMI, Waist)
            console.log('📊 Calculating Health Metrics (Speedometer Gauges)...');
            const patientData = {
                weight: extractValue(ocrResult.extractedData, ['weight', 'body weight', 'wt']),
                height: extractValue(ocrResult.extractedData, ['height', 'ht']),
                waist: extractValue(ocrResult.extractedData, ['waist', 'waist circumference', 'wc'])
            };
            
            healthMetrics = healthMetricsService.calculateAllHealthMetrics(
                ocrResult.extractedData.labValues,
                patientData
            );
            
            // Log calculated metrics
            if (healthMetrics.homaIR) {
                console.log(`📈 HOMA-IR: ${healthMetrics.homaIR.value} (${healthMetrics.homaIR.status})`);
            }
            if (healthMetrics.tygIndex) {
                console.log(`📈 TYG Index: ${healthMetrics.tygIndex.value} (${healthMetrics.tygIndex.status})`);
            }
            if (healthMetrics.bmi) {
                console.log(`📈 BMI: ${healthMetrics.bmi.value} (${healthMetrics.bmi.status})`);
            }
            if (healthMetrics.waistCircumference) {
                console.log(`📈 Waist: ${healthMetrics.waistCircumference.value} cm (${healthMetrics.waistCircumference.status})`);
            }
        }
        
        // Helper function to extract patient data values
        function extractValue(data, possibleKeys) {
            for (const key of possibleKeys) {
                if (data[key]) return parseFloat(data[key]);
                if (data.patientInfo && data.patientInfo[key]) return parseFloat(data.patientInfo[key]);
            }
            return null;
        }

        // Save to database with HOMA-IQ score
        const result = await db.query(
            `INSERT INTO lab_reports 
            (patient_id, patient_name, report_type, image_path, ocr_text, extracted_data, status, uploaded_by, processed_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING *`,
            [
                patientId || ocrResult.extractedData.patientInfo?.id || null,
                patientName || ocrResult.extractedData.patientInfo?.name || null,
                reportType || 'General',
                imagePath,
                ocrResult.ocrText,
                JSON.stringify({
                    ...ocrResult.extractedData,
                    homaIqScore: homaIqResult, // Include HOMA-IQ score in extracted data
                    healthMetrics: healthMetrics // Include speedometer metrics
                }),
                'completed',
                userId
            ]
        );

        const labReport = result.rows[0];

        console.log('✅ Lab report saved with ID:', labReport.id);

        // Prepare response with HOMA-IQ score
        const responseData = {
            success: true,
            message: 'Lab report uploaded and processed successfully!',
            report: {
                id: labReport.id,
                patientId: labReport.patient_id,
                patientName: labReport.patient_name,
                reportType: labReport.report_type,
                ocrText: labReport.ocr_text,
                extractedData: labReport.extracted_data,
                status: labReport.status,
                uploadedAt: labReport.uploaded_at,
                processedAt: labReport.processed_at
            },
            ocrConfidence: ocrResult.confidence,
            validation: validation
        };

        // Add HOMA-IQ score to response if available
        if (homaIqResult && homaIqResult.success) {
            responseData.homaIqScore = {
                score: homaIqResult.homaIQScore,
                riskLevel: homaIqResult.riskLevel,
                riskColor: homaIqResult.riskColor,
                abnormalCount: homaIqResult.abnormalCount,
                abnormalParameters: homaIqResult.abnormalParameters
            };
            
            // Update success message if abnormal parameters found
            if (homaIqResult.abnormalCount > 0) {
                responseData.message = `Lab report processed! HOMA-IQ Score: ${homaIqResult.homaIQScore}/100 (${homaIqResult.riskLevel}). ${homaIqResult.abnormalCount} parameter(s) need attention.`;
            } else {
                responseData.message = `Lab report processed! HOMA-IQ Score: ${homaIqResult.homaIQScore}/100 (${homaIqResult.riskLevel}). All parameters normal.`;
            }
        }

        res.status(201).json(responseData);

    } catch (error) {
        console.error('❌ Upload lab report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload and process lab report.'
        });
    }
};

/**
 * Get all lab reports (ONLY for logged-in user)
 * GET /api/reports
 */
const getAllReports = async (req, res) => {
    try {
        const { page = 1, limit = 20, patientId, status } = req.query;
        const userId = req.user.userId;  // Get logged-in user ID
        const offset = (page - 1) * limit;

        // Build query with filters - FILTER BY USER!
        let queryText = `
            SELECT 
                lr.*,
                u.email as uploaded_by_email,
                u.full_name as uploaded_by_name
            FROM lab_reports lr
            LEFT JOIN users u ON lr.uploaded_by = u.id
            WHERE lr.uploaded_by = $1
        `;
        const queryParams = [userId];  // Start with user filter
        let paramCounter = 2;

        if (patientId) {
            queryText += ` AND lr.patient_id = $${paramCounter}`;
            queryParams.push(patientId);
            paramCounter++;
        }

        if (status) {
            queryText += ` AND lr.status = $${paramCounter}`;
            queryParams.push(status);
            paramCounter++;
        }

        queryText += ` ORDER BY lr.uploaded_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        queryParams.push(parseInt(limit), offset);

        const result = await db.query(queryText, queryParams);

        // Get total count FOR THIS USER ONLY
        const countResult = await db.query(
            'SELECT COUNT(*) FROM lab_reports WHERE uploaded_by = $1',
            [userId]
        );
        const totalReports = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            reports: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReports / limit),
                totalReports,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('❌ Get all reports error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lab reports.'
        });
    }
};

/**
 * Get single lab report by ID
 * GET /api/reports/:id
 */
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT 
                lr.*,
                u.email as uploaded_by_email,
                u.full_name as uploaded_by_name
            FROM lab_reports lr
            LEFT JOIN users u ON lr.uploaded_by = u.id
            WHERE lr.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lab report not found.'
            });
        }

        res.json({
            success: true,
            report: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Get report by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lab report.'
        });
    }
};

/**
 * Update lab report (for manual corrections)
 * PUT /api/reports/:id
 */
const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { patientId, patientName, reportType, ocrText, extractedData } = req.body;

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCounter = 1;

        if (patientId !== undefined) {
            updates.push(`patient_id = $${paramCounter}`);
            values.push(patientId);
            paramCounter++;
        }

        if (patientName !== undefined) {
            updates.push(`patient_name = $${paramCounter}`);
            values.push(patientName);
            paramCounter++;
        }

        if (reportType !== undefined) {
            updates.push(`report_type = $${paramCounter}`);
            values.push(reportType);
            paramCounter++;
        }

        if (ocrText !== undefined) {
            updates.push(`ocr_text = $${paramCounter}`);
            values.push(ocrText);
            paramCounter++;
        }

        if (extractedData !== undefined) {
            updates.push(`extracted_data = $${paramCounter}`);
            values.push(JSON.stringify(extractedData));
            paramCounter++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update.'
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const queryText = `
            UPDATE lab_reports 
            SET ${updates.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;

        const result = await db.query(queryText, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lab report not found.'
            });
        }

        console.log('✅ Lab report updated:', id);

        res.json({
            success: true,
            message: 'Lab report updated successfully!',
            report: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Update report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update lab report.'
        });
    }
};

/**
 * Delete lab report
 * DELETE /api/reports/:id
 */
const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        // Get image path before deleting
        const reportResult = await db.query(
            'SELECT image_path FROM lab_reports WHERE id = $1',
            [id]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lab report not found.'
            });
        }

        const imagePath = reportResult.rows[0].image_path;

        // Delete from database
        await db.query('DELETE FROM lab_reports WHERE id = $1', [id]);

        // Delete image file
        try {
            await fs.unlink(imagePath);
            console.log('🗑️ Image file deleted:', imagePath);
        } catch (err) {
            console.log('⚠️ Could not delete image file:', err.message);
        }

        console.log('✅ Lab report deleted:', id);

        res.json({
            success: true,
            message: 'Lab report deleted successfully!'
        });

    } catch (error) {
        console.error('❌ Delete report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete lab report.'
        });
    }
};

/**
 * Search lab reports (ONLY for logged-in user)
 * GET /api/reports/search
 */
const searchReports = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.userId;  // Get logged-in user ID

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required.'
            });
        }

        const result = await db.query(
            `SELECT 
                lr.*,
                u.email as uploaded_by_email,
                u.full_name as uploaded_by_name
            FROM lab_reports lr
            LEFT JOIN users u ON lr.uploaded_by = u.id
            WHERE 
                lr.uploaded_by = $2 AND (
                    lr.patient_id ILIKE $1 OR
                    lr.patient_name ILIKE $1 OR
                    lr.report_type ILIKE $1 OR
                    lr.ocr_text ILIKE $1
                )
            ORDER BY lr.uploaded_at DESC
            LIMIT 50`,
            [`%${query}%`, userId]
        );

        res.json({
            success: true,
            query: query,
            results: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('❌ Search reports error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search lab reports.'
        });
    }
};
const batchUploadLabReports = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const { patientId, patientName, reportType } = req.body;
        const userId = req.user.userId;
        const files = req.files;

        console.log(`📚 Batch: ${files.length} files for ${patientName}`);

        let allOcrText = '';
        let allLabValues = {};

        for (let i = 0; i < files.length; i++) {
            console.log(`📄 ${i+1}/${files.length}: ${files[i].filename}`);
            const ocrResult = await ocrService.processLabReport(files[i].path);

            if (ocrResult.success) {
                allOcrText += `\n===== ${files[i].originalname} =====\n${ocrResult.ocrText}`;
                if (ocrResult.extractedData.labValues) {
                    allLabValues = { ...allLabValues, ...ocrResult.extractedData.labValues };
                }
            }
        }

        let homaIqResult = null;
        let healthMetrics = null;

        if (Object.keys(allLabValues).length > 0) {
            homaIqResult = homaIqService.calculateHomaIQScore(allLabValues);
            healthMetrics = healthMetricsService.calculateAllHealthMetrics(allLabValues, {});
        }

        const result = await db.query(
            `INSERT INTO lab_reports 
            (patient_id, patient_name, report_type, image_path, ocr_text, extracted_data, status, uploaded_by, processed_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING *`,
            [
                patientId,
                patientName,
                `Batch (${files.length} files)`,
                files[0].path.replace(/\\/g, '/'),
                allOcrText,
                JSON.stringify({
                    labValues: allLabValues,
                    homaIqScore: homaIqResult,
                    healthMetrics: healthMetrics,
                    batchInfo: { totalFiles: files.length, fileNames: files.map(f => f.originalname) }
                }),
                'completed',
                userId
            ]
        );

        res.json({ success: true, report: result.rows[0], filesProcessed: files.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Finalize Report with Human-Verified Data
 * Takes user-confirmed lab values and calculates health metrics
 */
const finalizeReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const confirmedData = req.body;

        console.log(`📝 Finalizing report ${reportId} with human-verified data`);

        // Convert form data to labValues format
        const labValues = {
            glucose: parseFloat(confirmedData.fbs) || null,
            postLunchSugar: parseFloat(confirmedData.postLunch) || null,
            insulin: parseFloat(confirmedData.insulin) || null,
            cholesterol: parseFloat(confirmedData.cholesterol) || null,
            hdl: parseFloat(confirmedData.hdl) || null,
            ldl: parseFloat(confirmedData.ldl) || null,
            triglycerides: parseFloat(confirmedData.triglycerides) || null,
            vldl: parseFloat(confirmedData.vldl) || null,
            hba1c: parseFloat(confirmedData.hba1c) || null,
            weight: parseFloat(confirmedData.weight) || null,
            height: parseFloat(confirmedData.height) || null,
            waist: parseFloat(confirmedData.waist) || null,
        };

        // Remove null values
        Object.keys(labValues).forEach(key => {
            if (labValues[key] === null) delete labValues[key];
        });

        console.log('✅ Parsed lab values:', labValues);

        // Prepare patient data with additional risk factors
        const patientData = {
            age: parseInt(confirmedData.age) || null,
            gender: confirmedData.sex || null,
            weight: parseFloat(confirmedData.weight) || null,
            height: parseFloat(confirmedData.height) || null,
            waist: parseFloat(confirmedData.waist) || null,
            familyHistory: {
                diabetes: confirmedData.familyHistoryDM === 'yes' || confirmedData.familyHistoryDM === true,
                hypertension: confirmedData.familyHistoryHTM === 'yes' || confirmedData.familyHistoryHTM === true,
                cad: confirmedData.familyHistoryCAD === 'yes' || confirmedData.familyHistoryCAD === true
            },
            pastHistory: {
                cad: confirmedData.pastHistoryCAD === 'yes' || confirmedData.pastHistoryCAD === true,
                cva: confirmedData.pastHistoryCVA === 'yes' || confirmedData.pastHistoryCVA === true,
                cancer: confirmedData.pastHistoryCancer === 'yes' || confirmedData.pastHistoryCancer === true,
                ptca: confirmedData.pastHistoryPTCA === 'yes' || confirmedData.pastHistoryPTCA === true
            },
            lifestyle: {
                smoking: confirmedData.smoking === 'yes' || confirmedData.smoking === true,
                alcohol: confirmedData.alcohol === 'yes' || confirmedData.alcohol === true,
                pan: confirmedData.pan === 'yes' || confirmedData.pan === true,
                drugs: confirmedData.drugs === 'yes' || confirmedData.drugs === true
            }
        };

        // Calculate Dr. Nehru's Metabolic Risk Score (NEW SCORING SYSTEM)
        const drNehruScore = drNehruScoringSystem.calculateDrNehruScore(labValues, patientData);
        console.log('✅ Dr. Nehru Score calculated:', drNehruScore.score, '/', drNehruScore.maxScore);

        // Also calculate old HOMA-IQ for reference
        let homaIqResult = null;
        if (labValues.glucose && labValues.insulin) {
            homaIqResult = homaIqService.calculateHomaIQScore(labValues);
        }

        // Calculate Health Metrics (BMI, TYG, HOMA-IR, etc.)
        const healthMetrics = healthMetricsService.calculateAllHealthMetrics(labValues, patientData);
        console.log('✅ Health Metrics calculated:', healthMetrics);

        // Update the report with calculated data
        const updatedExtractedData = {
            labValues: labValues,
            drNehruScore: drNehruScore,  // NEW PRIMARY SCORE
            homaIqScore: homaIqResult,   // OLD SCORE (for reference)
            healthMetrics: healthMetrics,
            patientInfo: {
                name: confirmedData.patientName || null,
                id: confirmedData.patientId || null,
                age: patientData.age,
                sex: patientData.gender,
            },
            riskFactors: {
                familyHistory: patientData.familyHistory,
                pastHistory: patientData.pastHistory,
                lifestyle: patientData.lifestyle
            },
            humanVerified: true,
            verifiedAt: new Date().toISOString(),
        };

        const result = await db.query(
            `UPDATE lab_reports 
            SET extracted_data = $1, 
                patient_name = $2,
                patient_id = $3,
                processed_at = NOW()
            WHERE id = $4
            RETURNING *`,
            [
                JSON.stringify(updatedExtractedData),
                confirmedData.patientName,
                confirmedData.patientId,
                reportId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        console.log('✅ Report finalized successfully');

        res.json({
            success: true,
            report: result.rows[0],
            message: 'Report finalized with verified data'
        });

    } catch (error) {
        console.error('❌ Error finalizing report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    uploadLabReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport,
    searchReports,
    batchUploadLabReports,
    finalizeReport
};

