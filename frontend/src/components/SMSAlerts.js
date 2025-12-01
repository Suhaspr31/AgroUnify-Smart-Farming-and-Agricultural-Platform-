import React, { useState } from 'react';
import smsService from '../services/smsService';
import './SMSAlerts.css';

const SMSAlerts = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Single SMS state
  const [singleSMS, setSingleSMS] = useState({
    to: '',
    message: '',
  });

  // Bulk SMS state
  const [bulkSMS, setBulkSMS] = useState({
    recipients: '',
    message: '',
  });

  // Weather alert state
  const [weatherAlert, setWeatherAlert] = useState({
    phoneNumber: '',
    alertType: 'heavy_rain',
    location: '',
    message: '',
  });

  // Price alert state
  const [priceAlert, setPriceAlert] = useState({
    phoneNumber: '',
    commodity: '',
    price: '',
    change: '',
    location: '',
  });

  const handleSingleSMSSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await smsService.sendSMS(
      singleSMS.to,
      singleSMS.message
    );

    if (result.success) {
      setMessage('✅ SMS sent successfully!');
      setSingleSMS({ to: '', message: '' });
    } else {
      setMessage('❌ Failed to send SMS: ' + result.message);
    }

    setLoading(false);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleBulkSMSSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const recipients = bulkSMS.recipients.split(',').map(r => r.trim());
    const result = await smsService.sendBulkSMS(
      recipients,
      bulkSMS.message
    );

    if (result.success) {
      setMessage(`✅ Bulk SMS sent! ${result.data.results.length} successful, ${result.data.errors.length} failed`);
      setBulkSMS({ recipients: '', message: '' });
    } else {
      setMessage('❌ Failed to send bulk SMS: ' + result.message);
    }

    setLoading(false);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleWeatherAlertSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await smsService.sendWeatherAlert(
      weatherAlert.phoneNumber,
      weatherAlert.alertType,
      weatherAlert.location,
      weatherAlert.message
    );

    if (result.success) {
      setMessage('✅ Weather alert SMS sent successfully!');
      setWeatherAlert({
        phoneNumber: '',
        alertType: 'heavy_rain',
        location: '',
        message: '',
      });
    } else {
      setMessage('❌ Failed to send weather alert: ' + result.message);
    }

    setLoading(false);
    setTimeout(() => setMessage(''), 5000);
  };

  const handlePriceAlertSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await smsService.sendPriceAlert(
      priceAlert.phoneNumber,
      priceAlert.commodity,
      priceAlert.price,
      priceAlert.change,
      priceAlert.location
    );

    if (result.success) {
      setMessage('✅ Price alert SMS sent successfully!');
      setPriceAlert({
        phoneNumber: '',
        commodity: '',
        price: '',
        change: '',
        location: '',
      });
    } else {
      setMessage('❌ Failed to send price alert: ' + result.message);
    }

    setLoading(false);
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="sms-alerts-container">
      <div className="sms-header">
        <h1>📱 SMS Alerts & Notifications</h1>
        <p>Send SMS alerts for weather, prices, and general notifications</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          📤 Single SMS
        </button>
        <button
          className={`tab ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          📢 Bulk SMS
        </button>
        <button
          className={`tab ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}
        >
          🌦️ Weather Alert
        </button>
        <button
          className={`tab ${activeTab === 'price' ? 'active' : ''}`}
          onClick={() => setActiveTab('price')}
        >
          📊 Price Alert
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'single' && (
          <form onSubmit={handleSingleSMSSubmit} className="sms-form">
            <h3>Send Single SMS</h3>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={singleSMS.to}
                onChange={(e) => setSingleSMS({...singleSMS, to: e.target.value})}
                placeholder="Enter phone number (with or without +91)"
                required
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                value={singleSMS.message}
                onChange={(e) => setSingleSMS({...singleSMS, message: e.target.value})}
                placeholder="Enter your message"
                rows="4"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Sending...' : '📤 Send SMS'}
            </button>
          </form>
        )}

        {activeTab === 'bulk' && (
          <form onSubmit={handleBulkSMSSubmit} className="sms-form">
            <h3>Send Bulk SMS</h3>
            <div className="form-group">
              <label>Recipients (comma-separated)</label>
              <textarea
                value={bulkSMS.recipients}
                onChange={(e) => setBulkSMS({...bulkSMS, recipients: e.target.value})}
                placeholder="Enter phone numbers separated by commas&#10;e.g., 9999999999, 8888888888, 7777777777"
                rows="3"
                required
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                value={bulkSMS.message}
                onChange={(e) => setBulkSMS({...bulkSMS, message: e.target.value})}
                placeholder="Enter your message"
                rows="4"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Sending...' : '📢 Send Bulk SMS'}
            </button>
          </form>
        )}

        {activeTab === 'weather' && (
          <form onSubmit={handleWeatherAlertSubmit} className="sms-form">
            <h3>Send Weather Alert</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={weatherAlert.phoneNumber}
                  onChange={(e) => setWeatherAlert({...weatherAlert, phoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Alert Type</label>
                <select
                  value={weatherAlert.alertType}
                  onChange={(e) => setWeatherAlert({...weatherAlert, alertType: e.target.value})}
                >
                  <option value="heavy_rain">Heavy Rain</option>
                  <option value="storm">Storm Warning</option>
                  <option value="heatwave">Heatwave</option>
                  <option value="cold_wave">Cold Wave</option>
                  <option value="flood">Flood Alert</option>
                  <option value="drought">Drought Alert</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={weatherAlert.location}
                onChange={(e) => setWeatherAlert({...weatherAlert, location: e.target.value})}
                placeholder="Enter location (e.g., Delhi, Mumbai)"
                required
              />
            </div>
            <div className="form-group">
              <label>Alert Message</label>
              <textarea
                value={weatherAlert.message}
                onChange={(e) => setWeatherAlert({...weatherAlert, message: e.target.value})}
                placeholder="Enter detailed weather alert message"
                rows="3"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Sending...' : '🌦️ Send Weather Alert'}
            </button>
          </form>
        )}

        {activeTab === 'price' && (
          <form onSubmit={handlePriceAlertSubmit} className="sms-form">
            <h3>Send Price Alert</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={priceAlert.phoneNumber}
                  onChange={(e) => setPriceAlert({...priceAlert, phoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Commodity</label>
                <select
                  value={priceAlert.commodity}
                  onChange={(e) => setPriceAlert({...priceAlert, commodity: e.target.value})}
                  required
                >
                  <option value="">Select Commodity</option>
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Maize">Maize</option>
                  <option value="Soybean">Soybean</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Current Price (₹)</label>
                <input
                  type="number"
                  value={priceAlert.price}
                  onChange={(e) => setPriceAlert({...priceAlert, price: e.target.value})}
                  placeholder="Enter current price"
                  required
                />
              </div>
              <div className="form-group">
                <label>Change (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={priceAlert.change}
                  onChange={(e) => setPriceAlert({...priceAlert, change: e.target.value})}
                  placeholder="e.g., +2.5 or -1.2"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={priceAlert.location}
                onChange={(e) => setPriceAlert({...priceAlert, location: e.target.value})}
                placeholder="Enter market location"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Sending...' : '📊 Send Price Alert'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SMSAlerts;