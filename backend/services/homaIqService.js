// HOMA-IQ Score Calculation Service
// Computes composite clinical risk score based on lab values

/**
 * HOMA-IQ Score: Composite metabolic health and clinical risk assessment
 *
 * Based on key clinical parameters:
 * - Glucose (Fasting Blood Sugar)
 * - Insulin (if available)
 * - Cholesterol (Total, HDL, LDL)
 * - Triglycerides
 * - Blood Pressure (if available)
 * - HbA1c (if available)
 *
 * Score Range: 0-100
 * - 80-100: Excellent metabolic health
 * - 60-79: Good metabolic health
 * - 40-59: Moderate risk
 * - 20-39: High risk
 * - 0-19: Very high risk
 */

// Reference ranges for clinical parameters
const REFERENCE_RANGES = {
  // Glucose (mg/dL)
  glucose: {
    optimal: { min: 70, max: 100 },
    normal: { min: 100, max: 125 },
    prediabetic: { min: 126, max: 140 },
    diabetic: { min: 140, max: 999 }
  },

  // Insulin (μU/mL) - Fasting
  insulin: {
    optimal: { min: 2, max: 6 },
    normal: { min: 6, max: 25 },
    high: { min: 25, max: 999 }
  },

  // Total Cholesterol (mg/dL)
  cholesterol: {
    optimal: { min: 0, max: 200 },
    borderline: { min: 200, max: 239 },
    high: { min: 240, max: 999 }
  },

  // HDL Cholesterol (mg/dL)
  hdl: {
    low: { min: 0, max: 40 },
    optimal: { min: 40, max: 60 },
    high: { min: 60, max: 999 }
  },

  // LDL Cholesterol (mg/dL)
  ldl: {
    optimal: { min: 0, max: 100 },
    near_optimal: { min: 100, max: 129 },
    borderline: { min: 130, max: 159 },
    high: { min: 160, max: 189 },
    very_high: { min: 190, max: 999 }
  },

  // Triglycerides (mg/dL)
  triglycerides: {
    optimal: { min: 0, max: 150 },
    borderline: { min: 150, max: 199 },
    high: { min: 200, max: 499 },
    very_high: { min: 500, max: 999 }
  },

  // HbA1c (%)
  hba1c: {
    normal: { min: 0, max: 5.7 },
    prediabetic: { min: 5.7, max: 6.4 },
    diabetic: { min: 6.5, max: 999 }
  },

  // Blood Pressure (mmHg) - Systolic
  systolic: {
    optimal: { min: 90, max: 120 },
    elevated: { min: 120, max: 129 },
    stage1: { min: 130, max: 139 },
    stage2: { min: 140, max: 999 }
  },

  // Blood Pressure (mmHg) - Diastolic
  diastolic: {
    optimal: { min: 60, max: 80 },
    elevated: { min: 80, max: 89 },
    stage1: { min: 90, max: 99 },
    stage2: { min: 100, max: 999 }
  }
};

/**
 * Calculate HOMA-IR (Homeostatic Model Assessment of Insulin Resistance)
 * Formula: (Fasting Glucose mg/dL × Fasting Insulin μU/mL) / 405
 * Updated thresholds: 2-5 orange, 5-10 red (high risk), >10 deep red (very high risk)
 */
function calculateHomaIR(glucose, insulin) {
  if (!glucose || !insulin) return null;

  const homaIR = (glucose * insulin) / 405;

  // Classification with updated thresholds
  let classification = 'Normal';
  if (homaIR >= 10) classification = 'Very High Risk - Severe Insulin Resistance';
  else if (homaIR >= 5) classification = 'High Risk - Significant Insulin Resistance';
  else if (homaIR >= 2) classification = 'Moderate Risk - Insulin Resistance Present';
  else if (homaIR >= 1) classification = 'Early Insulin Resistance';

  return {
    value: parseFloat(homaIR.toFixed(2)),
    classification,
    isAbnormal: homaIR >= 2.0 // Mark as abnormal at 2.0 or higher
  };
}

/**
 * Assess individual parameter and return score (0-100)
 */
