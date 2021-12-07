import React from 'react';
import PropTypes from 'prop-types';
import './Label.scss';

const Label = ({ className, children, minWidth, required }) => {
  return (
    <div
      className={`label-wrapper ${className}`}
      style={{
        minWidth,
      }}
    >
      <span>
        {children}
        {required && (
          <span className="required">
            <i className="fas fa-star" />
          </span>
        )}
      </span>
    </div>
  );
};

export default Label;

Label.defaultProps = {
  className: '',
  minWidth: '100px',
  required: false,
};

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  minWidth: PropTypes.string,
  required: PropTypes.bool,
};
