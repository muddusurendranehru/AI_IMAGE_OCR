// Health Metrics Calculation Service
// Calculates various health indices: HOMA-IR, TYG Index, BMI, etc.

/**
 * Calculate HOMA-IR (Homeostatic Model Assessment of Insulin Resistance)
 * Formula: (Fasting Glucose mg/dL × Fasting Insulin μU/mL) / 405
 *
 * Color Zones:
 * - 0-20: Green (Excellent)
 * - 20-40: Yellow (Borderline)
 * - 40-60: Orange (Moderate Risk)
 * - 60-80: Red (High Risk)
 * - 80-100: Dark Red (Very High Risk)
 */
function calculateHomaIR(glucose, insulin) {
  if (!glucose || !insulin || glucose <= 0 || insulin <= 0) {
    return null;
  }

  const homaIR = (glucose * insulin) / 405;

  // Determine color zone and status based on actual HOMA-IR value
  // User-specified thresholds:
  // 1-2: GREEN, 2-6: ORANGE, 6-8: YELLOW RED, 8-12: YELLOW DARK RED, 12-20: REDDISH BLUE, Above 20: FULL RED
  let colorZone = 'green';
  let status = 'Excellent';
  let riskLevel = 'Low';
  let normalizedValue = 0;

  if (homaIR >= 20) {
    colorZone = 'darkred'; // FULL RED
    status = 'Severe Risk';
    riskLevel = 'Very High';
    normalizedValue = 100; // Maximum risk
  } else if (homaIR >= 12) {
    colorZone = 'reddishblue'; // REDDISH BLUE
    status = 'Very High Risk';
    riskLevel = 'Very High';
    normalizedValue = 80 + ((homaIR - 12) / 8) * 20; // 80-100
  } else if (homaIR >= 8) {
    colorZone = 'yellowdarkred'; // YELLOW DARK RED
    status = 'High Risk';
    riskLevel = 'High';
    normalizedValue = 60 + ((homaIR - 8) / 4) * 20; // 60-80
  } else if (homaIR >= 6) {
    colorZone = 'yellowred'; // YELLOW RED
    status = 'Borderline High';
    riskLevel = 'Moderate';
    normalizedValue = 40 + ((homaIR - 6) / 2) * 20; // 40-60
  } else if (homaIR >= 2) {
    colorZone = 'orange'; // ORANGE
    status = 'Moderate Risk';
    riskLevel = 'Moderate';
    normalizedValue = 20 + ((homaIR - 2) / 4) * 20; // 20-40
  } else if (homaIR >= 1) {
    colorZone = 'green'; // GREEN
    status = 'Excellent';
    riskLevel = 'Low';
    normalizedValue = (homaIR - 1) * 20; // 0-20
  } else {
    colorZone = 'green';
    status = 'Excellent';
    riskLevel = 'Low';
    normalizedValue = 0;
  }

  return {
    value: parseFloat(homaIR.toFixed(2)),
    normalizedValue: Math.round(normalizedValue),
    colorZone,
    status,
    riskLevel,
    unit: '',
    interpretation: getHomaIRInterpretation(homaIR)
  };
}

function getHomaIRInterpretation(value) {
  if (value < 1.0) return 'Optimal insulin sensitivity';
  if (value < 2.0) return 'Normal insulin sensitivity';
  if (value < 3.0) return 'Early insulin resistance';
  if (value < 5.0) return 'Insulin resistance present';
  if (value < 10.0) return 'Moderate insulin resistance';
  return 'Severe insulin resistance';
}

/**
 * Calculate TYG Index (Triglyceride-Glucose Index)
 * Formula: ln[Triglycerides (mg/dL) × Glucose (mg/dL) / 2]
 *
 * Normalized to 0-100 scale for display
 * Color Zones:
 * - 0-20: Green (Excellent)
 * - 20-40: Yellow (Borderline)
 * - 40-60: Orange (Moderate Risk)
 * - 60-80: Red (High Risk)
 * - 80-100: Dark Red (Very High Risk)
 */
