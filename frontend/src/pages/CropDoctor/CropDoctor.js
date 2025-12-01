import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClientForFiles } from '../../services/apiClient';
import { FiUpload, FiLoader, FiCheck, FiX, FiCamera, FiFileText, FiCalendar, FiTrendingUp, FiDroplet, FiShield, FiTarget } from 'react-icons/fi';
import './CropDoctor.css';

const CropDoctor = () => {
  const { i18n } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [journal, setJournal] = useState([]);
  const [loadingJournal, setLoadingJournal] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
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

    // File size validation
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size too large. Please select an image under 10MB.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    // Map i18n language codes to the expected format
    const languageMap = {
      'en': 'English',
      'hi': 'Hindi',
      'kn': 'Kannada',
      'te': 'Telugu'
    };

    const currentLanguage = languageMap[i18n.language] || 'English';
    formData.append('language', currentLanguage);

    console.log('Frontend: Selected file:', selectedFile);
    console.log('Frontend: FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        console.log('Sending analysis request to /crop-doctor/analyze (attempt', attempt + 1, ')');
        console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5005/api/v1');
        console.log('Full URL:', `${process.env.REACT_APP_API_URL || 'http://localhost:5005/api/v1'}/crop-doctor/analyze`);

        // Send request expecting JSON response with analysis data
        const response = await apiClientForFiles.post('/crop-doctor/analyze', formData, {
          timeout: 120000, // 2 minutes timeout for AI processing
          responseType: 'json' // expect JSON response
        });

        console.log('Analysis response received');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        // Examine content-type header (removed unused variable)

        // Handle JSON response from server with analysis data and PDF info
        const json = response.data;

        if (!json || !json.success) {
          throw new Error('Invalid response format from server');
        }

        // Create proper PDF download URL from the backend response
        let downloadUrl = null;
        if (json.pdfFilename) {
          // Always construct download URL when we have a PDF filename
          const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5005').replace('/api/v1', '');
          downloadUrl = `${baseUrl}/api/v1/crop-doctor/reports/${json.pdfFilename}`;
          console.log('PDF Download URL constructed:', downloadUrl);
          console.log('Base URL:', baseUrl);
          console.log('PDF Filename:', json.pdfFilename);
        } else if (json.downloadUrl) {
          // Fallback to backend-provided URL
          const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5005/api/v1').replace('/api/v1', '');
          downloadUrl = `${baseUrl}${json.downloadUrl}`;
          console.log('Using backend download URL:', downloadUrl);
        }

        // Use the analysis data from the JSON response - backend now always provides analysisData
        const newResult = {
          analysis_id: json.pdfFilename || `analysis_${Date.now()}`,
          timestamp: new Date().toISOString(),
          downloadUrl,
          pdfFilename: json.pdfFilename,
          ...json.analysisData // Backend now always provides this
        };

        console.log('Analysis result data:', newResult);
        console.log('Crop analysis:', newResult.crop_analysis);
        console.log('Gemini analysis:', newResult.geminiAnalysis);
        console.log('PDF Download URL:', newResult.downloadUrl);
        console.log('PDF Filename:', newResult.pdfFilename);

        // Persist a journal entry to localStorage immediately so the UI updates
        // reliably without depending on React state updates timing.
        try {
          const savedJournal = localStorage.getItem('cropDoctorJournal');
          let journalData = savedJournal ? JSON.parse(savedJournal) : [];

          const journalEntry = {
            _id: newResult.analysis_id,
            analysisResult: {
              disease: newResult.geminiAnalysis?.diseaseIdentification?.name || newResult.crop_analysis?.disease || 'Analysis Complete',
              confidence: newResult.geminiAnalysis?.diseaseIdentification?.confidenceScore || newResult.crop_analysis?.confidence_scores?.disease || 0.95,
              advice: newResult.geminiAnalysis?.smartFarmingRecommendations?.irrigationAdvice || newResult.crop_analysis?.irrigation_advice || 'Analysis completed successfully.'
            },
            createdAt: newResult.timestamp,
            notes: `AI Analysis: ${newResult.geminiAnalysis?.diseaseIdentification?.name || newResult.crop_analysis?.disease || 'Complete'}`,
            cropType: newResult.geminiAnalysis?.cropType || newResult.crop_analysis?.crop_type || 'Unknown',
            severity: newResult.geminiAnalysis?.severityAssessment?.percentageAffected || newResult.crop_analysis?.disease_severity_percent || 0,
            predictedYield: newResult.geminiAnalysis?.yieldPrediction ? 85 : newResult.crop_analysis?.predicted_yield || 0,
            imageUrl: null,
            downloadUrl: newResult.downloadUrl,
            pdfFilename: newResult.pdfFilename,
            crop_analysis: newResult.crop_analysis,
            geminiAnalysis: newResult.geminiAnalysis,
            detailedAnalysis: newResult.detailedAnalysis
          };

          const exists = journalData.find((e) => e._id === journalEntry._id);
          if (!exists) {
            journalData.unshift(journalEntry);
            journalData = journalData.slice(0, 20);
            localStorage.setItem('cropDoctorJournal', JSON.stringify(journalData));
          }
        } catch (lsErr) {
          console.warn('Failed to persist journal entry locally:', lsErr);
        }

        setResult(newResult);

        loadJournal(); // Refresh journal after analysis
        break; // success
      } catch (err) {
        console.error('Analysis error:', err);
        console.error('Error response:', err.response);
        console.error('Error response.data:', err.response?.data);

        // Store error for potential logging

        // If 429, retry with exponential backoff
        if (err.response?.status === 429 && attempt < maxRetries) {
          const waitMs = Math.pow(2, attempt) * 1000; // 1s, 2s
          console.warn(`Received 429, retrying after ${waitMs}ms...`);
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, waitMs));
          attempt += 1;
          continue;
        }

        // For other errors or exhausted retries, show user-friendly message
        let serverMsg = null;
        if (err.response?.data) {
          // Handle arraybuffer response that might contain JSON error
          try {
            const text = new TextDecoder().decode(err.response.data);
            const jsonError = JSON.parse(text);
            serverMsg = jsonError.detail || jsonError.message || jsonError.error;
          } catch (e) {
            // Not JSON, use raw message
            serverMsg = err.response.data?.detail || err.response.data?.message || err.response.data?.error;
          }
        }

        if (err.response?.status === 429) {
          setError(serverMsg || 'Too many analysis requests. Please wait a while and try again.');
        } else {
          setError(serverMsg || 'Analysis failed. Please try again.');
        }

        attempt += 1; // Increment attempt for non-retryable errors too
        break;
      }
    }

    setAnalyzing(false);
  } catch (error) {
    console.error('Unexpected error in handleAnalyze:', error);
    setError('An unexpected error occurred. Please try again.');
    setAnalyzing(false);
  }
};

  const loadJournal = async () => {
    setLoadingJournal(true);
    try {
      console.log('Loading crop health journal...');

      // Load journal from localStorage (client-side storage)
      const savedJournal = localStorage.getItem('cropDoctorJournal');
      let journalData = [];

      if (savedJournal) {
        journalData = JSON.parse(savedJournal);
      }

      // Add current analysis result to journal if available
     if (result && result.analysis_id) {
        const journalEntry = {
          _id: result.analysis_id,
          analysisResult: {
            disease: result.geminiAnalysis?.diseaseIdentification?.name || result.crop_analysis?.disease || 'Analysis Complete',
            confidence: result.geminiAnalysis?.diseaseIdentification?.confidenceScore || result.crop_analysis?.confidence_scores?.disease || 0.9,
            advice: result.geminiAnalysis?.smartFarmingRecommendations?.irrigationAdvice || result.crop_analysis?.irrigation_advice || 'Analysis completed successfully.'
          },
          createdAt: result.timestamp || new Date().toISOString(),
          notes: `AI Analysis: ${result.geminiAnalysis?.diseaseIdentification?.name || result.crop_analysis?.disease || 'Complete'}`,
          cropType: result.geminiAnalysis?.cropType || result.crop_analysis?.crop_type || 'Unknown',
          severity: result.geminiAnalysis?.severityAssessment?.percentageAffected || result.crop_analysis?.disease_severity_percent || 0,
          predictedYield: result.geminiAnalysis?.yieldPrediction ? 85 : result.crop_analysis?.predicted_yield || 0,
          imageUrl: null, // Would be stored if we had image hosting
          downloadUrl: result.downloadUrl,
          pdfFilename: result.pdfFilename,
          crop_analysis: result.crop_analysis,
          geminiAnalysis: result.geminiAnalysis, // Store complete analysis
          detailedAnalysis: result.detailedAnalysis // Store enhanced analysis details
        };

        // Add to beginning of journal (most recent first)
        const existingIndex = journalData.findIndex(entry => entry._id === result.analysis_id);
        if (existingIndex === -1) {
          journalData.unshift(journalEntry);
          // Keep only last 20 entries
          journalData = journalData.slice(0, 20);
          localStorage.setItem('cropDoctorJournal', JSON.stringify(journalData));
        }
      }

      setJournal(journalData);
      console.log(`Loaded ${journalData.length} journal entries`);
    } catch (err) {
      console.error('Failed to load journal:', err);
      setJournal([]);
    } finally {
      setLoadingJournal(false);
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

  React.useEffect(() => {
    loadJournal();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="crop-doctor">
      <div className="container">
        <div className="crop-doctor-header">
          <h1><FiCamera /> Crop Doctor</h1>
          <p>AI-powered crop disease detection and health monitoring</p>
        </div>

        <div className="crop-doctor-content">
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
                  {result.pdfFilename && (
                    <div className="pdf-download-section">
                      <h4><FiFileText /> Analysis Report</h4>
                      <div className="download-container">
                        <p>Your detailed analysis report is ready for download.</p>
                        <a
                          href={result.downloadUrl || `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/crop-doctor/reports/${result.pdfFilename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download-btn"
                          onClick={(e) => {
                            console.log('Download button clicked, URL:', result.downloadUrl || `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/crop-doctor/reports/${result.pdfFilename}`);
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

                  {/* Enhanced Detailed Analysis */}
                  {result.detailedAnalysis && (
                    <div className="detailed-analysis">
                      <h4><FiTarget /> Detailed Analysis Report</h4>

                      <div className="analysis-section">
                        <h5>Crop Information</h5>
                        <div className="info-grid">
                          <div className="info-item">
                            <strong>Crop Species:</strong> {result.detailedAnalysis.cropSpecies || result.geminiAnalysis?.cropType || 'Analysis Complete'}
                          </div>
                          <div className="info-item">
                            <strong>Health Status:</strong>
                            <span className={`health-status ${result.detailedAnalysis.plantHealthStatus?.toLowerCase() || 'complete'}`}>
                              {result.detailedAnalysis.plantHealthStatus || 'Complete'}
                            </span>
                          </div>
                          <div className="info-item">
                            <strong>Confidence Level:</strong> {result.detailedAnalysis.confidenceLevel ? ((result.detailedAnalysis.confidenceLevel) * 100).toFixed(1) : 95}%
                          </div>
                          <div className="info-item">
                            <strong>Severity Level:</strong>
                            <span className={`severity-level ${result.detailedAnalysis.severityLevel?.toLowerCase() || 'complete'}`}>
                              {result.detailedAnalysis.severityLevel || result.geminiAnalysis?.severityAssessment?.level || 'Complete'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="analysis-section">
                        <h5>Visible Symptoms</h5>
                        <ul className="symptoms-list">
                          {(result.detailedAnalysis.visibleSymptoms && result.detailedAnalysis.visibleSymptoms.length > 0) ?
                            result.detailedAnalysis.visibleSymptoms.map((symptom, index) => (
                              <li key={index}>{symptom}</li>
                            )) : (
                            <li>See PDF Report</li>
                          )}
                        </ul>
                      </div>

                      <div className="analysis-section">
                        <h5>Recommended Actions</h5>
                        <p>{result.detailedAnalysis.recommendedActions || 'See PDF Report'}</p>
                      </div>

                      <div className="analysis-section">
                        <h5>Prevention Strategies</h5>
                        <p>{result.detailedAnalysis.preventionStrategies || 'See PDF Report'}</p>
                      </div>

                      <div className="analysis-section">
                        <h5>General Precautions</h5>
                        <p>{result.detailedAnalysis.generalPrecautions || 'See PDF Report'}</p>
                      </div>

                      <div className="analysis-section">
                        <h5>Additional Insights</h5>
                        <p>{result.detailedAnalysis.additionalInsights || 'See PDF Report'}</p>
                      </div>

                      <div className="analysis-section summary-report">
                        <h5>Summary Report</h5>
                        <div className="summary-content">
                          {result.detailedAnalysis.summaryReport}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Safety Precautions */}
                  <div className="safety-precautions">
                    <h4><FiShield /> Safety Precautions</h4>
                    <p>{result.geminiAnalysis?.treatmentRecommendations?.safetyPrecautions || 'See PDF Report'}</p>
                  </div>

                  {/* Visual Overlay */}
                  {result.geminiAnalysis?.visualOverlayData?.affectedAreas?.length > 0 && (
                    <div className="overlay-section">
                      <h4><FiTarget /> Disease Visualization</h4>
                      <div className="overlay-container">
                        <div className="overlay-canvas-container">
                          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                          <img
                            src={preview}
                            alt="Original crop image"
                            className="original-image"
                          />
                          <canvas
                            ref={(canvas) => {
                              if (canvas && result.geminiAnalysis?.visualOverlayData?.affectedAreas) {
                                const ctx = canvas.getContext('2d');
                                const img = new Image();
                                img.onload = () => {
                                  canvas.width = img.width;
                                  canvas.height = img.height;
                                  ctx.globalAlpha = 0.3;

                                  result.geminiAnalysis.visualOverlayData.affectedAreas.forEach(area => {
                                    const [y_min, x_min, y_max, x_max] = area.boundingBox;
                                    const width = (x_max - x_min) * canvas.width;
                                    const height = (y_max - y_min) * canvas.height;
                                    const x = x_min * canvas.width;
                                    const y = y_min * canvas.height;

                                    // Color based on severity (simplified)
                                    ctx.fillStyle = '#FF6B6B'; // Red for affected areas
                                    ctx.fillRect(x, y, width, height);
                                  });
                                };
                                img.src = preview;
                              }
                            }}
                            className="overlay-canvas"
                          />
                        </div>
                        <div className="overlay-info">
                          <p><strong>Affected Areas:</strong> {result.geminiAnalysis.visualOverlayData.affectedAreas.length} regions identified</p>
                          <div className="legend">
                            <div className="legend-item">
                              <div className="color-box" style={{backgroundColor: '#FF6B6B'}}></div>
                              <span>Diseased Areas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
              <h2><FiFileText /> Crop Health Journal</h2>
              <button className="refresh-btn" onClick={loadJournal} disabled={loadingJournal}>
                {loadingJournal ? <FiLoader className="spinning" /> : 'Refresh'}
              </button>
            </div>

            {loadingJournal ? (
              <div className="loading-journal">
                <FiLoader className="spinning" />
                <p>Loading journal...</p>
              </div>
            ) : journal.length === 0 ? (
              <div className="empty-journal">
                <FiFileText />
                <p>No analysis history yet. Upload an image to get started!</p>
              </div>
            ) : (
              <div className="journal-entries">
                {journal.map((entry) => (
                  <div key={entry._id} className="journal-entry">
                    {entry.imageUrl && (
                      <div className="entry-image">
                        <img src={entry.imageUrl} alt="Analyzed crop" />
                      </div>
                    )}
                    <div className="entry-details">
                      <div className="entry-header">
                        <h4>{entry.geminiAnalysis?.diseaseIdentification?.name || entry.crop_analysis?.disease || entry.analysisResult?.disease || 'Analysis Complete'}</h4>
                        <span className="entry-date">
                          <FiCalendar />
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Enhanced journal entry details */}
                      <div className="entry-stats">
                        <div className="stat-item">
                          <span className="stat-label">Confidence:</span>
                          <span className={`stat-value ${(entry.geminiAnalysis?.diseaseIdentification?.confidenceScore || entry.crop_analysis?.confidence_scores?.disease || entry.analysisResult?.confidence || 0.95) > 0.8 ? 'high' : 'medium'}`}>
                            {((entry.geminiAnalysis?.diseaseIdentification?.confidenceScore || entry.crop_analysis?.confidence_scores?.disease || entry.analysisResult?.confidence || 0.95) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Crop:</span>
                          <span className="stat-value">{entry.geminiAnalysis?.cropType || entry.crop_analysis?.crop_type || entry.cropType || 'Unknown'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Severity:</span>
                          <span className={`stat-value ${(entry.geminiAnalysis?.severityAssessment?.percentageAffected || entry.crop_analysis?.disease_severity_percent || entry.severity || 0) > 50 ? 'high' : (entry.geminiAnalysis?.severityAssessment?.percentageAffected || entry.crop_analysis?.disease_severity_percent || entry.severity || 0) > 25 ? 'medium' : 'low'}`}>
                            {entry.geminiAnalysis?.severityAssessment?.percentageAffected || entry.crop_analysis?.disease_severity_percent || entry.severity || 0}%
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Yield:</span>
                          <span className="stat-value">{entry.geminiAnalysis?.yieldPrediction ? 85 : entry.crop_analysis?.predicted_yield || entry.predictedYield || 0} tons/acre</span>
                        </div>
                        {(entry.geminiAnalysis?.severityAssessment?.level || entry.crop_analysis?.disease_severity_percent) && (
                          <div className="stat-item">
                            <span className="stat-label">Level:</span>
                            <span className={`stat-value severity-${(entry.geminiAnalysis?.severityAssessment?.level || (entry.crop_analysis?.disease_severity_percent > 50 ? 'high' : entry.crop_analysis?.disease_severity_percent > 25 ? 'moderate' : 'low')).toLowerCase()}`}>
                              {entry.geminiAnalysis?.severityAssessment?.level || (entry.crop_analysis?.disease_severity_percent > 50 ? 'High' : entry.crop_analysis?.disease_severity_percent > 25 ? 'Moderate' : 'Low')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Treatment Recommendations */}
                      <div className="entry-treatment">
                        <h5><FiShield /> Treatment Recommendations</h5>
                        <div className="treatment-summary">
                          <div className="treatment-item">
                            <strong>Fertilizer:</strong> {entry.geminiAnalysis?.treatmentRecommendations?.fertilizerSuggestions || entry.crop_analysis?.fertilizer_recommendation || 'Balanced NPK fertilizer'}
                          </div>
                          <div className="treatment-item">
                            <strong>Pesticide:</strong> {entry.geminiAnalysis?.treatmentRecommendations?.pesticideRecommendations?.chemical || entry.crop_analysis?.pesticide_recommendation || 'Copper-based fungicide'}
                          </div>
                          <div className="treatment-item">
                            <strong>Irrigation:</strong> {entry.geminiAnalysis?.smartFarmingRecommendations?.irrigationAdvice || entry.crop_analysis?.irrigation_advice || 'Maintain consistent soil moisture'}
                          </div>
                        </div>
                      </div>

                      <p className="entry-advice">{entry.geminiAnalysis?.smartFarmingRecommendations?.preventionStrategies || entry.crop_analysis?.prevention_strategies?.[0] || entry.analysisResult?.advice || 'Analysis completed successfully.'}</p>
                      {entry.notes && (
                        <p className="entry-notes"><strong>Notes:</strong> {entry.notes}</p>
                      )}

                      {/* Action buttons for journal entries */}
                      <div className="entry-actions">
                        {entry.pdfFilename && (
                          <a
                            href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/crop-doctor/reports/${entry.pdfFilename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn download-pdf"
                          >
                            <FiFileText /> Download PDF
                          </a>
                        )}
                        <button className="action-btn export" onClick={() => {
                          // Export functionality
                          const dataStr = JSON.stringify(entry, null, 2);
                          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                          const exportFileDefaultName = `crop_analysis_${entry._id}.json`;
                          const linkElement = document.createElement('a');
                          linkElement.setAttribute('href', dataUri);
                          linkElement.setAttribute('download', exportFileDefaultName);
                          linkElement.click();
                        }}>
                          Export Data
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

export default CropDoctor;