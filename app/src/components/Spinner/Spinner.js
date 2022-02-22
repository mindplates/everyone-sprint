import React from 'react';
import PropTypes from 'prop-types';
import './Spinner.scss';

const Spinner = ({ className, color, type, size }) => {
  return (
    <div
      className={`spinner-wrapper ${className} spinner-color-${color} type-${type}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {type === 'circle' && (
        <>
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </>
      )}
      {type === 'bar' && (
        <>
          <div />
          <div />
          <div />
        </>
      )}
      {type === 'grid' && (
        <>
          <div/>
          <div/>
          <div/>
          <div/>
          <div/>
          <div/>
          <div/>
          <div/>
          <div/>
        </>
      )}
    </div>
  );
};

export default Spinner;

Spinner.defaultProps = {
  className: '',
  color: 'white',
  type: 'circle',
  size: '80px',
};

Spinner.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  type: PropTypes.string,
  size: PropTypes.string,
};