function calculateTYGIndex(triglycerides, glucose) {
  if (!triglycerides || !glucose || triglycerides <= 0 || glucose <= 0) {
    return null;
  }

  const tygIndex = Math.log((triglycerides * glucose) / 2);

  // Normalize TYG index to 0-100 scale
  // User-specified thresholds:
  // 4.5: NORMAL GREEN, 5-8: ORANGE, 8-10: YELLOW RED, 10-14: REDDISH YELLOW, Above 15: RED, DARK RED
  let normalizedValue = 0;
  let colorZone = 'green';
  let status = 'Excellent';
  let riskLevel = 'Low';

  if (tygIndex >= 15) {
    // Above 15: RED, DARK RED
    colorZone = 'darkred';
    status = 'Very High Risk';
    riskLevel = 'Very High';
    normalizedValue = 90 + Math.min((tygIndex - 15) * 2, 10); // 90-100
  } else if (tygIndex >= 10) {
    // 10-14: REDDISH YELLOW
    colorZone = 'reddishyellow';
    status = 'High Risk';
    riskLevel = 'High';
    normalizedValue = 60 + ((tygIndex - 10) / 4) * 30; // 60-90
  } else if (tygIndex >= 8) {
    // 8-10: YELLOW RED
    colorZone = 'yellowred';
    status = 'Borderline High';
    riskLevel = 'Moderate';
    normalizedValue = 40 + ((tygIndex - 8) / 2) * 20; // 40-60
  } else if (tygIndex >= 5) {
    // 5-8: ORANGE
    colorZone = 'orange';
    status = 'Moderate Risk';
    riskLevel = 'Moderate';
    normalizedValue = 20 + ((tygIndex - 5) / 3) * 20; // 20-40
  } else if (tygIndex >= 4.5) {
    // 4.5: NORMAL GREEN
    colorZone = 'green';
    status = 'Normal';
    riskLevel = 'Low';
    normalizedValue = (tygIndex - 4.5) * 40; // 0-20
  } else {
    // Below 4.5: GREEN
    colorZone = 'green';
    status = 'Excellent';
    riskLevel = 'Low';
    normalizedValue = 0;
  }

  return {
    value: parseFloat(tygIndex.toFixed(2)),
    normalizedValue: Math.max(0, Math.min(normalizedValue, 100)),
    colorZone,
    status,
    riskLevel,
    unit: '',
    interpretation: getTYGInterpretation(tygIndex)
  };
}

function getTYGInterpretation(value) {
  if (value < 8.5) return 'Low cardiovascular risk';
  if (value < 9.0) return 'Moderate cardiovascular risk';
  if (value < 9.5) return 'Increased metabolic syndrome risk';
  if (value < 10.0) return 'High cardiovascular risk';
  return 'Very high metabolic syndrome risk';
}

/**
 * Calculate BMI (Body Mass Index)
 * Formula: weight (kg) / [height (m)]²
 *
 * Color Zones:
 * - 0-20: Green (Healthy range 18.5-25)
 * - 20-40: Yellow (Overweight 25-30)
 * - 40-60: Orange (Obese Class I 30-35)
 * - 60-80: Red (Obese Class II 35-40)
 * - 80-100: Dark Red (Obese Class III >40)
 */
