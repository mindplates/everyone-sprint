import React from 'react';
import PropTypes from 'prop-types';
import './Label.scss';

const Label = ({ className, children, minWidth, required, separator, size, verticalAlign }) => {
  return (
    <div
      className={`label-wrapper size-${size} ${className}`}
      style={{
        minWidth,
        alignSelf: verticalAlign,
      }}
    >
      <span
        style={{
          alignSelf: verticalAlign,
        }}
      >
        {children}
        {required && (
          <span className="required">
            <i className="fas fa-star" />
          </span>
        )}
      </span>
      {separator && (
        <span
          className="liner"
          style={{
            alignSelf: verticalAlign,
          }}
        >
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
  verticalAlign: 'center',
};

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  minWidth: PropTypes.string,
  required: PropTypes.bool,
  separator: PropTypes.bool,
  size: PropTypes.string,
  verticalAlign: PropTypes.string,
};
