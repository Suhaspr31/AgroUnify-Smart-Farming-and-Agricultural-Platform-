import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiActivity } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import Loader from '../../components/common/Loader';
import './DeviceDetail.css';

const DeviceDetail = () => {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviceDetails();
  }, [id]);

  const fetchDeviceDetails = () => {
    setLoading(true);
    setTimeout(() => {
      setDevice({
        id: id,
        name: 'Soil Sensor 1',
        type: 'Soil Moisture',
        location: 'Field A - North',
        status: 'Online',
        battery: 85,
        value: 65,
        unit: '%',
        lastUpdate: '2025-10-21T11:30:00',
        serialNumber: 'SN-2025-001',
        installDate: '2025-06-15',
        readings: [
          { time: '06:00', value: 68 },
          { time: '08:00', value: 66 },
          { time: '10:00', value: 64 },
          { time: '12:00', value: 65 },
          { time: '14:00', value: 63 }
        ]
      });
      setLoading(false);
    }, 800);
  };

  if (loading) return <Loader fullPage />;
  if (!device) return <div className="container"><p>Device not found</p></div>;

  const chartData = {
    labels: device.readings.map(r => r.time),
    datasets: [{
      label: `${device.type} (${device.unit})`,
      data: device.readings.map(r => r.value),
      borderColor: '#2ecc71',
      backgroundColor: 'rgba(46, 204, 113, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: false },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="device-detail-page">
      <div className="container">
        <Link to="/iot" className="back-link">
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <div className="device-header">
          <div>
            <h1>{device.name}</h1>
            <p>{device.type}</p>
          </div>
          <div className={`status-badge ${device.status.toLowerCase()}`}>
            {device.status}
          </div>
        </div>
        <div className="device-content">
          <div className="info-section">
            <h2>Current Reading</h2>
            <div className="current-value">
              <span className="value">{device.value}</span>
              <span className="unit">{device.unit}</span>
            </div>
          </div>
          <div className="info-section">
            <h2>Device Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Serial Number</span>
                <span className="value">{device.serialNumber}</span>
              </div>
              <div className="info-item">
                <span className="label">Location</span>
                <span className="value">{device.location}</span>
              </div>
              <div className="info-item">
                <span className="label">Battery</span>
                <span className="value">{device.battery}%</span>
              </div>
              <div className="info-item">
                <span className="label">Last Update</span>
                <span className="value">{new Date(device.lastUpdate).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="info-section">
            <h2>Reading History (Today)</h2>
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetail;