function calculateBMI(weight, height, heightUnit = 'cm') {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return null;
  }

  // Convert height to meters if in cm
  let heightInMeters = height;
  if (heightUnit === 'cm') {
    heightInMeters = height / 100;
  } else if (heightUnit === 'inches') {
    heightInMeters = height * 0.0254;
  }

  const bmi = weight / (heightInMeters * heightInMeters);

  // Map BMI to 0-100 scale
  let normalizedValue = 0;
  let colorZone = 'green';
  let status = 'Healthy';
  let riskLevel = 'Low';
  let category = '';

  if (bmi < 18.5) {
    // Underweight - map to 0-15
    normalizedValue = (bmi / 18.5) * 15;
    colorZone = 'yellow';
    status = 'Underweight';
    riskLevel = 'Borderline';
    category = 'Underweight';
  } else if (bmi < 25) {
    // Normal weight - map to 0-20 (green zone)
    normalizedValue = ((bmi - 18.5) / (25 - 18.5)) * 20;
    colorZone = 'green';
    status = 'Healthy Weight';
    riskLevel = 'Low';
    category = 'Normal';
  } else if (bmi < 30) {
    // Overweight - map to 20-40 (yellow zone)
    normalizedValue = 20 + ((bmi - 25) / (30 - 25)) * 20;
    colorZone = 'yellow';
    status = 'Overweight';
    riskLevel = 'Borderline';
    category = 'Overweight';
  } else if (bmi < 35) {
    // Obese Class I - map to 40-60 (orange zone)
    normalizedValue = 40 + ((bmi - 30) / (35 - 30)) * 20;
    colorZone = 'orange';
    status = 'Obese Class I';
    riskLevel = 'Moderate';
    category = 'Obese I';
  } else if (bmi < 40) {
    // Obese Class II - map to 60-80 (red zone)
    normalizedValue = 60 + ((bmi - 35) / (40 - 35)) * 20;
    colorZone = 'red';
    status = 'Obese Class II';
    riskLevel = 'High';
    category = 'Obese II';
  } else {
    // Obese Class III - map to 80-100 (dark red zone)
    normalizedValue = 80 + Math.min(((bmi - 40) / 20) * 20, 20);
    colorZone = 'darkred';
    status = 'Obese Class III';
    riskLevel = 'Very High';
    category = 'Obese III';
  }

  return {
    value: parseFloat(bmi.toFixed(1)),
    normalizedValue: Math.max(0, Math.min(normalizedValue, 100)),
    colorZone,
    status,
    riskLevel,
    category,
    unit: 'kg/m²',
    interpretation: getBMIInterpretation(bmi)
  };
}

function getBMIInterpretation(value) {
  if (value < 18.5) return 'Below healthy weight';
  if (value < 25) return 'Healthy weight range';
  if (value < 30) return 'Above healthy weight';
  if (value < 35) return 'Obesity - increased health risks';
  if (value < 40) return 'Severe obesity - high health risks';
  return 'Very severe obesity - very high health risks';
}

/**
 * Calculate Waist Circumference Risk
 *
 * Color Zones (in cm):
 * - <85 cm: Green (Good)
 * - 85-90 cm (33-35 inches): Greenish Yellow (Borderline)
 * - 90-95 cm: Yellow (Moderate)
 * - 95-100 cm: Orange (Increased Risk)
 * - 100-110 cm: Red (High Risk)
 * - 110-120 cm: Red (Very High Risk)
 * - >120 cm: Dark Red (Extremely High Risk)
 */
