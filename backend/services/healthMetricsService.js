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
    // Updated thresholds: 2-5 orange, 5-10 red, >10 deep red
    let colorZone = 'green';
    let status = 'Excellent';
    let riskLevel = 'Low';
    let normalizedValue = 0;
    
    if (homaIR >= 10) {
        colorZone = 'darkred';
        status = 'Very High Risk';
        riskLevel = 'Very High';
        normalizedValue = 100; // Maximum risk
    } else if (homaIR >= 5) {
        colorZone = 'red';
        status = 'High Risk';
        riskLevel = 'High';
        normalizedValue = Math.min(50 + ((homaIR - 5) / 5) * 50, 100); // 50-100
    } else if (homaIR >= 2) {
        colorZone = 'orange';
        status = 'Moderate Risk';
        riskLevel = 'Moderate';
        normalizedValue = 20 + ((homaIR - 2) / 3) * 30; // 20-50
    } else if (homaIR >= 1) {
        colorZone = 'yellow';
        status = 'Borderline';
        riskLevel = 'Borderline';
        normalizedValue = homaIR * 20; // 0-20
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
    
    // Normalize TYG index (typically 8-10) to 0-100 scale
    // TYG < 8.5 = Low risk, 8.5-9.0 = Moderate, >9.0 = High risk
    let normalizedValue = 0;
    let colorZone = 'green';
    let status = 'Excellent';
    let riskLevel = 'Low';
    
    if (tygIndex < 8.5) {
        // 0-20 zone (green)
        normalizedValue = (tygIndex - 7.5) * 20; // Maps 7.5-8.5 to 0-20
        colorZone = 'green';
        status = 'Excellent';
        riskLevel = 'Low';
    } else if (tygIndex < 9.0) {
        // 20-40 zone (yellow)
        normalizedValue = 20 + ((tygIndex - 8.5) * 40); // Maps 8.5-9.0 to 20-40
        colorZone = 'yellow';
        status = 'Borderline';
        riskLevel = 'Borderline';
    } else if (tygIndex < 9.5) {
        // 40-60 zone (orange)
        normalizedValue = 40 + ((tygIndex - 9.0) * 40); // Maps 9.0-9.5 to 40-60
        colorZone = 'orange';
        status = 'Moderate Risk';
        riskLevel = 'Moderate';
    } else if (tygIndex < 10.0) {
        // 60-80 zone (red)
        normalizedValue = 60 + ((tygIndex - 9.5) * 40); // Maps 9.5-10.0 to 60-80
        colorZone = 'red';
        status = 'High Risk';
        riskLevel = 'High';
    } else {
        // 80-100 zone (dark red)
        normalizedValue = 80 + Math.min((tygIndex - 10.0) * 20, 20); // Maps 10.0+ to 80-100
        colorZone = 'darkred';
        status = 'Very High Risk';
        riskLevel = 'Very High';
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
        normalizedValue = 80 + Math.min((bmi - 40) / 20 * 20, 20);
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
    
    if (waistCm < 85) {
        // 0-20 zone (green) - Good
        normalizedValue = (waistCm / 85) * 20;
        colorZone = 'green';
        status = 'Good';
        riskLevel = 'Low';
    } else if (waistCm < 90) {
        // 20-30 zone (greenish yellow) - Borderline
        normalizedValue = 20 + ((waistCm - 85) / (90 - 85)) * 10;
        colorZone = 'greenishyellow';
        status = 'Borderline';
        riskLevel = 'Borderline';
    } else if (waistCm < 95) {
        // 30-40 zone (yellow) - Moderate
        normalizedValue = 30 + ((waistCm - 90) / (95 - 90)) * 10;
        colorZone = 'yellow';
        status = 'Moderate Risk';
        riskLevel = 'Moderate';
    } else if (waistCm < 100) {
        // 40-55 zone (orange) - Increased risk
        normalizedValue = 40 + ((waistCm - 95) / (100 - 95)) * 15;
        colorZone = 'orange';
        status = 'Increased Risk';
        riskLevel = 'Moderate';
    } else if (waistCm < 110) {
        // 55-75 zone (red) - High risk
        normalizedValue = 55 + ((waistCm - 100) / (110 - 100)) * 20;
        colorZone = 'red';
        status = 'High Risk';
        riskLevel = 'High';
    } else if (waistCm < 120) {
        // 75-90 zone (red) - Very high risk
        normalizedValue = 75 + ((waistCm - 110) / (120 - 110)) * 15;
        colorZone = 'red';
        status = 'Very High Risk';
        riskLevel = 'Very High';
    } else {
        // 90-100 zone (dark red) - Extremely high risk
        normalizedValue = 90 + Math.min((waistCm - 120) / 20 * 10, 10);
        colorZone = 'darkred';
        status = 'Extremely High Risk';
        riskLevel = 'Very High';
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
        green: '#10b981',
        greenishyellow: '#84cc16',
        yellow: '#fbbf24',
        orange: '#f97316',
        red: '#ef4444',
        darkred: '#991b1b'
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

