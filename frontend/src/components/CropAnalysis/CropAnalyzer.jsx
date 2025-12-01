// frontend/src/components/CropAnalysis/CropAnalyzer.jsx
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import cropAnalysisService from '../../services/cropAnalysisService';
import { FiUpload, FiLoader, FiCheck, FiX, FiCamera, FiFileText, FiTarget, FiTrendingUp, FiDroplet, FiShield, FiCalendar, FiDownload, FiEye } from 'react-icons/fi';
import './CropAnalyzer.css';

const CropAnalyzer = () => {
  const { i18n } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [journal, setJournal] = useState([]);
  const fileInputRef = useRef(null);

  // Load journal from localStorage
  const loadJournal = React.useCallback(() => {
    try {
      console.log('Loading crop analysis journal...');

      // Load journal from localStorage (client-side storage)
      const savedJournal = localStorage.getItem('cropAnalysisJournal');
      let journalData = [];

      if (savedJournal) {
        journalData = JSON.parse(savedJournal);
      }

      // Add current analysis result to journal if available
      if (result && result.analysis_id) {
        // Construct full download URL for journal entry
        let fullDownloadUrl = null;
        if (result.downloadUrl) {
          const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/api\/v1.*$/, '');
          fullDownloadUrl = `${baseUrl}${result.downloadUrl}`;
        }

        const journalEntry = {
          _id: result.analysis_id,
          timestamp: result.timestamp || new Date().toISOString(),
          disease: result.crop_analysis?.disease || 'Analysis Complete',
          confidence: result.crop_analysis?.confidence_scores?.disease || 95,
          cropType: result.crop_analysis?.crop_type || 'Unknown',
          severity: result.crop_analysis?.disease_severity_percent || 0,
          imageUrl: preview,
          filename: result.filename,
          pdfFilename: result.pdfFilename,
          downloadUrl: fullDownloadUrl, // Use full constructed URL
          analysisData: result.analysisData
        };

        // Add to beginning of journal (most recent first)
        const existingIndex = journalData.findIndex(entry => entry._id === result.analysis_id);
        if (existingIndex === -1) {
          journalData.unshift(journalEntry);
          // Keep only last 20 entries
          journalData = journalData.slice(0, 20);
          localStorage.setItem('cropAnalysisJournal', JSON.stringify(journalData));
        }
      }

      setJournal(journalData);
      console.log(`Loaded ${journalData.length} journal entries`);
    } catch (err) {
      console.error('Failed to load journal:', err);
      setJournal([]);
    }
  }, [result, preview]);

  // Load journal on component mount
  React.useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // File size validation
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please select an image under 10MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    try {
      if (!selectedFile) return;

      setAnalyzing(true);
      setError(null);

      // Map i18n language codes to the expected format
      const languageMap = {
        'en': 'English',
        'hi': 'Hindi',
        'kn': 'Kannada',
        'te': 'Telugu'
      };

      const currentLanguage = languageMap[i18n.language] || 'English';

      console.log('Frontend: Selected file:', selectedFile);
      console.log('Frontend: Language:', currentLanguage);

      // Call the API service - expect JSON response with analysis data
      const response = await cropAnalysisService.analyzeCrop(
        selectedFile,
        currentLanguage,
        'json' // Get JSON format first
      );

      console.log('Analysis response received');
      console.log('Response data:', response);
      console.log('Response pdfFilename:', response.pdfFilename);
      console.log('Response downloadUrl:', response.downloadUrl);

      // Handle JSON response from server with analysis data
      if (!response || !response.success) {
        throw new Error('Invalid response format from server');
      }

      // Create proper PDF download URL from the backend response
      let downloadUrl = null;
      if (response.downloadUrl) {
        // Backend returns '/api/v1/crop-analysis/reports/filename.pdf'
        // Construct full URL by combining base URL with the returned path
        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/api\/v1.*$/, '');
        downloadUrl = `${baseUrl}${response.downloadUrl}`;
        console.log('PDF Download URL constructed:', downloadUrl);
      }

      // Use the analysis data from the JSON response
      const newResult = {
        ...response.analysisData, // Backend provides this first
        analysis_id: response.pdfFilename || `analysis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        downloadUrl,
        pdfFilename: response.pdfFilename,
        filename: response.filename,
        uploadedAt: response.uploadedAt
      };

      console.log('Analysis result data:', newResult);

      setResult(newResult);

      // Persist a journal entry to localStorage immediately so the UI updates
      // reliably without depending on React state updates timing.
      try {
        const savedJournal = localStorage.getItem('cropAnalysisJournal');
        let journalData = savedJournal ? JSON.parse(savedJournal) : [];

        const journalEntry = {
          _id: newResult.analysis_id,
          timestamp: newResult.timestamp || new Date().toISOString(),
          disease: newResult.crop_analysis?.disease || 'Analysis Complete',
          confidence: newResult.crop_analysis?.confidence_scores?.disease || 95,
          cropType: newResult.crop_analysis?.crop_type || 'Unknown',
          severity: newResult.crop_analysis?.disease_severity_percent || 0,
          imageUrl: preview,
          filename: newResult.filename,
          pdfFilename: newResult.pdfFilename,
          downloadUrl: downloadUrl, // Use the constructed downloadUrl
          analysisData: newResult.analysisData
        };

        const exists = journalData.find((e) => e._id === journalEntry._id);
        if (!exists) {
          journalData.unshift(journalEntry);
          journalData = journalData.slice(0, 20);
          localStorage.setItem('cropAnalysisJournal', JSON.stringify(journalData));
        }
      } catch (lsErr) {
        console.warn('Failed to persist journal entry locally:', lsErr);
      }

      loadJournal(); // Refresh journal after analysis

    } catch (err) {
      console.error('Analysis error:', err);
      console.error('Error response:', err.response);
      console.error('Error response.data:', err.response?.data);

      let serverMsg = null;
      if (err.response?.data) {
        try {
          const text = new TextDecoder().decode(err.response.data);
          const jsonError = JSON.parse(text);
          serverMsg = jsonError.detail || jsonError.message || jsonError.error;
        } catch (e) {
          serverMsg = err.response.data?.detail || err.response.data?.message || err.response.data?.error;
        }
      }

      setError(serverMsg || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup blob URLs when component unmounts or when result changes
  React.useEffect(() => {
    return () => {
      if (result?.downloadUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(result.downloadUrl);
        console.log('🧹 Revoked blob URL:', result.downloadUrl);
      }
    };
  }, [result]);

  // Cleanup preview blob URL to prevent memory leaks
  React.useEffect(() => {
    if (!preview) return;
    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="crop-analyzer">
      <div className="container">
        <div className="crop-analyzer-header">
          <h1><FiCamera /> Crop Disease Analyzer</h1>
          <p>AI-powered crop disease detection and health monitoring</p>
        </div>

        <div className="crop-analyzer-content">
          {/* Upload Section */}
          <div className="upload-section">
            <div className="upload-card">
              <h2>Upload Crop Image</h2>

              {!selectedFile ? (
                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                  <FiUpload className="upload-icon" />
                  <p>Click to upload or drag and drop</p>
                  <span>JPG, PNG up to 10MB</span>
                </div>
              ) : (
                <div className="preview-area">
                  {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                  <img src={preview} alt="Crop selected for disease analysis" className="crop-preview" />
                  <button className="remove-btn" onClick={resetAnalysis}>
                    <FiX />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {selectedFile && !analyzing && !result && (
                <button className="analyze-btn" onClick={handleAnalyze}>
                  <FiLoader /> Analyze Disease
                </button>
              )}

              {analyzing && (
                <div className="analyzing">
                  <FiLoader className="spinning" />
                  <p>Analyzing your crop image...</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="results-section">
              <div className="results-card">
                <h2><FiCheck /> Analysis Results</h2>

                <div className="disease-result">
                  <div className="disease-header">
                    <h3>{result.crop_analysis?.disease || 'Analysis Complete'}</h3>
                    <span className={`confidence ${(result.crop_analysis?.confidence_scores?.disease || 0.95) > 0.8 ? 'high' : 'medium'}`}>
                      {((result.crop_analysis?.confidence_scores?.disease || 0.95) * 100).toFixed(1)}% confidence
                    </span>
                  </div>

                  {/* Crop Information */}
                  <div className="crop-info">
                    <div className="info-item">
                      <FiTarget />
                      <span><strong>Crop Type:</strong> {result.crop_analysis?.crop_type || result.geminiAnalysis?.cropType || 'Analysis Complete'}</span>
                    </div>
                    <div className="info-item">
                      <FiTrendingUp />
                      <span><strong>Severity:</strong> {result.crop_analysis?.disease_severity_percent?.toFixed(1) || result.geminiAnalysis?.severityAssessment?.percentageAffected || 0}%</span>
                    </div>
                    <div className="info-item">
                      <FiTrendingUp />
                      <span><strong>Predicted Yield:</strong> {result.crop_analysis?.predicted_yield?.toFixed(1) || result.geminiAnalysis?.yieldPrediction ? 85 : 0} tons/acre</span>
                    </div>
                  </div>

                  {/* Fertilizer & Pesticide Recommendations */}
                  <div className="recommendations-section">
                    <h4><FiShield /> Treatment Recommendations</h4>
                    <div className="treatment-grid">
                      <div className="treatment-item">
                        <strong>Fertilizer:</strong> {result.crop_analysis?.fertilizer_recommendation || result.geminiAnalysis?.treatmentRecommendations?.fertilizerSuggestions || 'See PDF Report'}
                        <br />
                        <small>Dose: {result.crop_analysis?.fertilizer_dose || 'See PDF Report'}</small>
                      </div>
                      <div className="treatment-item">
                        <strong>Pesticide:</strong> {result.crop_analysis?.pesticide_recommendation || result.geminiAnalysis?.treatmentRecommendations?.pesticideRecommendations?.chemical || 'See PDF Report'}
                        <br />
                        <small>Dose: {result.crop_analysis?.pesticide_dose || 'See PDF Report'}</small>
                      </div>
                    </div>
                  </div>

                  {/* Smart Recommendations */}
                  <div className="smart-recommendations">
                    <h4><FiDroplet /> Smart Recommendations</h4>

                    <div className="recommendation-item">
                      <strong>Irrigation:</strong> {result.geminiAnalysis?.smartFarmingRecommendations?.irrigationAdvice || result.crop_analysis?.irrigation_advice || 'See PDF Report'}
                    </div>

                    <div className="recommendation-item">
                      <strong>Prevention Strategies:</strong>
                      <ul>
                        <li>{result.geminiAnalysis?.smartFarmingRecommendations?.preventionStrategies || result.crop_analysis?.prevention_strategies?.[0] || 'See PDF Report'}</li>
                      </ul>
                    </div>

                    <div className="recommendation-item">
                      <strong>Cultural Practices:</strong>
                      <ul>
                        <li>{result.geminiAnalysis?.smartFarmingRecommendations?.culturalPractices || result.crop_analysis?.growth_stage_tips?.[0] || 'See PDF Report'}</li>
                      </ul>
                    </div>
                  </div>

                  {/* PDF Download Section */}
                  {(result.downloadUrl || result.pdfFilename) && (
                    <div className="pdf-download-section">
                      <h4><FiFileText /> Analysis Report</h4>
                      <div className="download-container">
                        <p>Your detailed analysis report is ready for download.</p>
                        <a
                          href={result.downloadUrl || `${(process.env.REACT_APP_API_URL || 'http://localhost:5005').replace(/\/api\/v1.*$/, '')}/api/v1/crop-analysis/reports/${result.pdfFilename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download-btn"
                          onClick={(e) => {
                            const downloadUrl = result.downloadUrl || `${(process.env.REACT_APP_API_URL || 'http://localhost:5005').replace(/\/api\/v1.*$/, '')}/api/v1/crop-analysis/reports/${result.pdfFilename}`;
                            console.log('Download button clicked, URL:', downloadUrl);
                            // Optional: Add download attribute for better browser handling
                            e.currentTarget.setAttribute('download', `crop-analysis-${result.pdfFilename || 'report'}.pdf`);
                          }}
                        >
                          <FiFileText /> Download PDF Report
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Yield Prediction */}
                  <div className="yield-prediction">
                    <h4><FiTrendingUp /> Yield Prediction</h4>
                    <div className="prediction-item">
                      <strong>Forecast:</strong> {result.geminiAnalysis?.yieldPrediction?.forecastAnalysis || 'See PDF Report'}
                    </div>
                    <div className="prediction-item">
                      <strong>Confidence:</strong> {result.geminiAnalysis?.yieldPrediction?.confidenceScore ? ((result.geminiAnalysis.yieldPrediction.confidenceScore) * 100).toFixed(1) : 80}%
                    </div>
                  </div>

                  {/* Safety Precautions */}
                  <div className="safety-precautions">
                    <h4><FiShield /> Safety Precautions</h4>
                    <p>{result.geminiAnalysis?.treatmentRecommendations?.safetyPrecautions || 'See PDF Report'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="error-section">
              <div className="error-card">
                <FiX className="error-icon" />
                <p>{error}</p>
                <button onClick={resetAnalysis}>Try Again</button>
              </div>
            </div>
          )}

          {/* Journal Section */}
          <div className="journal-section">
            <div className="journal-header">
              <h2><FiFileText /> Crop Analysis Journal</h2>
              <p>History of your crop disease analyses</p>
            </div>

            {journal.length === 0 ? (
              <div className="empty-journal">
                <FiFileText />
                <p>No analysis history yet</p>
                <span>Upload and analyze crop images to see your history here</span>
              </div>
            ) : (
              <div className="journal-entries">
                {journal.map((entry) => (
                  <div key={entry._id} className="journal-entry">
                    {entry.imageUrl && (
                      <div className="entry-image">
                        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                        <img src={entry.imageUrl} alt="Analyzed crop image" />
                      </div>
                    )}

                    <div className="entry-content">
                      <div className="entry-header">
                        <h3>{entry.disease}</h3>
                        <span className={`confidence ${entry.confidence > 80 ? 'high' : entry.confidence > 60 ? 'medium' : 'low'}`}>
                          {entry.confidence}% confidence
                        </span>
                      </div>

                      {/* Enhanced journal entry details */}
                      <div className="entry-stats">
                        <div className="stat-item">
                          <FiTarget />
                          <span><strong>Crop:</strong> {entry.cropType}</span>
                        </div>
                        <div className="stat-item">
                          <FiTrendingUp />
                          <span><strong>Severity:</strong> {entry.severity}%</span>
                        </div>
                        <div className="stat-item">
                          <FiCalendar />
                          <span><strong>Date:</strong> {new Date(entry.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action buttons for journal entries */}
                      <div className="entry-actions">
                        {/* Show download button only for entries that have PDF data */}
                        {(entry.downloadUrl || entry.pdfFilename) && (
                          <a
                            href={entry.downloadUrl || (entry.pdfFilename ? `${(process.env.REACT_APP_API_URL || 'http://localhost:5005').replace(/\/api\/v1.*$/, '')}/api/v1/crop-analysis/reports/${entry.pdfFilename}` : '#')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn download"
                            onClick={(e) => {
                              const downloadUrl = entry.downloadUrl || (entry.pdfFilename ? `${(process.env.REACT_APP_API_URL || 'http://localhost:5005').replace(/\/api\/v1.*$/, '')}/api/v1/crop-analysis/reports/${entry.pdfFilename}` : '#');
                              console.log('Downloading PDF for entry:', entry._id, 'URL:', downloadUrl);
                              e.currentTarget.setAttribute('download', `crop-analysis-${entry.pdfFilename || 'report'}.pdf`);
                            }}
                          >
                            <FiDownload /> Download PDF
                          </a>
                        )}
                        <button
                          className="action-btn view"
                          onClick={() => {
                            // Could implement view details modal here
                            console.log('View details for:', entry._id, entry);
                          }}
                        >
                          <FiEye /> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropAnalyzer;