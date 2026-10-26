import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading data...' }) => {
  return (
    <div className="loading-container">
      <Loader2 className="spinner-icon" size={36} />
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
