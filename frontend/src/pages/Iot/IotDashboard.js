import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiDroplet, FiThermometer, FiWind, FiPlus } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import './IotDashboard.css';

const IotDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = () => {
    setLoading(true);
    setTimeout(() => {
      setDevices([
        {
          id: 1,
          name: 'Soil Sensor 1',
          type: 'Soil Moisture',
          location: 'Field A - North',
          status: 'Online',
          battery: 85,
          value: 65,
          unit: '%',
          lastUpdate: '2025-10-21T11:30:00'
        },
        {
          id: 2,
          name: 'Weather Station 1',
          type: 'Temperature',
          location: 'Field A - Center',
          status: 'Online',
          battery: 92,
          value: 28,
          unit: '°C',
          lastUpdate: '2025-10-21T11:30:00'
        },
        {
          id: 3,
          name: 'Humidity Sensor 1',
          type: 'Humidity',
          location: 'Field B - South',
          status: 'Online',
          battery: 78,
          value: 72,
          unit: '%',
          lastUpdate: '2025-10-21T11:29:00'
        },
        {
          id: 4,
          name: 'Wind Sensor 1',
          type: 'Wind Speed',
          location: 'Field A - North',
          status: 'Offline',
          battery: 15,
          value: 0,
          unit: 'km/h',
          lastUpdate: '2025-10-20T08:15:00'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Soil Moisture':
        return <FiDroplet />;
      case 'Temperature':
        return <FiThermometer />;
      case 'Humidity':
        return <FiDroplet />;
      case 'Wind Speed':
        return <FiWind />;
      default:
        return <FiActivity />;
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="iot-dashboard-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>IoT Devices Dashboard</h1>
            <p>Monitor and manage your smart farming sensors</p>
          </div>
          <Link to="/iot/add" className="btn btn-primary">
            <FiPlus /> Add Device
          </Link>
        </div>

        <div className="devices-stats">
          <div className="stat-card">
            <h3>{devices.length}</h3>
            <p>Total Devices</p>
          </div>
          <div className="stat-card">
            <h3>{devices.filter(d => d.status === 'Online').length}</h3>
            <p>Online</p>
          </div>
          <div className="stat-card">
            <h3>{devices.filter(d => d.status === 'Offline').length}</h3>
            <p>Offline</p>
          </div>
          <div className="stat-card">
            <h3>{Math.round(devices.reduce((sum, d) => sum + d.battery, 0) / devices.length)}%</h3>
            <p>Avg Battery</p>
          </div>
        </div>

        <div className="devices-grid">
          {devices.map(device => (
            <Link to={`/iot/device/${device.id}`} key={device.id} className="device-card">
              <div className="device-header">
                <div className="device-icon">
                  {getIcon(device.type)}
                </div>
                <div className={`device-status ${device.status.toLowerCase()}`}>
                  {device.status}
                </div>
              </div>
              <div className="device-content">
                <h3>{device.name}</h3>
                <p className="device-type">{device.type}</p>
                <p className="device-location">{device.location}</p>
                <div className="device-value">
                  <span className="value">{device.value}</span>
                  <span className="unit">{device.unit}</span>
                </div>
                <div className="device-meta">
                  <div className="battery">
                    <span>Battery: {device.battery}%</span>
                    <div className="battery-bar">
                      <div className="battery-fill" style={{ width: `${device.battery}%` }}></div>
                    </div>
                  </div>
                  <span className="last-update">
                    Updated: {new Date(device.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IotDashboard;
