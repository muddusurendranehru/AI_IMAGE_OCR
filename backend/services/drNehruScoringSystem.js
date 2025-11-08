// Dr. Muddu Surendra Nehru's Metabolic Risk Scoring System
// HOMA Healthcare Center Scoring Algorithm
// Total: 100 points

/**
 * Dr. Nehru's Metabolic Risk Score (0-100 points)
 *
 * Risk Categories:
 * - 0-29: Low Risk (Green)
 * - 30-59: Moderate Risk (Orange)
 * - 60-79: High Risk (Red)
 * - 80-100: Very High Risk (Dark Red)
 *
 * Weightage:
 * 1. Waist Circumference > 85cm/33in: 15 points
 * 2. HOMA-IR > 2: 15 points
 * 3. TYG Index > 4.5: 15 points
 * 4. BMI: 5 points
 * 5. FBS, PLBS, HbA1c: 5 points each
 * 6. LDL, TC, HDL, TG: 5 points each
 * 7. Family History (DM, HTM, CAD): 5 points
 * 8. Past History (CAD, CVA, Cancer, PTCA/Stent): 5 points each
 * 9. Lifestyle (Smoking, Alcohol, Pan, Drugs): 5 points
 */

const DOCTOR_INFO = {
  name: 'Dr. Muddu Surendra Nehru',
  designation: 'Professor of Medicine, Metabolism Specialist',
  phone: '09963721999',
  website: 'www.homahealthcarecenter.in',
  message:
    'CONTACT PHYSICIAN METABOLISM SPECIALIST DR MUDDU SURENDRA NEHRU, PROFESSOR OF MEDICINE, 09963721999. www.homahealthcarecenter.in'
};

/**
 * Calculate Dr. Nehru's Metabolic Risk Score
 */
