// PDF Health Scanner - Frontend-only PDF parsing component
// Extracts health metrics from PDF lab reports without backend
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './PDFHealthScanner.css';

// Set up PDF.js worker - use local worker from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PDFHealthScanner = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [error, setError] = useState('');

  // Health metrics reference ranges
  const RANGES = {
    fbs: { optimal: [70, 100], prediabetic: [100, 125], diabetic: 126 },
    cholesterol: { optimal: [0, 200], borderline: [200, 239], high: 240 },
    triglycerides: { optimal: [0, 150], borderline: [150, 199], high: 200 },
    hdl: { low: 40, optimal: 60 },
    ldl: { optimal: [0, 100], nearOptimal: [100, 129], borderline: [130, 159], high: 160 },
    hba1c: { normal: [0, 5.7], prediabetic: [5.7, 6.4], diabetic: 6.5 }
  };

  // Extract text from PDF
  const extractPDFText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (err) {
      throw new Error('Failed to extract text from PDF: ' + err.message);
    }
  };

  // Parse health metrics from extracted text
  const parseHealthMetrics = (text) => {
    const metrics = {};

    // Split text into lines for better parsing
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    // Try to find label-value pairs across lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const nextLine = lines[i + 1] || '';
      
      // Look for numeric values in current or next line
      const currentNumbers = line.match(/\d+\.?\d*/g) || [];
      const nextNumbers = nextLine.match(/\d+\.?\d*/g) || [];
      
      // Fasting Blood Sugar
      if (/fasting\s*blood\s*sugar/i.test(line) && !metrics.fbs) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 50 && val <= 400) {
            metrics.fbs = val;
            break;
          }
        }
      }
      
      // Post-lunch Blood Sugar
      if (/post[\s-]*lunch\s*blood\s*sugar/i.test(line) && !metrics.postLunch) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 50 && val <= 400) {
            metrics.postLunch = val;
            break;
          }
        }
      }
      
      // Total Cholesterol (but not HDL/LDL cholesterol)
      if (/total\s*cholesterol/i.test(line) && !/hdl|ldl/i.test(line) && !metrics.cholesterol) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 100 && val <= 500) {
            metrics.cholesterol = val;
            break;
          }
        }
      }
      
      // HDL Cholesterol
      if (/hdl\s*cholesterol/i.test(line) && !metrics.hdl) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 15 && val <= 150) {
            metrics.hdl = val;
            break;
          }
        }
      }
      
      // LDL Cholesterol
      if (/ldl\s*cholesterol/i.test(line) && !metrics.ldl) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 30 && val <= 400) {
            metrics.ldl = val;
            break;
          }
        }
      }
      
      // VLDL Cholesterol
      if (/vldl\s*cholesterol/i.test(line) && !metrics.vldl) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 5 && val <= 100) {
            metrics.vldl = val;
            break;
          }
        }
      }
      
      // Triglycerides
      if (/triglycerides/i.test(line) && !metrics.triglycerides) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 50 && val <= 1000) {
            metrics.triglycerides = val;
            break;
          }
        }
      }
      
      // Fasting Insulin
      if (/fasting\s*insulin/i.test(line) && !metrics.insulin) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 2 && val <= 100) {
            metrics.insulin = val;
            break;
          }
        }
      }
      
      // HbA1c
      if (/hba1c|hemoglobin\s*a1c|glycated\s*hemoglobin/i.test(line) && !metrics.hba1c) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 3 && val <= 20) {
            metrics.hba1c = val;
            break;
          }
        }
      }
      
      // Weight
      if (/weight\s*\(in\s*kg\)/i.test(line) && !metrics.weight) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 30 && val <= 300) {
            metrics.weight = val;
            break;
          }
        }
      }
      
      // Waist Circumference
      if (/waist\s*circumference/i.test(line) && !metrics.waist) {
        for (let num of [...currentNumbers, ...nextNumbers]) {
          const val = parseFloat(num);
          if (val >= 50 && val <= 200) {
            metrics.waist = val;
            break;
          }
        }
      }
    }

    // FBS / Fasting Blood Sugar / Glucose patterns - fallback
    const fbsPatterns = [
      /fasting\s*blood\s*sugar[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /fbs[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /fasting\s*glucose[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /glucose\s*fasting[:\s\(\)a-z/]*(\d+\.?\d*)/i
    ];

    // Post-lunch blood sugar
    const postLunchPatterns = [
      /post[\s-]*lunch\s*blood\s*sugar[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /post[\s-]*prandial[:\s\(\)a-z/]*(\d+\.?\d*)/i
    ];

    // Cholesterol patterns - very flexible
    const cholPatterns = [
      /total\s*cholesterol[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /cholesterol\s*total[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /cholesterol[:\s\(\)a-z/]*(\d+\.?\d*)(?!\s*hdl|\s*ldl)/i
    ];

    // Triglycerides patterns
    const trigPatterns = [
      /triglycerides?[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /tg[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /trigs?[:\s\(\)a-z/]*(\d+\.?\d*)/i
    ];

    // HDL patterns
    const hdlPatterns = [
      /hdl\s*cholesterol[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /hdl[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /high\s*density[:\s\(\)a-z/]*(\d+\.?\d*)/i
    ];

    // LDL patterns
    const ldlPatterns = [
      /ldl\s*cholesterol[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /ldl[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /low\s*density[:\s\(\)a-z/]*(\d+\.?\d*)/i
    ];

    // VLDL patterns
    const vldlPatterns = [
      /vldl\s*cholesterol[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /vldl[:\s\(\)a-z/]*(\d+\.?\d*)/i
    ];

    // HbA1c patterns
    const hba1cPatterns = [
      /hba1c[:\s\(\)a-z/%]*(\d+\.?\d*)/i,
      /hemoglobin\s*a1c[:\s\(\)a-z/%]*(\d+\.?\d*)/i,
      /glycated\s*hemoglobin[:\s\(\)a-z/%]*(\d+\.?\d*)/i,
      /a1c[:\s\(\)a-z/%]*(\d+\.?\d*)/i
    ];

    // Fasting Insulin patterns
    const insulinPatterns = [
      /fasting\s*insulin[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /insulin\s*fasting[:\s\(\)a-z/]*(\d+\.?\d*)/i,
      /insulin[:\s\(\)a-z/]*(\d+\.?\d*)/i
    ];

    // Extract values using all patterns
    for (let pattern of fbsPatterns) {
      const match = text.match(pattern);
      if (match && !metrics.fbs) {
        const value = parseFloat(match[1]);
        if (value > 30 && value < 500) { // Sanity check
          metrics.fbs = value;
          break;
        }
      }
    }

    for (let pattern of postLunchPatterns) {
      const match = text.match(pattern);
      if (match && !metrics.postLunch) {
        const value = parseFloat(match[1]);
        if (value > 30 && value < 500) {
          metrics.postLunch = value;
          break;
        }
      }
    }

    for (let pattern of cholPatterns) {
      const match = text.match(pattern);
      if (match && !metrics.cholesterol) {
        const value = parseFloat(match[1]);
        if (value > 50 && value < 500) {
          metrics.cholesterol = value;
          break;
        }
      }
    }

    for (let pattern of trigPatterns) {
      const match = text.match(pattern);
      if (match && !metrics.triglycerides) {
        const value = parseFloat(match[1]);
        if (value > 20 && value < 1000) {
          metrics.triglycerides = value;
          break;
        }
      }
    }

    for (let pattern of hdlPatterns) {
      const match = text.match(pattern);
      if (match && !metrics.hdl) {
        const value = parseFloat(match[1]);
        if (value > 10 && value < 200) {
          metrics.hdl = value;
          break;
        }
      }
    }

    for (let pattern of ldlPatterns) {
      const match = text.match(pattern);
      if (match && !metrics.ldl) {
        const value = parseFloat(match[1]);
        if (value > 10 && value < 400) {
          metrics.ldl = value;
          break;
        }
      }
    }

    for (let pattern of vldlPatterns) {
      const match = text.match(pattern);
      if (match && !metrics.vldl) {
        const value = parseFloat(match[1]);
        if (value > 5 && value < 100) {
          metrics.vldl = value;
          break;
        }
      }
    }

    for (let pattern of hba1cPatterns) {
      const match = text.match(pattern);
      if (match && !metrics.hba1c) {
        const value = parseFloat(match[1]);
        if (value > 3 && value < 20) {
          metrics.hba1c = value;
          break;
        }
      }
    }

    for (let pattern of insulinPatterns) {
      const match = text.match(pattern);
      if (match && !metrics.insulin) {
        const value = parseFloat(match[1]);
        if (value > 0 && value < 200) {
          metrics.insulin = value;
          break;
        }
      }
    }

    return metrics;
  };

  // Calculate health score and risk assessment
  const calculateHealthScore = (metrics) => {
    let score = 100;
    let riskFactors = [];
    let abnormalCount = 0;

    // FBS Assessment
    if (metrics.fbs) {
      if (metrics.fbs >= RANGES.fbs.diabetic) {
        score -= 25;
        riskFactors.push('High fasting blood sugar (Diabetic range)');
        abnormalCount++;
      } else if (metrics.fbs >= RANGES.fbs.prediabetic[0]) {
        score -= 15;
        riskFactors.push('Elevated fasting blood sugar (Prediabetic range)');
        abnormalCount++;
      }
    }

    // Cholesterol Assessment
    if (metrics.cholesterol) {
      if (metrics.cholesterol >= RANGES.cholesterol.high) {
        score -= 15;
        riskFactors.push('High total cholesterol');
        abnormalCount++;
      } else if (metrics.cholesterol >= RANGES.cholesterol.borderline[0]) {
        score -= 8;
        riskFactors.push('Borderline high cholesterol');
      }
    }

    // Triglycerides Assessment
    if (metrics.triglycerides) {
      if (metrics.triglycerides >= RANGES.triglycerides.high) {
        score -= 15;
        riskFactors.push('High triglycerides');
        abnormalCount++;
      } else if (metrics.triglycerides >= RANGES.triglycerides.borderline[0]) {
        score -= 8;
        riskFactors.push('Borderline high triglycerides');
      }
    }

    // HDL Assessment (lower is worse)
    if (metrics.hdl) {
      if (metrics.hdl < RANGES.hdl.low) {
        score -= 15;
        riskFactors.push('Low HDL (good) cholesterol');
        abnormalCount++;
      }
    }

    // LDL Assessment
    if (metrics.ldl) {
      if (metrics.ldl >= RANGES.ldl.high) {
        score -= 15;
        riskFactors.push('High LDL (bad) cholesterol');
        abnormalCount++;
      } else if (metrics.ldl >= RANGES.ldl.borderline[0]) {
        score -= 8;
        riskFactors.push('Borderline high LDL');
      }
    }

    // HbA1c Assessment
    if (metrics.hba1c) {
      if (metrics.hba1c >= RANGES.hba1c.diabetic) {
        score -= 25;
        riskFactors.push('High HbA1c (Diabetic range)');
        abnormalCount++;
      } else if (metrics.hba1c >= RANGES.hba1c.prediabetic[0]) {
        score -= 15;
        riskFactors.push('Elevated HbA1c (Prediabetic range)');
        abnormalCount++;
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Determine risk level
    let riskLevel = 'Excellent';
    let riskColor = '#10b981';
    
    if (score >= 90) {
      riskLevel = 'Excellent';
      riskColor = '#10b981';
    } else if (score >= 75) {
      riskLevel = 'Good';
      riskColor = '#3b82f6';
    } else if (score >= 60) {
      riskLevel = 'Fair';
      riskColor = '#f59e0b';
    } else if (score >= 40) {
      riskLevel = 'Poor';
      riskColor = '#ef4444';
    } else {
      riskLevel = 'High Risk';
      riskColor = '#dc2626';
    }

    return {
      score,
      riskLevel,
      riskColor,
      riskFactors,
      abnormalCount,
      metricsFound: Object.keys(metrics).length
    };
  };

  // Get status and color for individual metric
  const getMetricStatus = (metric, value) => {
    if (!value) return { status: 'Not found', color: '#9ca3af' };

    switch (metric) {
      case 'fbs':
        if (value >= RANGES.fbs.diabetic) return { status: 'High (Diabetic)', color: '#dc2626' };
        if (value >= RANGES.fbs.prediabetic[0]) return { status: 'Elevated (Prediabetic)', color: '#f59e0b' };
        return { status: 'Normal', color: '#10b981' };

      case 'postLunch':
        if (value >= 200) return { status: 'High (Diabetic)', color: '#dc2626' };
        if (value >= 140) return { status: 'Elevated (Prediabetic)', color: '#f59e0b' };
        return { status: 'Normal', color: '#10b981' };

      case 'cholesterol':
        if (value >= RANGES.cholesterol.high) return { status: 'High', color: '#dc2626' };
        if (value >= RANGES.cholesterol.borderline[0]) return { status: 'Borderline', color: '#f59e0b' };
        return { status: 'Optimal', color: '#10b981' };

      case 'triglycerides':
        if (value >= RANGES.triglycerides.high) return { status: 'High', color: '#dc2626' };
        if (value >= RANGES.triglycerides.borderline[0]) return { status: 'Borderline', color: '#f59e0b' };
        return { status: 'Optimal', color: '#10b981' };

      case 'hdl':
        if (value < RANGES.hdl.low) return { status: 'Low', color: '#dc2626' };
        if (value >= RANGES.hdl.optimal) return { status: 'Optimal', color: '#10b981' };
        return { status: 'Fair', color: '#f59e0b' };

      case 'ldl':
        if (value >= RANGES.ldl.high) return { status: 'High', color: '#dc2626' };
        if (value >= RANGES.ldl.borderline[0]) return { status: 'Borderline', color: '#f59e0b' };
        if (value >= RANGES.ldl.nearOptimal[0]) return { status: 'Near Optimal', color: '#3b82f6' };
        return { status: 'Optimal', color: '#10b981' };

      case 'vldl':
        if (value >= 40) return { status: 'High', color: '#dc2626' };
        if (value >= 30) return { status: 'Borderline', color: '#f59e0b' };
        return { status: 'Normal', color: '#10b981' };

      case 'hba1c':
        if (value >= RANGES.hba1c.diabetic) return { status: 'High (Diabetic)', color: '#dc2626' };
        if (value >= RANGES.hba1c.prediabetic[0]) return { status: 'Elevated (Prediabetic)', color: '#f59e0b' };
        return { status: 'Normal', color: '#10b981' };

      case 'insulin':
        if (value >= 25) return { status: 'High', color: '#dc2626' };
        if (value >= 15) return { status: 'Elevated', color: '#f59e0b' };
        return { status: 'Normal', color: '#10b981' };

      default:
        return { status: 'Unknown', color: '#9ca3af' };
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file only');
      setFile(null);
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setExtractedText('');
    setHealthMetrics(null);
    setHealthScore(null);
  };

  // Process PDF
  const handleProcessPDF = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Extract text from PDF
      console.log('📄 Extracting text from PDF...');
      const text = await extractPDFText(file);
      setExtractedText(text);

      if (!text || text.trim().length === 0) {
        throw new Error('No text found in PDF. The PDF might be image-based or empty.');
      }

      console.log('✅ Text extracted:', text.substring(0, 200) + '...');

      // Parse health metrics
      console.log('🔍 Parsing health metrics...');
      const metrics = parseHealthMetrics(text);
      setHealthMetrics(metrics);

      if (Object.keys(metrics).length === 0) {
        setError('⚠️ No health metrics found in the PDF. Please ensure the PDF contains lab report data with values like FBS, cholesterol, triglycerides, etc.');
      } else {
        console.log('✅ Metrics found:', metrics);

        // Calculate health score
        console.log('🧮 Calculating health score...');
        const score = calculateHealthScore(metrics);
        setHealthScore(score);
        console.log('✅ Score calculated:', score);
      }

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to process PDF');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setExtractedText('');
    setHealthMetrics(null);
    setHealthScore(null);
    setError('');
  };

  return (
    <div className="pdf-health-scanner">
      <div className="scanner-header">
        <h2>📄 PDF Health Scanner</h2>
        <p>Upload a PDF lab report to extract and analyze diabetes health metrics</p>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="pdfInput"
            accept="application/pdf"
            onChange={handleFileSelect}
            disabled={loading}
          />
          <label htmlFor="pdfInput" className="file-label">
            {file ? `📄 ${file.name}` : '📁 Choose PDF File'}
          </label>
        </div>

        {file && (
          <div className="file-info">
            <span>✅ Selected: {file.name}</span>
            <span>Size: {(file.size / 1024).toFixed(2)} KB</span>
          </div>
        )}

        <div className="action-buttons">
          <button
            onClick={handleProcessPDF}
            disabled={!file || loading}
            className="btn btn-process"
          >
            {loading ? '⏳ Processing...' : '🔍 Scan & Analyze'}
          </button>

          {(file || healthMetrics) && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="btn btn-reset"
            >
              🔄 Reset
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {/* Health Score Display */}
      {healthScore && (
        <div className="health-score-section">
          <div className="score-card" style={{ borderColor: healthScore.riskColor }}>
            <div className="score-header">
              <h3>Health Score</h3>
              <div className="score-value" style={{ color: healthScore.riskColor }}>
                {healthScore.score}/100
              </div>
            </div>
            <div className="risk-level" style={{ backgroundColor: healthScore.riskColor }}>
              {healthScore.riskLevel}
            </div>
            <div className="score-stats">
              <span>📊 Metrics Found: {healthScore.metricsFound}</span>
              <span>⚠️ Abnormal: {healthScore.abnormalCount}</span>
            </div>
          </div>

          {healthScore.riskFactors.length > 0 && (
            <div className="risk-factors">
              <h4>⚠️ Risk Factors Identified:</h4>
              <ul>
                {healthScore.riskFactors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Health Metrics Display */}
      {healthMetrics && Object.keys(healthMetrics).length > 0 && (
        <div className="metrics-section">
          <h3>📊 Extracted Health Metrics</h3>
          <div className="metrics-grid">
              {Object.entries(healthMetrics).map(([key, value]) => {
              const status = getMetricStatus(key, value);
              const metricNames = {
                fbs: 'Fasting Blood Sugar',
                postLunch: 'Post-Lunch Blood Sugar',
                cholesterol: 'Total Cholesterol',
                triglycerides: 'Triglycerides',
                hdl: 'HDL Cholesterol',
                ldl: 'LDL Cholesterol',
                vldl: 'VLDL Cholesterol',
                hba1c: 'HbA1c',
                insulin: 'Fasting Insulin'
              };
              const unitSuffix = key === 'hba1c' ? '%' : key === 'insulin' ? ' IU' : ' mg/dL';
              return (
                <div key={key} className="metric-card" style={{ borderLeftColor: status.color }}>
                  <div className="metric-name">
                    {metricNames[key] || key.toUpperCase()}
                  </div>
                  <div className="metric-value" style={{ color: status.color }}>
                    {value}{unitSuffix}
                  </div>
                  <div className="metric-status" style={{ color: status.color }}>
                    {status.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extracted Text (Collapsible) */}
      {extractedText && (
        <details className="extracted-text-section">
          <summary>📝 View Extracted Text ({extractedText.length} characters)</summary>
          <pre className="extracted-text">{extractedText}</pre>
        </details>
      )}
    </div>
  );
};

export default PDFHealthScanner;

