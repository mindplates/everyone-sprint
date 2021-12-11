import React from 'react';
import PropTypes from 'prop-types';
import './Label.scss';

const Label = ({ className, children, minWidth, required, separator, size }) => {
  return (
    <div
      className={`label-wrapper size-${size} ${className}`}
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
      {separator && (
        <span className="liner">
          <span />
        </span>
      )}
    </div>
  );
};

export default Label;

Label.defaultProps = {
  className: '',
  minWidth: '100px',
  required: false,
  separator: true,
  size: 'md',
};

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  minWidth: PropTypes.string,
  required: PropTypes.bool,
  separator: PropTypes.bool,
  size: PropTypes.string,
};