function calculateDrNehruScore(labValues, patientData = {}) {
  let totalScore = 0;
  const details = [];

  console.log('🏥 Calculating Dr. Nehru Metabolic Risk Score...');

  // 1. Waist Circumference > 85cm (15 points)
  if (patientData.waist && parseFloat(patientData.waist) > 85) {
    totalScore += 15;
    details.push({
      parameter: 'Waist Circumference',
      value: patientData.waist,
      unit: 'cm',
      points: 15,
      status: 'Abnormal (> 85cm)',
      risk: 'High'
    });
  }

  // 2. HOMA-IR > 2 (15 points)
  if (labValues.glucose && labValues.insulin) {
    const homaIR = (parseFloat(labValues.glucose) * parseFloat(labValues.insulin)) / 405;
    if (homaIR > 2) {
      totalScore += 15;
      details.push({
        parameter: 'HOMA-IR',
        value: homaIR.toFixed(2),
        unit: '',
        points: 15,
        status: 'Abnormal (> 2.0)',
        risk: 'High'
      });
    }
  }

  // 3. TYG Index > 4.5 (15 points)
  if (labValues.triglycerides && labValues.glucose) {
    const tygIndex = Math.log(
      (parseFloat(labValues.triglycerides) * parseFloat(labValues.glucose)) / 2
    );
    if (tygIndex > 4.5) {
      totalScore += 15;
      details.push({
        parameter: 'TYG Index',
        value: tygIndex.toFixed(2),
        unit: '',
        points: 15,
        status: 'Abnormal (> 4.5)',
        risk: 'High'
      });
    }
  }

  // 4. BMI (5 points if abnormal)
  if (patientData.weight && patientData.height) {
    const heightM = patientData.height > 10 ? patientData.height / 100 : patientData.height;
    const bmi = patientData.weight / (heightM * heightM);
    if (bmi > 25 || bmi < 18.5) {
      totalScore += 5;
      details.push({
        parameter: 'BMI',
        value: bmi.toFixed(1),
        unit: 'kg/m²',
        points: 5,
        status: bmi > 25 ? 'Overweight' : 'Underweight',
        risk: 'Moderate'
      });
    }
  }

  // 5. FBS - Fasting Blood Sugar (5 points)
  const fbs = parseFloat(labValues.glucose || labValues.fbs);
  if (fbs && fbs > 100) {
    totalScore += 5;
    details.push({
      parameter: 'FBS',
      value: fbs,
      unit: 'mg/dL',
      points: 5,
      status: fbs > 126 ? 'Diabetic' : 'Pre-diabetic',
      risk: 'Moderate'
    });
  }

  // 6. PLBS - Post Lunch Blood Sugar (5 points)
  const plbs = parseFloat(labValues.postLunchSugar || labValues.plbs || labValues.ppbs);
  if (plbs && plbs > 140) {
    totalScore += 5;
    details.push({
      parameter: 'PLBS',
      value: plbs,
      unit: 'mg/dL',
      points: 5,
      status: plbs > 200 ? 'Diabetic' : 'Elevated',
      risk: 'Moderate'
    });
  }

  // 7. HbA1c (5 points)
  const hba1c = parseFloat(labValues.hba1c);
  if (hba1c && hba1c > 5.7) {
    totalScore += 5;
    details.push({
      parameter: 'HbA1c',
      value: hba1c,
      unit: '%',
      points: 5,
      status: hba1c > 6.5 ? 'Diabetic' : 'Pre-diabetic',
      risk: 'Moderate'
    });
  }

  // 8. LDL Cholesterol (5 points)
  const ldl = parseFloat(labValues.ldl);
  if (ldl && ldl > 100) {
    totalScore += 5;
    details.push({
      parameter: 'LDL',
      value: ldl,
      unit: 'mg/dL',
      points: 5,
      status: ldl > 160 ? 'Very High' : 'High',
      risk: 'Moderate'
    });
  }

  // 9. Total Cholesterol (5 points)
  const tc = parseFloat(labValues.cholesterol);
  if (tc && tc > 200) {
    totalScore += 5;
    details.push({
      parameter: 'Total Cholesterol',
      value: tc,
      unit: 'mg/dL',
      points: 5,
      status: tc > 240 ? 'High' : 'Borderline',
      risk: 'Moderate'
    });
  }

  // 10. HDL Cholesterol (5 points if LOW)
  const hdl = parseFloat(labValues.hdl);
  if (hdl && hdl < 40) {
    totalScore += 5;
    details.push({
      parameter: 'HDL',
      value: hdl,
      unit: 'mg/dL',
      points: 5,
      status: 'Low (Risk Factor)',
      risk: 'Moderate'
    });
  }

  // 11. Triglycerides (5 points)
  const tg = parseFloat(labValues.triglycerides);
  if (tg && tg > 150) {
    totalScore += 5;
    details.push({
      parameter: 'Triglycerides',
      value: tg,
      unit: 'mg/dL',
      points: 5,
      status: tg > 200 ? 'High' : 'Borderline',
      risk: 'Moderate'
    });
  }

  // 12. Family History (5 points total if any present)
  const familyHistory = patientData.familyHistory || {};
  if (familyHistory.diabetes || familyHistory.hypertension || familyHistory.cad) {
    totalScore += 5;
    const conditions = [];
    if (familyHistory.diabetes) conditions.push('DM');
    if (familyHistory.hypertension) conditions.push('HTM');
    if (familyHistory.cad) conditions.push('CAD');

    details.push({
      parameter: 'Family History',
      value: conditions.join(', '),
      unit: '',
      points: 5,
      status: 'Present',
      risk: 'Moderate'
    });
  }

  // 13. Past Medical History (5 points each)
  const pastHistory = patientData.pastHistory || {};
  let pastHistoryPoints = 0;
  const pastConditions = [];

  if (pastHistory.cad) {
    pastHistoryPoints += 5;
    pastConditions.push('CAD');
  }
  if (pastHistory.cva) {
    pastHistoryPoints += 5;
    pastConditions.push('CVA');
  }
  if (pastHistory.cancer) {
    pastHistoryPoints += 5;
    pastConditions.push('Cancer');
  }
  if (pastHistory.ptca) {
    pastHistoryPoints += 5;
    pastConditions.push('PTCA/Stent');
  }

  if (pastHistoryPoints > 0) {
    totalScore += pastHistoryPoints;
    details.push({
      parameter: 'Past Medical History',
      value: pastConditions.join(', '),
      unit: '',
      points: pastHistoryPoints,
      status: 'Present',
      risk: 'High'
    });
  }

  // 14. Lifestyle Risk Factors (5 points if any present)
  const lifestyle = patientData.lifestyle || {};
  if (lifestyle.smoking || lifestyle.alcohol || lifestyle.pan || lifestyle.drugs) {
    totalScore += 5;
    const factors = [];
    if (lifestyle.smoking) factors.push('Smoking');
    if (lifestyle.alcohol) factors.push('Alcohol');
    if (lifestyle.pan) factors.push('Pan');
    if (lifestyle.drugs) factors.push('Drugs');

    details.push({
      parameter: 'Lifestyle Risk Factors',
      value: factors.join(', '),
      unit: '',
      points: 5,
      status: 'Present',
      risk: 'Moderate'
    });
  }

  // Determine risk category
  let riskLevel, riskColor, riskDescription;

  if (totalScore >= 80) {
    riskLevel = 'Very High Risk';
    riskColor = 'darkred';
    riskDescription = '⚠️ URGENT: Immediate medical attention required';
  } else if (totalScore >= 60) {
    riskLevel = 'High Risk';
    riskColor = 'red';
    riskDescription = '⚠️ WARNING: Significant metabolic abnormalities detected';
  } else if (totalScore >= 30) {
    riskLevel = 'Moderate Risk';
    riskColor = 'orange';
    riskDescription = '⚠️ CAUTION: Multiple risk factors present';
  } else {
    riskLevel = 'Low Risk';
    riskColor = 'green';
    riskDescription = '✅ Good metabolic health';
  }

  console.log(`✅ Dr. Nehru Score: ${totalScore}/100 (${riskLevel})`);
  console.log(`📊 Abnormal parameters: ${details.length}`);

  return {
    success: true,
    score: totalScore,
    maxScore: 100,
    riskLevel,
    riskColor,
    riskDescription,
    abnormalCount: details.length,
    details,
    doctorInfo: DOCTOR_INFO,
    recommendation: DOCTOR_INFO.message,
    calculatedAt: new Date().toISOString()
  };
}

module.exports = {
  calculateDrNehruScore,
  DOCTOR_INFO
};
