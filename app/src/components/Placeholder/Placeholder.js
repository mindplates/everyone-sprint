import React from 'react';
import PropTypes from 'prop-types';
import images from '@/images';
import './Placeholder.scss';

const Placeholder = ({ className, height }) => {
  return (
    <div
      className={`placeholder-wrapper ${className}`}
      style={{
        height,
      }}
    >
      <div className="content">
        <img src={images.spinner} alt="loader" />
      </div>
      <div className="mover" />
    </div>
  );
};

export default Placeholder;

Placeholder.defaultProps = {
  className: '',
  height: '100px',
};

Placeholder.propTypes = {
  className: PropTypes.string,
  height: PropTypes.string,
};
