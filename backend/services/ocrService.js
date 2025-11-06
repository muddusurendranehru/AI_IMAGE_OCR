// OCR Service - Handles OCR processing with Tesseract and Google Vision API
const Tesseract = require('tesseract.js');
const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

// Try to load pdf-poppler (optional - requires system poppler-utils)
let pdfPoppler = null;
try {
    pdfPoppler = require('pdf-poppler');
    console.log('✅ pdf-poppler loaded successfully');
} catch (error) {
    console.warn('⚠️ pdf-poppler not available (requires poppler-utils system package)');
    console.warn('   Will use pdf-parse only for PDF processing');
}

// Initialize Google Vision client (if API key is provided)
let visionClient = null;
if (process.env.GOOGLE_VISION_API_KEY) {
    visionClient = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_VISION_API_KEY
    });
}

/**
 * Check if file is a PDF
 */
function isPDF(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.pdf';
}

/**
 * Process PDF file - Extract text directly from PDF OR run OCR on scanned PDFs
 */
async function processWithPDF(pdfPath) {
    try {
        console.log('📄 Processing PDF file...');
        const dataBuffer = await fs.readFile(pdfPath);
        
        // Step 1: Try to extract text directly (for searchable PDFs)
        const data = await pdfParse(dataBuffer);
        
        console.log(`📊 PDF: ${data.numpages} page(s), ${data.text.length} chars extracted`);
        
        // Step 2: Check if PDF has searchable text
        if (data.text && data.text.trim().length > 50) {
            // PDF has searchable text - use it directly
            console.log('✅ PDF has searchable text - using direct extraction');
            return {
                text: data.text,
                confidence: 95,
                pages: data.numpages
            };
        }
        
        // Step 3: PDF is image-based or has no text - run OCR
        console.log('⚠️ PDF has no text or very little - treating as image-based PDF');
        
        // Check if pdf-poppler is available
        if (!pdfPoppler) {
            console.warn('⚠️ pdf-poppler not available - cannot process image-based PDFs');
            console.warn('   Returning extracted text (may be incomplete)');
            return {
                text: data.text || 'PDF appears to be image-based but OCR tools not available on this system. Please upload images instead.',
                confidence: 50,
                pages: data.numpages,
                warning: 'Image-based PDF detected but OCR unavailable'
            };
        }
        
        console.log('🔄 Converting PDF pages to images and running OCR...');
        
        const outputDir = path.dirname(pdfPath);
        const outputPrefix = 'pdf_page';
        
        // Convert PDF to images
        const opts = {
            format: 'jpeg',
            out_dir: outputDir,
            out_prefix: outputPrefix,
            page: null // Convert all pages
        };
        
        await pdfPoppler.convert(pdfPath, opts);
        
        // Find generated images
        const files = await fs.readdir(outputDir);
        const imageFiles = files.filter(f => f.startsWith(outputPrefix) && f.endsWith('.jpg'));
        imageFiles.sort(); // Ensure correct page order
        
        console.log(`📄 Converted ${imageFiles.length} pages to images`);
        
        let allText = '';
        let totalConfidence = 0;
        
        // Run OCR on each page
        for (let i = 0; i < imageFiles.length; i++) {
            const imagePath = path.join(outputDir, imageFiles[i]);
            console.log(`🔍 OCR on page ${i + 1}/${imageFiles.length}...`);
            
            try {
                const pageResult = await processWithTesseract(imagePath);
                allText += `\n===== PAGE ${i + 1} =====\n${pageResult.text}\n`;
                totalConfidence += pageResult.confidence;
                
                // Clean up temporary image
                await fs.unlink(imagePath);
            } catch (ocrError) {
                console.error(`Error OCR page ${i + 1}:`, ocrError.message);
            }
        }
        
        const avgConfidence = imageFiles.length > 0 ? totalConfidence / imageFiles.length : 0;
        
        console.log(`✅ OCR complete! ${allText.length} chars, confidence: ${avgConfidence.toFixed(1)}%`);
        
        return {
            text: allText,
            confidence: avgConfidence,
            pages: imageFiles.length
        };
        
    } catch (error) {
        console.error('PDF processing error:', error);
        throw new Error(`PDF processing failed: ${error.message}`);
    }
}

