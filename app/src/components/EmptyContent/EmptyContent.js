import React from 'react';
import PropTypes from 'prop-types';
import './EmptyContent.scss';

const EmptyContent = ({ className, icon, message, height, additionalContent }) => {
  return (
    <div
      className={`empty-content-wrapper ${className}`}
      style={{
        height,
      }}
    >
      <div>
        <div className="icon">{icon}</div>
        <div className="message">{message}</div>
        {additionalContent && <div>{additionalContent}</div>}
      </div>
    </div>
  );
};

export default EmptyContent;

EmptyContent.defaultProps = {
  className: '',
  icon: <i className="fas fa-inbox" />,
  height: '100%',
};

EmptyContent.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.node,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.string,
  additionalContent: PropTypes.node,
};
