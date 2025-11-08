// Batch Upload Component with Human-in-the-Loop Review
import React, { useState } from 'react';
import { reportsAPI } from '../services/api';
import LabDataReviewForm from './LabDataReviewForm';
import './BatchUpload.css';

const BatchUpload = ({ onSuccess, onCancel }) => {
  const [stage, setStage] = useState('upload'); // 'upload', 'review', 'complete'
  const [patientInfo, setPatientInfo] = useState({
    patientName: '',
    patientId: ''
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // OCR extraction results
  const [ocrData, setOcrData] = useState(null);

  // Handle patient info change
  const handleInfoChange = (e) => {
    setPatientInfo({
      ...patientInfo,
      [e.target.name]: e.target.value
    });
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type === 'application/pdf';
      if (!isValid) {
        setError(`File ${file.name} is not a valid JPG or PDF file`);
      }
      return isValid;
    });

    // Validate file sizes (max 10MB each)
    const sizedFiles = validFiles.filter(file => {
      const isValidSize = file.size <= 10 * 1024 * 1024;
      if (!isValidSize) {
        setError(`File ${file.name} exceeds 10MB limit`);
      }
      return isValidSize;
    });

    // Create file objects with preview
    const fileObjects = sizedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      isPDF: file.type === 'application/pdf'
    }));

    setFiles([...files, ...fileObjects]);
    setError('');
  };

  // Remove file
  const handleRemoveFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Step 1: Extract OCR text (no analysis yet)
  const handleExtractOCR = async () => {
    if (!patientInfo.patientName || !patientInfo.patientId) {
      setError('Please provide both Patient Name and Patient ID');
      return;
    }

    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('patientName', patientInfo.patientName);
      formData.append('patientId', patientInfo.patientId);
      formData.append('reportType', 'Batch Upload');
      
      files.forEach((fileObj) => {
        formData.append('images', fileObj.file);
      });

      console.log('📤 Extracting OCR from', files.length, 'files...');
      
      // Add client-side timeout (5 minutes)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout: Processing took too long. Please try with fewer files.')), 5 * 60 * 1000);
      });
      
      const uploadPromise = reportsAPI.batchUpload(formData);
      const response = await Promise.race([uploadPromise, timeoutPromise]);

      if (response.success) {
        console.log('✅ OCR extraction successful!', response);
        console.log(`📊 Processed: ${response.filesProcessed}/${response.filesTotal} files`);
        if (response.filesFailed > 0) {
          console.warn(`⚠️ ${response.filesFailed} files failed to process`);
        }
        
        // Store OCR data and move to review stage
        setOcrData({
          ocrText: response.report.ocr_text || '',
          extractedData: response.report.extracted_data,
          batchInfo: response.report.extracted_data?.batchInfo,
          reportId: response.report.id
        });
        
        setStage('review');
      } else {
        throw new Error(response.error || 'OCR extraction failed');
      }

    } catch (err) {
      console.error('❌ OCR extraction error:', err);
      if (err.message.includes('timeout')) {
        setError('⏱️ Processing timeout: The upload took too long. Please try with fewer files (max 5-10 files at once).');
      } else if (err.message.includes('Network Error')) {
        setError('🌐 Network error: Check your connection and try again.');
      } else {
        setError(err.message || 'Failed to extract OCR text. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Step 2: User confirms data and triggers analysis
  const handleConfirmAndAnalyze = async (confirmedData) => {
    setUploading(true);
    setError('');

    try {
      console.log('✅ User confirmed data:', confirmedData);
      
      // Call API to update the report with confirmed data and calculate metrics
      const response = await reportsAPI.finalizeReport(ocrData.reportId, confirmedData);

      if (response.success) {
        console.log('✅ Analysis complete!', response);
        setStage('complete');
        
        // Call success callback
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        throw new Error(response.error || 'Analysis failed');
      }

    } catch (err) {
      console.error('❌ Analysis error:', err);
      setError(err.message || 'Failed to analyze data');
      setUploading(false);
    }
  };

  // Handle cancel from review form
  const handleCancelReview = () => {
    setStage('upload');
    setOcrData(null);
  };

  // Render based on stage
  if (stage === 'review' && ocrData) {
    return (
      <LabDataReviewForm
        ocrText={ocrData.ocrText}
        batchInfo={ocrData.batchInfo}
        onConfirm={handleConfirmAndAnalyze}
        onCancel={handleCancelReview}
      />
    );
  }

  if (stage === 'complete') {
    return (
      <div className="batch-upload-complete">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>Analysis Complete!</h2>
          <p>Your lab report has been processed and saved.</p>
          <button className="btn btn-primary" onClick={onSuccess}>
            View Reports
          </button>
        </div>
      </div>
    );
  }

  // Default: Upload stage
  return (
    <div className="batch-upload-container">
      <div className="batch-upload-header">
        <h2>📚 Batch Upload - Multiple Files</h2>
        <p>Upload multiple JPG or PDF files for <strong>ONE PATIENT ONLY</strong></p>
      </div>

      {/* CRITICAL WARNING */}
      <div className="warning-box" style={{
        background: '#fff3cd',
        border: '3px solid #ff9800',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        fontSize: '16px'
      }}>
        <h3 style={{ color: '#856404', marginTop: 0 }}>⚠️ CRITICAL: Read Before Uploading!</h3>
        <ul style={{ textAlign: 'left', color: '#856404' }}>
          <li><strong>Batch Upload = ONE PATIENT with multiple report pages</strong></li>
          <li>Example: Patient "Sambashivareddy" has 3 reports → Upload all 3 together</li>
          <li>❌ <strong>DO NOT</strong> upload Sambashivareddy + Indraneel together!</li>
          <li>✅ Upload each patient separately to avoid data mixing</li>
          <li>✅ C.O.D-HOMA IQ Score includes family history, past history & lifestyle (fill below)</li>
        </ul>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {/* Patient Information */}
      <div className="patient-info-section">
        <h3>👤 Patient Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientName">Patient Name *</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={patientInfo.patientName}
              onChange={handleInfoChange}
              placeholder="Enter patient name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="patientId">Patient ID *</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={patientInfo.patientId}
              onChange={handleInfoChange}
              placeholder="Enter patient ID"
              required
            />
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="file-upload-section">
        <h3>📎 Upload Files (JPG, PDF)</h3>
        <div className="file-input-wrapper">
          <input
            type="file"
            id="fileInput"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="fileInput" className="file-input-label">
            📁 Choose Multiple Files
          </label>
          <p className="file-input-hint">You can select multiple JPG and PDF files at once</p>
        </div>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="selected-files-section">
          <h3>📋 Selected Files ({files.length})</h3>
          <div className="files-grid">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="file-card">
                <div className="file-preview">
                  {fileObj.isPDF ? (
                    <div className="pdf-icon">📄</div>
                  ) : (
                    <img src={fileObj.preview} alt={fileObj.name} />
                  )}
                </div>
                <div className="file-info">
                  <div className="file-name" title={fileObj.name}>
                    {fileObj.name}
                  </div>
                  <div className="file-size">{formatFileSize(fileObj.size)}</div>
                </div>
                <button
                  className="remove-file-btn"
                  onClick={() => handleRemoveFile(fileObj.id)}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="batch-actions">
        <button className="btn btn-cancel" onClick={onCancel} disabled={uploading}>
          ❌ Cancel
        </button>
        <button
          className="btn btn-primary btn-analyze"
          onClick={handleExtractOCR}
          disabled={uploading || files.length === 0 || !patientInfo.patientName || !patientInfo.patientId}
        >
          {uploading ? '⏳ Extracting OCR...' : '🔍 Extract & Review'}
        </button>
      </div>

      <div className="help-text">
        <p><strong>Note:</strong> After uploading, you'll review and verify the extracted data before analysis.</p>
      </div>
    </div>
  );
};

export default BatchUpload;
