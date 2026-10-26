import React from 'react';
import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Available',
  message = 'There are no records to display right now.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="empty-state-box">
      <div className="empty-icon-wrapper">
        <Icon size={44} className="empty-icon" />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary mt-3">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button onClick={onAction} className="btn-primary mt-3">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