function assessParameter(value, parameterName) {
  if (!value || value <= 0) return null;

  const ranges = REFERENCE_RANGES[parameterName];
  if (!ranges) return null;

  let score = 100;
  let status = 'normal';
  let isAbnormal = false;

  switch (parameterName) {
    case 'glucose':
      if (value <= ranges.normal.max) {
        score = 100;
        status = 'Normal';
      } else if (value <= ranges.prediabetic.max) {
        score = 60;
        status = 'Pre-diabetic';
        isAbnormal = true;
      } else {
        score = 20;
        status = 'Diabetic range';
        isAbnormal = true;
      }
      break;

    case 'cholesterol':
      if (value <= ranges.optimal.max) {
        score = 100;
        status = 'Optimal';
      } else if (value <= ranges.borderline.max) {
        score = 70;
        status = 'Borderline high';
        isAbnormal = true;
      } else {
        score = 40;
        status = 'High';
        isAbnormal = true;
      }
      break;

    case 'hdl':
      if (value >= ranges.optimal.min && value <= ranges.optimal.max) {
        score = 100;
        status = 'Optimal';
      } else if (value >= ranges.high.min) {
        score = 100;
        status = 'High (protective)';
      } else {
        score = 50;
        status = 'Low (risk factor)';
        isAbnormal = true;
      }
      break;

    case 'ldl':
      if (value <= ranges.optimal.max) {
        score = 100;
        status = 'Optimal';
      } else if (value <= ranges.near_optimal.max) {
        score = 70;
        status = 'High risk (above 100)';
        isAbnormal = true; // LDL > 100 is now marked as high risk
      } else if (value <= ranges.borderline.max) {
        score = 50;
        status = 'Borderline high';
        isAbnormal = true;
      } else if (value <= ranges.high.max) {
        score = 30;
        status = 'High';
        isAbnormal = true;
      } else {
        score = 15;
        status = 'Very high';
        isAbnormal = true;
      }
      break;

    case 'triglycerides':
      if (value <= ranges.optimal.max) {
        score = 100;
        status = 'Optimal';
      } else if (value <= ranges.borderline.max) {
        score = 70;
        status = 'Borderline high';
        isAbnormal = true;
      } else if (value <= ranges.high.max) {
        score = 40;
        status = 'High';
        isAbnormal = true;
      } else {
        score = 20;
        status = 'Very high';
        isAbnormal = true;
      }
      break;

    case 'hba1c':
      if (value <= ranges.normal.max) {
        score = 100;
        status = 'Normal';
      } else if (value <= ranges.prediabetic.max) {
        score = 60;
        status = 'Pre-diabetic';
        isAbnormal = true;
      } else {
        score = 20;
        status = 'Diabetic range';
        isAbnormal = true;
      }
      break;

    default:
      score = 100;
      status = 'Normal';
  }

  return {
    value,
    score,
    status,
    isAbnormal,
    unit: getUnit(parameterName)
  };
}

/**
 * Get unit for parameter
 */
function getUnit(parameterName) {
  const units = {
    glucose: 'mg/dL',
    insulin: 'μU/mL',
    cholesterol: 'mg/dL',
    hdl: 'mg/dL',
    ldl: 'mg/dL',
    triglycerides: 'mg/dL',
    hba1c: '%',
    systolic: 'mmHg',
    diastolic: 'mmHg'
  };
  return units[parameterName] || '';
}

/**
 * Calculate comprehensive HOMA-IQ Score
 * @param {Object} labValues - Extracted lab values
 * @returns {Object} - HOMA-IQ score and detailed assessment
 */
function calculateHomaIQScore(labValues) {
  if (!labValues || typeof labValues !== 'object') {
    return {
      success: false,
      error: 'Invalid lab values provided'
    };
  }

  console.log('🧮 Calculating HOMA-IQ Score...');

  // Extract and normalize values
  const values = {
    glucose: extractValue(labValues, [
      'glucose',
      'blood_sugar',
      'fbs',
      'blood sugar',
      'fasting glucose'
    ]),
    insulin: extractValue(labValues, ['insulin', 'fasting insulin']),
    cholesterol: extractValue(labValues, ['cholesterol', 'total cholesterol', 'total_cholesterol']),
    hdl: extractValue(labValues, ['hdl', 'hdl cholesterol', 'hdl_cholesterol']),
    ldl: extractValue(labValues, ['ldl', 'ldl cholesterol', 'ldl_cholesterol']),
    triglycerides: extractValue(labValues, ['triglycerides', 'tg', 'triglyceride']),
    hba1c: extractValue(labValues, ['hba1c', 'hb a1c', 'glycated hemoglobin', 'a1c'])
  };

  // Assess each parameter
  const assessments = {};
  const scores = [];
  const abnormalParameters = [];

  Object.keys(values).forEach((param) => {
    if (values[param] !== null) {
      const assessment = assessParameter(values[param], param);
      if (assessment) {
        assessments[param] = assessment;
        scores.push(assessment.score);

        if (assessment.isAbnormal) {
          abnormalParameters.push({
            parameter: param.toUpperCase(),
            value: assessment.value,
            unit: assessment.unit,
            status: assessment.status
          });
        }
      }
    }
  });

  // Calculate HOMA-IR if glucose and insulin are available
  let homaIR = null;
  if (values.glucose && values.insulin) {
    homaIR = calculateHomaIR(values.glucose, values.insulin);
    if (homaIR && homaIR.isAbnormal) {
      abnormalParameters.push({
        parameter: 'HOMA-IR',
        value: homaIR.value,
        unit: '',
        status: homaIR.classification
      });
    }
  }

  // Calculate overall HOMA-IQ Score (weighted average)
  let overallScore = 0;
  if (scores.length > 0) {
    overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  } else {
    return {
      success: false,
      error: 'No valid lab values found for HOMA-IQ calculation'
    };
  }

  // Determine risk level and recommendations
  const riskAssessment = getRiskAssessment(overallScore);

  // Generate clinical summary
  const clinicalSummary = generateClinicalSummary(assessments, abnormalParameters, overallScore);

  const result = {
    success: true,
    homaIQScore: overallScore,
    riskLevel: riskAssessment.level,
    riskColor: riskAssessment.color,
    riskDescription: riskAssessment.description,
    parametersAssessed: Object.keys(assessments).length,
    abnormalCount: abnormalParameters.length,
    abnormalParameters: abnormalParameters,
    detailedAssessments: assessments,
    homaIR: homaIR,
    recommendations: riskAssessment.recommendations,
    clinicalSummary: clinicalSummary,
    calculatedAt: new Date().toISOString()
  };

  console.log(`✅ HOMA-IQ Score: ${overallScore} (${riskAssessment.level})`);
  console.log(`⚠️ Abnormal parameters: ${abnormalParameters.length}`);

  return result;
}

