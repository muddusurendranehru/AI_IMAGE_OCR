// Lab Data Review Form - Human-in-the-Loop for Medical Data Verification
import React, { useState } from 'react';
import './LabDataReviewForm.css';

const LabDataReviewForm = ({ ocrText, batchInfo, onConfirm, onCancel }) => {
  // Smart extraction - find numbers in OCR text
  const extractInitialValues = (text) => {
    const values = {
      patientName: '',
      patientId: '',
      age: '',
      sex: '',
      height: '',
      weight: '',
      waist: '',
      fbs: '',
      postLunch: '',
      insulin: '',
      cholesterol: '',
      hdl: '',
      ldl: '',
      triglycerides: '',
      vldl: '',
      hba1c: '',
      // Family History (for C.O.D-HOMA IQ Score)
      familyDiabetes: false,
      familyHypertension: false,
      familyCAD: false,
      // Past Medical History
      pastCAD: false,
      pastCVA: false,
      pastCancer: false,
      pastPTCA: false,
      // Lifestyle Risk Factors
      smoking: false,
      alcohol: false,
      pan: false,
      drugs: false,
    };

    if (!text) return values;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    // Extract patient info
    const nameMatch = text.match(/Patient'?s?\s*Name[:\s]+([A-Za-z\s]+)/i);
    if (nameMatch) values.patientName = nameMatch[1].trim();
    
    const idMatch = text.match(/Patient\s*ID[:\s]+([A-Z0-9]+)/i);
    if (idMatch) values.patientId = idMatch[1].trim();
    
    const ageMatch = text.match(/Age[:\s]+(\d+)/i);
    if (ageMatch) values.age = ageMatch[1];
    
    const sexMatch = text.match(/Sex[:\s]+(Male|Female|M|F)/i);
    if (sexMatch) values.sex = sexMatch[1];

    // Extract all numbers from text
    const numbers = text.match(/\d+\.?\d*/g);
    if (!numbers) return values;

    // Try to match numbers to fields based on proximity to keywords
    const textLower = text.toLowerCase();
    
    // Weight - usually 50-200 kg
    const weightIdx = textLower.indexOf('weight');
    if (weightIdx !== -1) {
      const afterWeight = text.substring(weightIdx, weightIdx + 100);
      const match = afterWeight.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 30 && val <= 200) values.weight = match[1];
      }
    }
    
    // Height - usually 140-220 cm
    const heightIdx = textLower.indexOf('height');
    if (heightIdx !== -1) {
      const afterHeight = text.substring(heightIdx, heightIdx + 100);
      const match = afterHeight.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 100 && val <= 250) values.height = match[1];
      }
    }
    
    // Waist - usually 60-150 cm
    const waistIdx = textLower.indexOf('waist');
    if (waistIdx !== -1) {
      const afterWaist = text.substring(waistIdx, waistIdx + 100);
      const match = afterWaist.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 50 && val <= 200) values.waist = match[1];
      }
    }
    
    // Fasting Blood Sugar - usually 70-400 mg/dL
    const fbsIdx = textLower.search(/fasting\s*(blood\s*)?sugar|fbs/i);
    if (fbsIdx !== -1) {
      const afterFbs = text.substring(fbsIdx, fbsIdx + 100);
      const match = afterFbs.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 50 && val <= 500) values.fbs = match[1];
      }
    }
    
    // Post-lunch Blood Sugar
    const ppIdx = textLower.search(/post[\s-]*lunch|pp.*sugar|ppbs/i);
    if (ppIdx !== -1) {
      const afterPp = text.substring(ppIdx, ppIdx + 100);
      const match = afterPp.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 50 && val <= 500) values.postLunch = match[1];
      }
    }
    
    // Insulin - usually 2-100 µU/mL
    const insulinIdx = textLower.indexOf('insulin');
    if (insulinIdx !== -1) {
      const afterInsulin = text.substring(insulinIdx, insulinIdx + 150);
      const match = afterInsulin.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 1 && val <= 200) values.insulin = match[1];
      }
    }
    
    // Cholesterol - usually 100-400 mg/dL
    const cholIdx = textLower.search(/total\s*cholesterol|cholesterol\s*total/i);
    if (cholIdx !== -1) {
      const afterChol = text.substring(cholIdx, cholIdx + 100);
      const match = afterChol.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 80 && val <= 500) values.cholesterol = match[1];
      }
    }
    
    // HDL - usually 20-100 mg/dL
    const hdlIdx = textLower.indexOf('hdl');
    if (hdlIdx !== -1) {
      const afterHdl = text.substring(hdlIdx, hdlIdx + 100);
      const match = afterHdl.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 15 && val <= 150) values.hdl = match[1];
      }
    }
    
    // LDL - usually 40-200 mg/dL
    const ldlIdx = textLower.indexOf('ldl');
    if (ldlIdx !== -1) {
      const afterLdl = text.substring(ldlIdx, ldlIdx + 100);
      const match = afterLdl.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 20 && val <= 300) values.ldl = match[1];
      }
    }
    
    // Triglycerides - usually 50-500 mg/dL
    const tgIdx = textLower.search(/triglyceride/i);
    if (tgIdx !== -1) {
      const afterTg = text.substring(tgIdx, tgIdx + 100);
      const match = afterTg.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 30 && val <= 1000) values.triglycerides = match[1];
      }
    }
    
    // VLDL - usually 10-50 mg/dL
    const vldlIdx = textLower.indexOf('vldl');
    if (vldlIdx !== -1) {
      const afterVldl = text.substring(vldlIdx, vldlIdx + 100);
      const match = afterVldl.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 5 && val <= 100) values.vldl = match[1];
      }
    }
    
    // HbA1c - usually 4-15 %
    const hba1cIdx = textLower.search(/hba1c|a1c/i);
    if (hba1cIdx !== -1) {
      const afterHba1c = text.substring(hba1cIdx, hba1cIdx + 100);
      const match = afterHba1c.match(/(\d+\.?\d*)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val >= 3 && val <= 20) values.hba1c = match[1];
      }
    }
    
    return values;
  };

  const [formData, setFormData] = useState(() => extractInitialValues(ocrText));
  const [showOcrText, setShowOcrText] = useState(true);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    // Validate required fields
    const requiredFields = ['fbs', 'insulin', 'weight', 'height'];
    const missing = requiredFields.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      alert(`Please fill required fields: ${missing.join(', ')}`);
      return;
    }
    
    onConfirm(formData);
  };

  return (
    <div className="lab-data-review">
      <div className="review-header">
        <h2>🔍 Review & Verify Lab Data</h2>
        <p className="review-subtitle">
          Please verify the extracted values and correct any errors before analysis.
        </p>
        {batchInfo && (
          <div className="batch-info">
            📚 Processing {batchInfo.totalFiles} files: {batchInfo.fileNames.join(', ')}
          </div>
        )}
      </div>

      <div className="review-content">
        {/* Left Side: OCR Text */}
        {showOcrText && (
          <div className="ocr-text-panel">
            <div className="panel-header">
              <h3>📄 Extracted Text</h3>
              <button 
                className="toggle-btn" 
                onClick={() => setShowOcrText(false)}
              >
                Hide
              </button>
            </div>
            <pre className="ocr-text-display">{ocrText || 'No text extracted'}</pre>
          </div>
        )}

        {/* Right Side: Editable Form */}
        <div className={`form-panel ${!showOcrText ? 'full-width' : ''}`}>
          {!showOcrText && (
            <button 
              className="show-ocr-btn" 
              onClick={() => setShowOcrText(true)}
            >
              📄 Show OCR Text
            </button>
          )}
          
          <div className="form-sections">
            {/* Patient Information */}
            <div className="form-section">
              <h3>👤 Patient Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Patient Name</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => handleChange('patientName', e.target.value)}
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="form-field">
                  <label>Patient ID</label>
                  <input
                    type="text"
                    value={formData.patientId}
                    onChange={(e) => handleChange('patientId', e.target.value)}
                    placeholder="Enter patient ID"
                  />
                </div>
                <div className="form-field">
                  <label>Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="Years"
                  />
                </div>
                <div className="form-field">
                  <label>Sex</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleChange('sex', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Physical Measurements */}
            <div className="form-section">
              <h3>📏 Physical Measurements</h3>
              <div className="form-grid">
                <div className="form-field required">
                  <label>Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="e.g., 75"
                  />
                </div>
                <div className="form-field required">
                  <label>Height (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="e.g., 173"
                  />
                </div>
                <div className="form-field">
                  <label>Waist Circumference (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) => handleChange('waist', e.target.value)}
                    placeholder="e.g., 98"
                  />
                </div>
              </div>
            </div>

            {/* Blood Sugar & Insulin */}
            <div className="form-section">
              <h3>🩸 Blood Sugar & Insulin</h3>
              <div className="form-grid">
                <div className="form-field required">
                  <label>Fasting Blood Sugar (mg/dL) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fbs}
                    onChange={(e) => handleChange('fbs', e.target.value)}
                    placeholder="e.g., 139"
                  />
                </div>
                <div className="form-field">
                  <label>Post-lunch Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.postLunch}
                    onChange={(e) => handleChange('postLunch', e.target.value)}
                    placeholder="e.g., 162"
                  />
                </div>
                <div className="form-field required">
                  <label>Fasting Insulin (µU/mL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.insulin}
                    onChange={(e) => handleChange('insulin', e.target.value)}
                    placeholder="e.g., 15.72"
                  />
                </div>
                <div className="form-field">
                  <label>HbA1c (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hba1c}
                    onChange={(e) => handleChange('hba1c', e.target.value)}
                    placeholder="e.g., 6.5"
                  />
                </div>
              </div>
            </div>

            {/* Lipid Profile */}
            <div className="form-section">
              <h3>💊 Lipid Profile</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Total Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.cholesterol}
                    onChange={(e) => handleChange('cholesterol', e.target.value)}
                    placeholder="e.g., 200"
                  />
                </div>
                <div className="form-field">
                  <label>HDL Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hdl}
                    onChange={(e) => handleChange('hdl', e.target.value)}
                    placeholder="e.g., 47"
                  />
                </div>
                <div className="form-field">
                  <label>LDL Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ldl}
                    onChange={(e) => handleChange('ldl', e.target.value)}
                    placeholder="e.g., 89"
                  />
                </div>
                <div className="form-field">
                  <label>Triglycerides (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.triglycerides}
                    onChange={(e) => handleChange('triglycerides', e.target.value)}
                    placeholder="e.g., 165"
                  />
                </div>
                <div className="form-field">
                  <label>VLDL Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vldl}
                    onChange={(e) => handleChange('vldl', e.target.value)}
                    placeholder="e.g., 30"
                  />
                </div>
              </div>
            </div>

            {/* Family History Section - NEW FOR C.O.D-HOMA IQ */}
            <div className="form-section" style={{
              background: '#e3f2fd',
              border: '2px solid #2196f3',
              borderRadius: '10px',
              padding: '20px',
              marginTop: '20px'
            }}>
              <h3 style={{ color: '#1976d2' }}>👨‍👩‍👧‍👦 Family History (5 points each for C.O.D-HOMA IQ)</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.familyDiabetes}
                      onChange={(e) => handleChange('familyDiabetes', e.target.checked)}
                    />
                    {' '}Diabetes Mellitus (DM)
                  </label>
                </div>
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.familyHypertension}
                      onChange={(e) => handleChange('familyHypertension', e.target.checked)}
                    />
                    {' '}Hypertension (HTM)
                  </label>
                </div>
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.familyCAD}
                      onChange={(e) => handleChange('familyCAD', e.target.checked)}
                    />
                    {' '}Coronary Artery Disease (CAD)
                  </label>
                </div>
              </div>
            </div>

            {/* Past Medical History Section - NEW FOR C.O.D-HOMA IQ */}
            <div className="form-section" style={{
              background: '#fff3e0',
              border: '2px solid #ff9800',
              borderRadius: '10px',
              padding: '20px',
              marginTop: '15px'
            }}>
              <h3 style={{ color: '#ef6c00' }}>🏥 Past Medical History (5 points each for C.O.D-HOMA IQ)</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.pastCAD}
                      onChange={(e) => handleChange('pastCAD', e.target.checked)}
                    />
                    {' '}Coronary Artery Disease
                  </label>
                </div>
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.pastCVA}
                      onChange={(e) => handleChange('pastCVA', e.target.checked)}
                    />
                    {' '}Cerebrovascular Accident (Stroke)
                  </label>
                </div>
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.pastCancer}
                      onChange={(e) => handleChange('pastCancer', e.target.checked)}
                    />
                    {' '}Cancer
                  </label>
                </div>
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.pastPTCA}
                      onChange={(e) => handleChange('pastPTCA', e.target.checked)}
                    />
                    {' '}PTCA/Stent Placement
                  </label>
                </div>
              </div>
            </div>

            {/* Lifestyle Risk Factors Section - NEW FOR C.O.D-HOMA IQ */}
            <div className="form-section" style={{
              background: '#ffebee',
              border: '2px solid #f44336',
              borderRadius: '10px',
              padding: '20px',
              marginTop: '15px'
            }}>
              <h3 style={{ color: '#c62828' }}>🚬 Lifestyle Risk Factors (5 points total for C.O.D-HOMA IQ)</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.smoking}
                      onChange={(e) => handleChange('smoking', e.target.checked)}
                    />
                    {' '}Smoking
                  </label>
                </div>
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.alcohol}
                      onChange={(e) => handleChange('alcohol', e.target.checked)}
                    />
                    {' '}Alcohol Use
                  </label>
                </div>
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.pan}
                      onChange={(e) => handleChange('pan', e.target.checked)}
                    />
                    {' '}Pan/Tobacco Chewing
                  </label>
                </div>
                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.drugs}
                      onChange={(e) => handleChange('drugs', e.target.checked)}
                    />
                    {' '}Drug Use
                  </label>
                </div>
              </div>
            </div>

            {/* C.O.D-HOMA IQ Info Banner */}
            <div style={{
              background: '#fff9c4',
              border: '2px solid #fbc02d',
              borderRadius: '8px',
              padding: '15px',
              marginTop: '15px',
              fontSize: '14px'
            }}>
              <strong>ℹ️ C.O.D-HOMA I.Q. SCORE (0-100 Points):</strong>
              <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                <li>Waist > 85cm: <strong>15 points</strong></li>
                <li>HOMA-IR > 2: <strong>15 points</strong></li>
                <li>TYG Index > 4.5: <strong>15 points</strong></li>
                <li>Lab values (FBS, PLBS, HbA1c, LDL, TC, HDL, TG): <strong>5 points each</strong></li>
                <li>Family/Past History/Lifestyle: <strong>5 points each</strong></li>
              </ul>
              <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#f57c00' }}>
                🎯 Higher score = Higher metabolic risk
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="review-actions">
            <button className="btn btn-cancel" onClick={onCancel}>
              ❌ Cancel
            </button>
            <button className="btn btn-confirm" onClick={handleConfirm}>
              ✅ Confirm & Analyze
            </button>
          </div>

          <div className="required-note">
            * Required fields for HOMA-IQ calculation
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDataReviewForm;

