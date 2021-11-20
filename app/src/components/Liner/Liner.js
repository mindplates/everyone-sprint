import React from 'react';
import PropTypes from 'prop-types';
import './Liner.scss';

const Liner = ({ className, width, height }) => {
  return (
    <div className={`liner-wrapper ${className}`}>
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
};

Liner.propTypes = {
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
};
