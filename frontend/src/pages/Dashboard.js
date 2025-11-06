// Dashboard Page - Main application interface
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, reportsAPI } from '../services/api';
import SpeedometerGauge from '../components/SpeedometerGauge';
import './Dashboard.css';
import './PrintReport.css';
import BatchUpload from '../components/BatchUpload';
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [modalPage, setModalPage] = useState(1); // 1 = Speedometers, 2 = Details
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    image: null,
    patientId: '',
    patientName: '',
    reportType: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load user data and reports on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadReports();
  }, [currentPage]);

  // Load reports from API
  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getAllReports(currentPage, 10);
      
      if (response.success) {
        setReports(response.reports);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type - Accept both images and PDFs
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      
      if (!isImage && !isPDF) {
        setError('Please select an image or PDF file');
        return;
      }
      
      // Validate file size (10 MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10 MB');
        return;
      }
      
      setUploadForm({ ...uploadForm, image: file });
      setError('');
    }
  };

  // Handle upload form submission
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.image) {
      setError('Please select an image to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', uploadForm.image);
      formData.append('patientId', uploadForm.patientId);
      formData.append('patientName', uploadForm.patientName);
      formData.append('reportType', uploadForm.reportType);

      const response = await reportsAPI.uploadReport(formData);
      
      if (response.success) {
        setSuccess(`✅ Lab report uploaded successfully! OCR Confidence: ${Math.round(response.ocrConfidence)}%`);
        
        // Reset form
        setUploadForm({
          image: null,
          patientId: '',
          patientName: '',
          reportType: '',
        });
        document.getElementById('imageInput').value = '';
        
        // Reload reports
        loadReports();
        
        // Hide upload form
        setTimeout(() => {
          setShowUploadForm(false);
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      loadReports();
      return;
    }

    try {
      setLoading(true);
      const response = await reportsAPI.searchReports(searchQuery);
      
      if (response.success) {
        setReports(response.results);
        setSuccess(`Found ${response.count} results for "${searchQuery}"`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // View report details
  const viewReport = (report) => {
    setSelectedReport(report);
    setModalPage(1); // Always start on speedometer page
  };

  // Close report modal
  const closeModal = () => {
    setSelectedReport(null);
    setModalPage(1);
  };

  // Get health metrics from extracted data
  const getHealthMetrics = (extractedData) => {
    try {
      if (typeof extractedData === 'string') {
        extractedData = JSON.parse(extractedData);
      }
      return extractedData?.healthMetrics;
    } catch (error) {
      return null;
    }
  };

  // Delete report
  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const response = await reportsAPI.deleteReport(reportId);
      
      if (response.success) {
        setSuccess('Report deleted successfully');
        loadReports();
        setSelectedReport(null);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete report');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get C.O.D-HOMA IQ Score from extracted data (NEW SYSTEM)
  const getHomaIQScore = (extractedData) => {
    try {
      if (typeof extractedData === 'string') {
        extractedData = JSON.parse(extractedData);
      }
      // NEW: Use Dr. Nehru's C.O.D-HOMA IQ Score if available
      if (extractedData?.drNehruScore) {
        return extractedData.drNehruScore;
      }
      // Fallback to old HOMA-IQ for backwards compatibility
      return extractedData?.homaIqScore;
    } catch (error) {
      return null;
    }
  };

  // Render HOMA-IQ Score Badge
  const renderHomaIQBadge = (homaIqData) => {
    if (!homaIqData || !homaIqData.success) {
      return null;
    }

    // Check if it's the new C.O.D-HOMA IQ score or old HOMA-IQ
    const isNewSystem = homaIqData.title === "C.O.D-H.O.M.A I.Q. SCORE";
    const scoreValue = homaIqData.score || homaIqData.homaIQScore;
    
    return (
      <div className="homa-iq-badge" style={{ backgroundColor: homaIqData.riskColor }}>
        <div className="homa-iq-score">{scoreValue}</div>
        <div className="homa-iq-label">{isNewSystem ? 'C.O.D-HOMA IQ' : 'HOMA-IQ'}</div>
        <div className="homa-iq-risk">{homaIqData.riskLevel}</div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🔬 OCR Lab Report Dashboard</h1>
            {user && <p>Welcome, <strong>{user.fullName || user.email}</strong></p>}
          </div>
          <div className="header-right">
            <button onClick={() => navigate('/pdf-scanner')} className="btn btn-primary">
              📄 PDF Scanner
            </button>
            {showUploadForm && (
              <button onClick={() => setShowBatchUpload(!showBatchUpload)} className="btn btn-primary">
                {showBatchUpload ? '📄 Single' : '📚 Batch'}
              </button>
            )}
            <button onClick={() => setShowUploadForm(!showUploadForm)} className="btn btn-success">
              {showUploadForm ? '❌ Cancel' : '📤 Upload Report'}
            </button>
            <button onClick={handleLogout} className="btn btn-logout">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Alerts */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Single Upload Form */}
        {showUploadForm && !showBatchUpload && (
          <div className="upload-section card">
            <h2>📤 Upload New Lab Report</h2>
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="imageInput">Lab Report (Image or PDF) *</label>
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    required
                  />
                  {uploadForm.image && (
                    <small className="file-info">
                      ✅ Selected: {uploadForm.image.name} ({(uploadForm.image.size / 1024).toFixed(2)} KB)
                    </small>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patientId">Patient ID</label>
                  <input
                    type="text"
                    id="patientId"
                    value={uploadForm.patientId}
                    onChange={(e) => setUploadForm({ ...uploadForm, patientId: e.target.value })}
                    placeholder="P001 (optional - will be extracted)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="patientName">Patient Name</label>
                  <input
                    type="text"
                    id="patientName"
                    value={uploadForm.patientName}
                    onChange={(e) => setUploadForm({ ...uploadForm, patientName: e.target.value })}
                    placeholder="John Doe (optional - will be extracted)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reportType">Report Type</label>
                  <select
                    id="reportType"
                    value={uploadForm.reportType}
                    onChange={(e) => setUploadForm({ ...uploadForm, reportType: e.target.value })}
                  >
                    <option value="">Select Type</option>
                    <option value="Blood Test">Blood Test</option>
                    <option value="Urine Test">Urine Test</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI">MRI</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="ECG">ECG</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? '⏳ Processing with OCR...' : '🚀 Upload & Process'}
              </button>
            </form>
          </div>
        )}

        {/* Batch Upload Form */}
        {showUploadForm && showBatchUpload && (
          <BatchUpload
            onSuccess={() => {
              setShowUploadForm(false);
              setShowBatchUpload(false);
              loadReports();
            }}
            onCancel={() => {
              setShowUploadForm(false);
              setShowBatchUpload(false);
            }}
          />
        )}

        {/* Search Bar */}
        <div className="search-section card">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by Patient ID, Name, or Report Type..."
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => {
                  setSearchQuery('');
                  loadReports();
                }} 
                className="btn btn-secondary"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Reports List */}
        <div className="reports-section">
          <h2>📋 Lab Reports ({reports.length})</h2>
          
          {loading ? (
            <div className="loading">⏳ Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="empty-state card">
              <h3>📭 No Reports Found</h3>
              <p>Upload your first lab report to get started!</p>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => {
                const homaIqData = getHomaIQScore(report.extracted_data);
                
                return (
                  <div key={report.id} className="report-card card">
                    <div className="report-header">
                      <div>
                        <h3>{report.report_type || 'Lab Report'}</h3>
                        <span className={`status-badge status-${report.status}`}>
                          {report.status}
                        </span>
                      </div>
                      {homaIqData && renderHomaIQBadge(homaIqData)}
                    </div>
                    
                    <div className="report-info">
                      <p><strong>Patient ID:</strong> {report.patient_id || 'N/A'}</p>
                      <p><strong>Patient Name:</strong> {report.patient_name || 'N/A'}</p>
                      <p><strong>Uploaded:</strong> {formatDate(report.uploaded_at)}</p>
                      <p><strong>By:</strong> {report.uploaded_by_name || report.uploaded_by_email}</p>
                    </div>

                    {homaIqData && homaIqData.abnormalCount > 0 && (
                      <div className="abnormal-alert">
                        ⚠️ {homaIqData.abnormalCount} parameter(s) need attention
                      </div>
                    )}

                    <div className="report-preview">
                      <p className="ocr-preview">
                        {report.ocr_text ? report.ocr_text.substring(0, 150) + '...' : 'No OCR text available'}
                      </p>
                    </div>

                    <div className="report-actions">
                      <button onClick={() => viewReport(report)} className="btn btn-view">
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Report Details Modal */}
      {selectedReport && (() => {
        const homaIqData = getHomaIQScore(selectedReport.extracted_data);
        const healthMetrics = getHealthMetrics(selectedReport.extracted_data);
        
        // Print function
        const handlePrint = () => {
          window.print();
        };
        
        return (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content modal-content-wide" onClick={(e) => e.stopPropagation()}>
              {/* Print-only header */}
              <div className="print-header clinical-report-header">
                <h1>C.O.D-HOMA I.Q. SCORE</h1>
                <div className="subtitle">CARDIO OBESITY DIABETES - HOMA INTELLIGENCE QUOTIENT</div>
                <div className="doctor-info">
                  <div style={{ fontWeight: 'bold', marginTop: '10px' }}>
                    Devised by: Dr. Muddu Surendra Nehru, MD
                  </div>
                  <div>Founder & Professor of Medicine | Metabolism Specialist</div>
                  <div>📞 09963721999 | 🌐 www.homahealthcarecenter.in</div>
                </div>
                <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                  Report Generated: {new Date().toLocaleString()}
                </div>
              </div>

              <div className="modal-header">
                <div>
                  <h2>📊 {modalPage === 1 ? 'Health Metrics Dashboard' : 'Lab Report Details'}</h2>
                  <p className="modal-subtitle">
                    {selectedReport.patient_name || 'Patient'} • {selectedReport.report_type || 'Lab Report'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={handlePrint} className="btn-print">
                    🖨️ Print Report
                  </button>
                  <button onClick={closeModal} className="btn-close">✖</button>
                </div>
              </div>

              {/* Print-only Patient Info */}
              <div className="patient-info-print">
                <div className="info-item">
                  <div className="info-label">Patient Name</div>
                  <div className="info-value">{selectedReport.patient_name || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Patient ID</div>
                  <div className="info-value">{selectedReport.patient_id || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Report Date</div>
                  <div className="info-value">{formatDate(selectedReport.uploaded_at)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Report Type</div>
                  <div className="info-value">{selectedReport.report_type || 'Lab Report'}</div>
                </div>
              </div>

              {/* Page Navigation */}
              <div className="modal-page-nav">
                <button 
                  className={`page-nav-btn ${modalPage === 1 ? 'active' : ''}`}
                  onClick={() => setModalPage(1)}
                >
                  📊 Health Metrics
                </button>
                <button 
                  className={`page-nav-btn ${modalPage === 2 ? 'active' : ''}`}
                  onClick={() => setModalPage(2)}
                >
                  📄 Report Details
                </button>
              </div>

              <div className="modal-body">
                {/* PAGE 1: SPEEDOMETER GAUGES */}
                {modalPage === 1 && (
                  <div className="speedometer-page">
                    {healthMetrics && (healthMetrics.homaIR || healthMetrics.tygIndex || healthMetrics.bmi || healthMetrics.waistCircumference) ? (
                      <>
                        <div className="speedometer-intro">
                          <h3>🎯 Your Health Metrics at a Glance</h3>
                          <p>These visual indicators show your key metabolic health markers. Each gauge displays your current status with color-coded zones.</p>
                        </div>
                        
                        <div className="speedometers-grid">
                          {/* 1. HOMA-IR Gauge */}
                          {healthMetrics.homaIR && (
                            <SpeedometerGauge
                              metric={healthMetrics.homaIR}
                              title="HOMA-IR"
                              subtitle="Insulin Resistance Index"
                            />
                          )}
                          
                          {/* 2. TYG Index Gauge */}
                          {healthMetrics.tygIndex && (
                            <SpeedometerGauge
                              metric={healthMetrics.tygIndex}
                              title="TYG Index"
                              subtitle="Triglyceride-Glucose Index"
                            />
                          )}
                          
                          {/* 3. BMI Gauge */}
                          {healthMetrics.bmi && (
                            <SpeedometerGauge
                              metric={{
                                ...healthMetrics.bmi,
                                value: healthMetrics.bmi.value
                              }}
                              title="BMI"
                              subtitle="Body Mass Index"
                            />
                          )}
                          
                          {/* 4. Waist Circumference Gauge */}
                          {healthMetrics.waistCircumference && (
                            <SpeedometerGauge
                              metric={{
                                ...healthMetrics.waistCircumference,
                                value: `${healthMetrics.waistCircumference.value}cm / ${healthMetrics.waistCircumference.valueInches}"`
                              }}
                              title="Waist Circumference"
                              subtitle="Abdominal Health Indicator"
                            />
                          )}
                        </div>
                        
                        <div className="speedometer-footer">
                          <p className="footer-note">
                            💡 <strong>Tip:</strong> Green zones indicate optimal health, while red zones suggest areas that need attention. 
                            Click "Report Details" to see specific lab values.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="no-metrics">
                        <div className="no-metrics-content">
                          <h3>📊 Health Metrics Not Available</h3>
                          <p>Some required values (glucose, insulin, triglycerides, weight, height, waist circumference) were not found in the lab report.</p>
                          <p>Upload a more comprehensive lab report to see your health metrics visualization.</p>
                          <button onClick={() => setModalPage(2)} className="btn btn-primary">
                            View OCR Report Details →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PAGE 2: DETAILED REPORT */}
                {modalPage === 2 && (
                <div className="report-details">
                  {/* C.O.D-HOMA IQ Score Section */}
                  {homaIqData && homaIqData.success && (
                    <div className="detail-section homa-iq-section">
                      <h3>🎯 {homaIqData.title || homaIqData.fullTitle || 'HOMA-IQ Clinical Score'}</h3>
                      {homaIqData.devisedBy && (
                        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '-10px', marginBottom: '15px' }}>
                          {homaIqData.devisedBy}
                        </p>
                      )}
                      <div className="homa-iq-display">
                        <div className="homa-iq-score-large" style={{ backgroundColor: homaIqData.riskColor }}>
                          <div className="score-value">{homaIqData.score || homaIqData.homaIQScore}</div>
                          <div className="score-label">/ 100</div>
                        </div>
                        <div className="homa-iq-details">
                          <h4 style={{ color: homaIqData.riskColor }}>{homaIqData.riskLevel}</h4>
                          <p>{homaIqData.riskDescription}</p>
                          <div className="parameters-summary">
                            <span>✅ Parameters Assessed: {homaIqData.parametersAssessed || '7'}</span>
                            {homaIqData.abnormalCount > 0 && (
                              <span className="abnormal-count">⚠️ Abnormal: {homaIqData.abnormalCount}</span>
                            )}
                          </div>
                          
                          {/* Dr. Nehru Contact & 90-Day Program */}
                          {homaIqData.recommendation && (
                            <div style={{
                              marginTop: '20px',
                              padding: '15px',
                              background: '#fff3cd',
                              border: '2px solid #ffc107',
                              borderRadius: '8px',
                              color: '#856404'
                            }}>
                              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95em', lineHeight: '1.6' }}>
                                {homaIqData.recommendation}
                              </p>
                              {homaIqData.doctorInfo && (
                                <div style={{ marginTop: '10px', fontSize: '0.85em', borderTop: '1px solid #ffc107', paddingTop: '10px' }}>
                                  <p style={{ margin: '5px 0' }}><strong>📞 Phone:</strong> {homaIqData.doctorInfo.phone}</p>
                                  <p style={{ margin: '5px 0' }}><strong>🌐 Website:</strong> {homaIqData.doctorInfo.website}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Abnormal Parameters Alert */}
                      {homaIqData.abnormalParameters && homaIqData.abnormalParameters.length > 0 && (
                        <div className="abnormal-parameters">
                          <h4>⚠️ Parameters Requiring Attention:</h4>
                          <div className="abnormal-list">
                            {homaIqData.abnormalParameters.map((param, index) => (
                              <div key={index} className="abnormal-item">
                                <strong>{param.parameter}:</strong> {param.value} {param.unit}
                                <span className="param-status">({param.status})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* HOMA-IR if available */}
                      {homaIqData.homaIR && (
                        <div className="homa-ir-display">
                          <h4>🔬 HOMA-IR (Insulin Resistance):</h4>
                          <p><strong>Value:</strong> {homaIqData.homaIR.value}</p>
                          <p><strong>Classification:</strong> <span className={homaIqData.homaIR.isAbnormal ? 'abnormal-text' : 'normal-text'}>
                            {homaIqData.homaIR.classification}
                          </span></p>
                        </div>
                      )}

                      {/* Recommendations */}
                      {homaIqData.recommendations && (
                        <div className="recommendations">
                          <h4>💡 Clinical Recommendations:</h4>
                          <ul>
                            {homaIqData.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detailed Lab Values */}
                  {homaIqData && homaIqData.detailedAssessments && Object.keys(homaIqData.detailedAssessments).length > 0 && (
                    <div className="detail-section">
                      <h3>📊 Detailed Lab Values Assessment</h3>
                      <div className="lab-values-table">
                        {Object.entries(homaIqData.detailedAssessments).map(([key, assessment]) => (
                          <div key={key} className={`lab-value-row ${assessment.isAbnormal ? 'abnormal-row' : ''}`}>
                            <div className="lab-param-name">{key.toUpperCase()}</div>
                            <div className="lab-param-value">
                              {assessment.value} {assessment.unit}
                            </div>
                            <div className="lab-param-status" style={{ color: assessment.isAbnormal ? '#ef4444' : '#10b981' }}>
                              {assessment.status}
                            </div>
                            <div className="lab-param-score">
                              Score: {assessment.score}/100
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="detail-section">
                    <h3>👤 Patient Information</h3>
                    <p><strong>Patient ID:</strong> {selectedReport.patient_id || 'N/A'}</p>
                    <p><strong>Patient Name:</strong> {selectedReport.patient_name || 'N/A'}</p>
                    <p><strong>Report Type:</strong> {selectedReport.report_type || 'N/A'}</p>
                  </div>

                  <div className="detail-section">
                    <h3>📝 Report Information</h3>
                    <p><strong>Status:</strong> <span className={`status-badge status-${selectedReport.status}`}>{selectedReport.status}</span></p>
                    <p><strong>Uploaded:</strong> {formatDate(selectedReport.uploaded_at)}</p>
                    <p><strong>Processed:</strong> {selectedReport.processed_at ? formatDate(selectedReport.processed_at) : 'N/A'}</p>
                    <p><strong>Uploaded By:</strong> {selectedReport.uploaded_by_name || selectedReport.uploaded_by_email}</p>
                  </div>

                  <div className="detail-section">
                    <h3>🔍 OCR Extracted Text</h3>
                    <div className="ocr-text-full">
                      {selectedReport.ocr_text || 'No OCR text available'}
                    </div>
                  </div>

                  {selectedReport.image_path && (
                    <div className="detail-section">
                      <h3>📷 Lab Report Image</h3>
                      <img 
                        src={`http://localhost:3008/${selectedReport.image_path}`} 
                        alt="Lab Report" 
                        className="report-image"
                      />
                    </div>
                  )}
                </div>
                )}
              </div>

              {/* Print-only Footer */}
              <div className="print-footer">
                <div style={{ marginBottom: '15px' }}>
                  <strong>📞 FOR CONSULTATION & 90-DAY REMISSION PROGRAM:</strong>
                </div>
                <div>
                  Dr. Muddu Surendra Nehru, MD | Founder & Professor of Medicine | Metabolism Specialist
                </div>
                <div>
                  📞 09963721999 | 🌐 www.homahealthcarecenter.in
                </div>
                <div style={{ marginTop: '10px', fontSize: '10px', color: '#999' }}>
                  Report generated by C.O.D-HOMA I.Q. SCORE System | {new Date().toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
                  This is a computer-generated report. Please consult your physician for medical advice.
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => deleteReport(selectedReport.id)} className="btn btn-danger">
                  🗑️ Delete Report
                </button>
                <button onClick={closeModal} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Dashboard;