/**
 * Extract value from lab values object (handles various naming conventions)
 */
function extractValue(labValues, possibleNames) {
  for (const name of possibleNames) {
    // Check direct property
    if (labValues[name] !== undefined && labValues[name] !== null) {
      return parseFloat(labValues[name]);
    }

    // Check case-insensitive
    const lowerName = name.toLowerCase();
    for (const key in labValues) {
      if (key.toLowerCase() === lowerName || key.toLowerCase().includes(lowerName)) {
        const value = parseFloat(labValues[key]);
        if (!isNaN(value)) return value;
      }
    }
  }
  return null;
}

/**
 * Get risk assessment based on HOMA-IQ Score
 */
function getRiskAssessment(score) {
  if (score >= 80) {
    return {
      level: 'Excellent',
      color: '#10b981', // green
      description: 'Excellent metabolic health. All parameters within optimal range.',
      recommendations: [
        'Maintain current healthy lifestyle',
        'Continue regular exercise',
        'Keep balanced diet',
        'Annual health check-ups recommended'
      ]
    };
  } else if (score >= 60) {
    return {
      level: 'Good',
      color: '#3b82f6', // blue
      description: 'Good metabolic health with minor areas for improvement.',
      recommendations: [
        'Monitor parameters regularly',
        'Consider lifestyle modifications',
        'Increase physical activity if needed',
        'Consult with healthcare provider for optimization'
      ]
    };
  } else if (score >= 40) {
    return {
      level: 'Moderate Risk',
      color: '#f59e0b', // amber/orange
      description: 'Moderate metabolic risk. Some parameters require attention.',
      recommendations: [
        'Immediate lifestyle modifications recommended',
        'Dietary changes essential',
        'Regular exercise program needed',
        'Follow-up testing in 3 months',
        'Consult healthcare provider for treatment plan'
      ]
    };
  } else if (score >= 20) {
    return {
      level: 'High Risk',
      color: '#ef4444', // red
      description: 'High metabolic risk. Multiple parameters abnormal.',
      recommendations: [
        'Urgent medical consultation required',
        'Comprehensive lifestyle changes needed',
        'Medication may be necessary',
        'Close monitoring essential',
        'Follow medical treatment plan strictly'
      ]
    };
  } else {
    return {
      level: 'Very High Risk',
      color: '#991b1b', // dark red
      description: 'Very high metabolic risk. Immediate medical attention required.',
      recommendations: [
        'IMMEDIATE medical consultation required',
        'Comprehensive medical evaluation needed',
        'Medication therapy likely necessary',
        'Weekly monitoring recommended',
        'Consider specialist referral'
      ]
    };
  }
}

/**
 * Generate clinical summary text
 */
function generateClinicalSummary(assessments, abnormalParameters, score) {
  let summary = `HOMA-IQ Score: ${score}/100\n\n`;

  if (abnormalParameters.length === 0) {
    summary +=
      'All assessed parameters are within normal ranges. Patient shows excellent metabolic health.\n';
  } else {
    summary += `${abnormalParameters.length} parameter(s) outside normal range:\n`;
    abnormalParameters.forEach((param) => {
      summary += `- ${param.parameter}: ${param.value} ${param.unit} (${param.status})\n`;
    });
  }

  summary += '\nDetailed Assessment:\n';
  Object.keys(assessments).forEach((param) => {
    const assessment = assessments[param];
    summary += `- ${param.toUpperCase()}: ${assessment.value} ${assessment.unit} - ${assessment.status}\n`;
  });

  return summary;
}

/**
 * Parse lab values from extracted data
 */
function parseLabValues(extractedData) {
  const labValues = {};

  // Check if extractedData has testResults array
  if (extractedData.testResults && Array.isArray(extractedData.testResults)) {
    extractedData.testResults.forEach((test) => {
      if (test.testName && test.value) {
        const normalizedName = test.testName
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        labValues[normalizedName] = test.value;
      }
    });
  }

  // Also check for direct properties
  Object.keys(extractedData).forEach((key) => {
    if (typeof extractedData[key] === 'number' || !isNaN(parseFloat(extractedData[key]))) {
      labValues[key] = parseFloat(extractedData[key]);
    }
  });

  return labValues;
}

module.exports = {
  calculateHomaIQScore,
  calculateHomaIR,
  assessParameter,
  parseLabValues,
  REFERENCE_RANGES
};