/**
 * Process lab report image or PDF with OCR
 * @param {string} imagePath - Path to the image or PDF file
 * @returns {Promise<Object>} - OCR results with extracted text and structured data
 */
async function processLabReport(imagePath) {
    try {
        console.log('🔍 Starting OCR processing for:', imagePath);
        
        let ocrText = '';
        let confidence = 0;
        let processingMethod = '';
        
        // Check if file is PDF
        if (isPDF(imagePath)) {
            console.log('📄 Detected PDF file - extracting text directly...');
            const result = await processWithPDF(imagePath);
            ocrText = result.text;
            confidence = result.confidence;
            processingMethod = 'pdf-parse';
        }
        // Choose OCR method for images
        else if (process.env.USE_TESSERACT === 'true' || !visionClient) {
            console.log('📝 Using Tesseract OCR...');
            const result = await processWithTesseract(imagePath);
            ocrText = result.text;
            confidence = result.confidence;
            processingMethod = 'tesseract';
        } else {
            console.log('☁️ Using Google Vision API...');
            const result = await processWithGoogleVision(imagePath);
            ocrText = result.text;
            confidence = result.confidence;
            processingMethod = 'google-vision';
        }
        
        // Extract structured data from OCR text
        const extractedData = extractLabData(ocrText);
        
        console.log('✅ OCR processing complete!');
        console.log(`📊 Confidence: ${confidence}%`);
        console.log(`📝 Extracted ${ocrText.length} characters`);
        
        return {
            success: true,
            ocrText,
            extractedData,
            confidence,
            processingMethod
        };
        
    } catch (error) {
        console.error('❌ OCR processing failed:', error);
        return {
            success: false,
            error: error.message,
            ocrText: '',
            extractedData: {},
            confidence: 0
        };
    }
}

/**
 * Process image with Tesseract OCR
 */