function calculateWaistCircumference(waistCm) {
  if (!waistCm || waistCm <= 0) {
    return null;
  }

  let normalizedValue = 0;
  let colorZone = 'green';
  let status = 'Excellent';
  let riskLevel = 'Low';

  // User-specified thresholds:
  // 85 cm: GREEN, 85-90: BLUE, 90-95: YELLOW RED, 95-100: ORANGE RED, 100-110: REDDISH YELLOW, 110-120: RED, Above 120: DARK RED
  if (waistCm >= 120) {
    // Above 120: DARK RED
    normalizedValue = 90 + Math.min(((waistCm - 120) / 20) * 10, 10);
    colorZone = 'darkred';
    status = 'Extremely High Risk';
    riskLevel = 'Very High';
  } else if (waistCm >= 110) {
    // 110-120: RED
    normalizedValue = 75 + ((waistCm - 110) / 10) * 15;
    colorZone = 'red';
    status = 'Very High Risk';
    riskLevel = 'Very High';
  } else if (waistCm >= 100) {
    // 100-110: REDDISH YELLOW
    normalizedValue = 60 + ((waistCm - 100) / 10) * 15;
    colorZone = 'reddishyellow';
    status = 'High Risk';
    riskLevel = 'High';
  } else if (waistCm >= 95) {
    // 95-100: ORANGE RED
    normalizedValue = 40 + ((waistCm - 95) / 5) * 20;
    colorZone = 'orangered';
    status = 'Increased Risk';
    riskLevel = 'Moderate';
  } else if (waistCm >= 90) {
    // 90-95: YELLOW RED
    normalizedValue = 30 + ((waistCm - 90) / 5) * 10;
    colorZone = 'yellowred';
    status = 'Moderate Risk';
    riskLevel = 'Moderate';
  } else if (waistCm >= 85) {
    // 85-90: BLUE
    normalizedValue = 20 + ((waistCm - 85) / 5) * 10;
    colorZone = 'blue';
    status = 'Borderline';
    riskLevel = 'Borderline';
  } else {
    // 85 cm: GREEN
    normalizedValue = (waistCm / 85) * 20;
    colorZone = 'green';
    status = 'Good';
    riskLevel = 'Low';
  }

  // Convert to inches for display
  const waistInches = waistCm * 0.393701;

  return {
    value: parseFloat(waistCm.toFixed(1)),
    valueInches: parseFloat(waistInches.toFixed(1)),
    normalizedValue: Math.max(0, Math.min(normalizedValue, 100)),
    colorZone,
    status,
    riskLevel,
    unit: 'cm',
    interpretation: getWaistInterpretation(waistCm)
  };
}

function getWaistInterpretation(value) {
  if (value < 85) return 'Low metabolic risk';
  if (value < 90) return 'Slightly increased risk';
  if (value < 95) return 'Increased metabolic risk';
  if (value < 100) return 'Substantially increased risk';
  if (value < 110) return 'High cardiovascular risk';
  if (value < 120) return 'Very high health risk';
  return 'Extremely high health risk';
}

/**
 * Calculate all health metrics from lab values
 */
function calculateAllHealthMetrics(labValues, patientData = {}) {
  const metrics = {
    homaIR: null,
    tygIndex: null,
    bmi: null,
    waistCircumference: null
  };

  // Extract values
  const glucose = labValues.glucose || labValues.blood_sugar || labValues.fbs;
  const insulin = labValues.insulin;
  const triglycerides = labValues.triglycerides || labValues.tg;
  const weight = patientData.weight || labValues.weight;
  const height = patientData.height || labValues.height;
  const waist = patientData.waist || labValues.waist || labValues.waist_circumference;

  // Calculate HOMA-IR
  if (glucose && insulin) {
    metrics.homaIR = calculateHomaIR(glucose, insulin);
  }

  // Calculate TYG Index
  if (triglycerides && glucose) {
    metrics.tygIndex = calculateTYGIndex(triglycerides, glucose);
  }

  // Calculate BMI
  if (weight && height) {
    metrics.bmi = calculateBMI(weight, height, 'cm');
  }

  // Calculate Waist Circumference
  if (waist) {
    metrics.waistCircumference = calculateWaistCircumference(waist);
  }

  return metrics;
}

/**
 * Get color for zone
 */
function getZoneColor(zone) {
  const colors = {
    green: '#10b981',           // Green
    blue: '#3b82f6',            // Blue
    greenishyellow: '#84cc16',  // Greenish Yellow
    yellow: '#fbbf24',          // Yellow
    yellowred: '#f59e0b',       // Yellow Red
    yellowdarkred: '#dc2626',   // Yellow Dark Red
    orange: '#f97316',          // Orange
    orangered: '#ea580c',       // Orange Red
    reddishyellow: '#ef4444',   // Reddish Yellow
    reddishblue: '#7c3aed',     // Reddish Blue
    red: '#ef4444',             // Red
    darkred: '#991b1b'          // Dark Red / Full Red
  };
  return colors[zone] || '#6b7280';
}

module.exports = {
  calculateHomaIR,
  calculateTYGIndex,
  calculateBMI,
  calculateWaistCircumference,
  calculateAllHealthMetrics,
  getZoneColor
};
