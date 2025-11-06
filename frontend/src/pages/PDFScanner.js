// PDF Health Scanner Page - Frontend-only PDF parsing
// Separate from main Dashboard - does NOT touch backend!
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PDFHealthScanner from '../components/PDFHealthScanner';
import './PDFScanner.css';

const PDFScanner = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="pdf-scanner-page">
      {/* Header with Navigation */}
      <div className="pdf-scanner-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🔬 OCR Lab Report System</h1>
            <span className="page-title">PDF Scanner (Frontend Only)</span>
          </div>
          <div className="header-right">
            <button onClick={handleBackToDashboard} className="btn-nav">
              ← Back to Dashboard
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <p>
          ℹ️ This is a <strong>frontend-only</strong> PDF scanner. 
          It extracts text directly in your browser without uploading to the backend.
          For full OCR processing with backend storage, use the main Dashboard.
        </p>
      </div>

      {/* PDF Scanner Component */}
      <PDFHealthScanner />
    </div>
  );
};

export default PDFScanner;