async function processWithTesseract(imagePath) {
    try {
        const result = await Tesseract.recognize(
            imagePath,
            'eng',
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`🔄 Tesseract progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            }
        );
        
        return {
            text: result.data.text,
            confidence: result.data.confidence || 0
        };
    } catch (error) {
        throw new Error(`Tesseract OCR failed: ${error.message}`);
    }
}

/**
 * Process image with Google Vision API
 */
async function processWithGoogleVision(imagePath) {
    try {
        const [result] = await visionClient.textDetection(imagePath);
        const detections = result.textAnnotations;
        
        if (!detections || detections.length === 0) {
            throw new Error('No text detected in image');
        }
        
        const text = detections[0].description;
        const confidence = 95; // Google Vision doesn't provide confidence for text detection
        
        return { text, confidence };
    } catch (error) {
        throw new Error(`Google Vision API failed: ${error.message}`);
    }
}

/**
 * Extract structured lab data from OCR text
 * This function looks for common lab report patterns
 */
function extractLabData(ocrText) {
    const testResultsData = extractTestResults(ocrText);
    
    const extractedData = {
        patientInfo: extractPatientInfo(ocrText),
        testResults: testResultsData.testResults,
        labValues: testResultsData.labValues, // Normalized values for HOMA-IQ
        reportDate: extractReportDate(ocrText),
        laboratoryName: extractLaboratoryName(ocrText)
    };
    
    return extractedData;
}

/**
 * Extract patient information from text
 */
function extractPatientInfo(text) {
    const patientInfo = {};
    
    // Extract patient ID (common patterns: P001, PAT123, Patient ID: 123)
    const patientIdMatch = text.match(/(?:Patient ID|Pat ID|ID|Patient No)[:\s]+([A-Z0-9]+)/i);
    if (patientIdMatch) {
        patientInfo.id = patientIdMatch[1];
    }
    
    // Extract patient name (common patterns: Name: John Doe, Patient: John Doe)
    const nameMatch = text.match(/(?:Patient Name|Name|Patient)[:\s]+([A-Za-z\s]+?)(?:\n|,|$)/i);
    if (nameMatch) {
        patientInfo.name = nameMatch[1].trim();
    }
    
    // Extract age
    const ageMatch = text.match(/(?:Age|Age\/Sex)[:\s]+(\d+)/i);
    if (ageMatch) {
        patientInfo.age = parseInt(ageMatch[1]);
    }
    
    // Extract gender
    const genderMatch = text.match(/(?:Gender|Sex)[:\s]+(Male|Female|M|F)/i);
    if (genderMatch) {
        patientInfo.gender = genderMatch[1];
    }
    
    return patientInfo;
}

/**
 * Fix common OCR decimal point errors
 * Example: "1686" should be "16.86" for insulin
 * Example: "514" should be "5.14" for c-peptide
 */
function fixOCRDecimalErrors(testName, value) {
    // Skip if already has decimal point
    if (value.toString().includes('.')) {
        return parseFloat(value);
    }
    
    const numValue = parseFloat(value);
    
    // Insulin: typically 2-25 μU/mL, if > 100 likely missing decimal
    if (testName.toLowerCase().includes('insulin') && numValue > 100 && numValue < 10000) {
        console.log(`🔧 Fixed insulin decimal: ${numValue} → ${numValue / 100}`);
        return numValue / 100; // 1686 → 16.86
    }
    
    // C-Peptide: typically 0.5-3.0 ng/mL, if > 50 likely missing decimal
    if (testName.toLowerCase().includes('c-peptide') || testName.toLowerCase().includes('cpeptide') || testName.toLowerCase().includes('c peptide')) {
        if (numValue > 50 && numValue < 10000) {
            console.log(`🔧 Fixed C-peptide decimal: ${numValue} → ${numValue / 100}`);
            return numValue / 100; // 514 → 5.14
        }
    }
    
    // TSH: typically 0.5-5.0 μIU/mL, if > 50 likely missing decimal
    if (testName.toLowerCase().includes('tsh') && numValue > 50 && numValue < 10000) {
        console.log(`🔧 Fixed TSH decimal: ${numValue} → ${numValue / 100}`);
        return numValue / 100;
    }
    
    // Creatinine: typically 0.5-1.5 mg/dL, if > 15 likely missing decimal
    if (testName.toLowerCase().includes('creatinine') && numValue > 15 && numValue < 1000) {
        console.log(`🔧 Fixed Creatinine decimal: ${numValue} → ${numValue / 100}`);
        return numValue / 100;
    }
    
    return numValue;
}

/**
 * Extract test results from text - Enhanced for HOMA-IQ Score
 */
function extractTestResults(text) {
    const testResults = [];
    const labValues = {}; // Normalized key-value pairs for HOMA-IQ calculation
    
    // Enhanced lab test patterns for metabolic/clinical parameters
    const testPatterns = [
        // === CRITICAL FOR HOMA-IQ SCORE ===
        
        // Blood Glucose/Sugar (most important for HOMA-IQ)
        { 
            pattern: /(?:Fasting Blood Sugar|FBS|Fasting Glucose|Blood Glucose|Glucose|Blood Sugar)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mg\/dl|mgdl)?/gi,
            key: 'glucose',
            name: 'Fasting Blood Sugar'
        },
        
        // Post-lunch Blood Sugar
        {
            pattern: /(?:Post-lunch Blood Sugar|Post Lunch Blood Sugar|PP Blood Sugar|PPBS|Post Prandial)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mg\/dl|mgdl)?/gi,
            key: 'postLunchSugar',
            name: 'Post-lunch Blood Sugar'
        },
        
        // Insulin (for HOMA-IR calculation)
        {
            pattern: /(?:Insulin|Fasting Insulin|Serum Insulin)[:\s]+(\d+\.?\d*)\s*(?:μU\/mL|uU\/mL|mU\/L|International Units|IU)?/gi,
            key: 'insulin',
            name: 'Insulin'
        },
        
        // C-Peptide (diabetes marker)
        {
            pattern: /(?:C-Peptide|C Peptide|CPeptide)[:\s]+(\d+\.?\d*)\s*(?:ng\/mL|ng\/ml)?/gi,
            key: 'c_peptide',
            name: 'C-Peptide'
        },
        
        // HbA1c (critical diabetes marker)
        {
            pattern: /(?:HbA1c|HbA1C|Hb A1c|A1C|Glycated Hemoglobin|Glycosylated Hemoglobin)[:\s]+(\d+\.?\d*)\s*(?:%)?/gi,
            key: 'hba1c',
            name: 'HbA1c'
        },
        
        // Total Cholesterol
        {
            pattern: /(?:Total Cholesterol|Cholesterol Total|Cholesterol)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mg\/dl)?/gi,
            key: 'cholesterol',
            name: 'Total Cholesterol'
        },
        
        // HDL Cholesterol (good cholesterol)
        {
            pattern: /(?:HDL|HDL Cholesterol|HDL-C)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mg\/dl)?/gi,
            key: 'hdl',
            name: 'HDL Cholesterol'
        },
        
        // LDL Cholesterol (bad cholesterol)
        {
            pattern: /(?:LDL|LDL Cholesterol|LDL-C)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mg\/dl)?/gi,
            key: 'ldl',
            name: 'LDL Cholesterol'
        },
        
        // Triglycerides
        {
            pattern: /(?:Triglycerides|TG|Triglyceride)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mg\/dl)?/gi,
            key: 'triglycerides',
            name: 'Triglycerides'
        },
        
        // VLDL Cholesterol
        {
            pattern: /(?:VLDL|VLDL Cholesterol|VLDL-C)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mg\/dl)?/gi,
            key: 'vldl',
            name: 'VLDL Cholesterol'
        },
        
        // === PHYSICAL MEASUREMENTS (for BMI calculation) ===
        
        // Weight
        {
            pattern: /(?:Weight|Body Weight|Wt)[:\s]+(\d+\.?\d*)\s*(?:kg|kgs|kilograms?)?/gi,
            key: 'weight',
            name: 'Weight'
        },
        
        // Height
        {
            pattern: /(?:Height|Ht)[:\s]+(\d+\.?\d*)\s*(?:cm|centimeters?)?/gi,
            key: 'height',
            name: 'Height'
        },
        
        // Waist Circumference
        {
            pattern: /(?:Waist Circumference|Waist|Abdominal Circumference)[:\s]+(\d+\.?\d*)\s*(?:cm|centimeters?|inches?)?/gi,
            key: 'waist',
            name: 'Waist Circumference'
        },
        
        // === OTHER COMMON LAB VALUES ===
        
        // Complete Blood Count
        {
            pattern: /(?:Hemoglobin|Hb|HGB)[:\s]+(\d+\.?\d*)\s*(?:g\/dL|gm\/dl)?/gi,
            key: 'hemoglobin',
            name: 'Hemoglobin'
        },
        {
            pattern: /(?:WBC|White Blood Cell|Leucocyte Count)[:\s]+(\d+\.?\d*)\s*(?:cells\/cumm|\/cmm|x10\^3\/uL)?/gi,
            key: 'wbc',
            name: 'WBC'
        },
        {
            pattern: /(?:RBC|Red Blood Cell)[:\s]+(\d+\.?\d*)\s*(?:million\/cumm|x10\^6\/uL)?/gi,
            key: 'rbc',
            name: 'RBC'
        },
        {
            pattern: /(?:Platelet|PLT|Platelet Count)[:\s]+(\d+\.?\d*)\s*(?:lakhs\/cumm|x10\^3\/uL)?/gi,
            key: 'platelet',
            name: 'Platelet'
        },
        
        // Liver Function Tests
        {
            pattern: /(?:SGOT|AST)[:\s]+(\d+\.?\d*)\s*(?:U\/L|IU\/L)?/gi,
            key: 'sgot',
            name: 'SGOT/AST'
        },
        {
            pattern: /(?:SGPT|ALT)[:\s]+(\d+\.?\d*)\s*(?:U\/L|IU\/L)?/gi,
            key: 'sgpt',
            name: 'SGPT/ALT'
        },
        {
            pattern: /(?:Bilirubin|Total Bilirubin)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL)?/gi,
            key: 'bilirubin',
            name: 'Bilirubin'
        },
        
        // Kidney Function Tests
        {
            pattern: /(?:Creatinine|Serum Creatinine)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL)?/gi,
            key: 'creatinine',
            name: 'Creatinine'
        },
        {
            pattern: /(?:Urea|Blood Urea|BUN)[:\s]+(\d+\.?\d*)\s*(?:mg\/dL)?/gi,
            key: 'urea',
            name: 'Blood Urea'
        },
        
        // Thyroid Function
        {
            pattern: /(?:TSH|Thyroid Stimulating Hormone)[:\s]+(\d+\.?\d*)\s*(?:μIU\/mL|mIU\/L)?/gi,
            key: 'tsh',
            name: 'TSH'
        },
        {
            pattern: /(?:T3|Triiodothyronine)[:\s]+(\d+\.?\d*)\s*(?:ng\/dL)?/gi,
            key: 't3',
            name: 'T3'
        },
        {
            pattern: /(?:T4|Thyroxine)[:\s]+(\d+\.?\d*)\s*(?:μg\/dL)?/gi,
            key: 't4',
            name: 'T4'
        }
    ];
    
    // Extract matches using enhanced patterns
    testPatterns.forEach(testPattern => {
        const regex = new RegExp(testPattern.pattern.source, testPattern.pattern.flags);
        let match;
        
        // Find all matches for this pattern
        const matches = [];
        while ((match = regex.exec(text)) !== null) {
            matches.push(match);
        }
        
        // Use the last match (often the actual value, not reference range)
        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            const rawValue = parseFloat(lastMatch[1]);
            
            // Fix common OCR decimal point errors
            const value = fixOCRDecimalErrors(testPattern.name, rawValue);
            
            if (!isNaN(value) && value > 0) {
                testResults.push({
                    testName: testPattern.name,
                    value: value,
                    rawText: lastMatch[0],
                    key: testPattern.key
                });
                
                // Store in normalized labValues for HOMA-IQ calculation
                if (!labValues[testPattern.key]) {
                    labValues[testPattern.key] = value;
                }
            }
        }
    });
    
    // Return both formats
    return {
        testResults: testResults,
        labValues: labValues
    };
}

/**
 * Extract report date from text
 */
function extractReportDate(text) {
    // Common date patterns
    const datePatterns = [
        /(?:Date|Report Date|Collection Date)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        /(?:Date|Report Date|Collection Date)[:\s]+(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i
    ];
    
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}

/**
 * Extract laboratory name from text
 */
function extractLaboratoryName(text) {
    // Usually at the top of the report
    const lines = text.split('\n').slice(0, 5);
    
    // Look for common patterns
    for (const line of lines) {
        if (line.match(/(?:Laboratory|Lab|Diagnostics|Pathology|Medical Center)/i)) {
            return line.trim();
        }
    }
    
    return null;
}

/**
 * Validate if uploaded image is a lab report
 */
function validateLabReport(ocrText) {
    // Check for common lab report keywords
    const labKeywords = [
        'laboratory', 'lab', 'test', 'result', 'patient', 
        'hemoglobin', 'glucose', 'blood', 'urine', 'report',
        'pathology', 'diagnostics', 'clinical'
    ];
    
    const textLower = ocrText.toLowerCase();
    const foundKeywords = labKeywords.filter(keyword => textLower.includes(keyword));
    
    return {
        isValid: foundKeywords.length >= 2,
        confidence: (foundKeywords.length / labKeywords.length) * 100,
        foundKeywords
    };
}

module.exports = {
    processLabReport,
    validateLabReport,
    extractLabData
};

