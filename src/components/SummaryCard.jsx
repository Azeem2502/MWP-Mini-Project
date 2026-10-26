import React from 'react';

const SummaryCard = ({ title, amount, subtitle, icon: Icon, variant = 'blue' }) => {
  return (
    <div className={`summary-card card-${variant}`}>
      <div className="card-top">
        <span className="card-title">{title}</span>
        {Icon && (
          <div className="card-icon-bubble">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="card-amount">{amount}</div>
      {subtitle && <div className="card-subtitle">{subtitle}</div>}
    </div>
  );
};

export default SummaryCard;
