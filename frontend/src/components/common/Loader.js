import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loader-overlay">
        <div className={`loader loader-${size}`}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`loader loader-${size}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
