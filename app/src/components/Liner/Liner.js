import React from 'react';
import PropTypes from 'prop-types';
import './Liner.scss';

const Liner = ({ className, width, height, color, margin, display}) => {
  return (
    <div
      className={`liner-wrapper ${className} color-${color}`}
      style={{
        margin,
        display,
      }}
    >
      <div
        style={{
          width,
          height,
        }}
      />
    </div>
  );
};

export default Liner;

Liner.defaultProps = {
  className: '',
  width: '1px',
  height: '16px',
  color: 'white',
  margin: '',
  display: 'block',
};

Liner.propTypes = {
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  color: PropTypes.string,
  margin: PropTypes.string,
  display: PropTypes.string,
};
