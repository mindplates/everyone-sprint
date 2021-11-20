import React from 'react';
import PropTypes from 'prop-types';
import './ExitButton.scss';

const ExitButton = ({ className, onClick, size, color }) => {
  return (
    <div
      className={`${className} size-${size} color-${color} exit-button-wrapper`}
      style={{
        width: size,
        height: size,
      }}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <div className="x-1" />
      <div className="x-2" />
    </div>
  );
};

export default ExitButton;

ExitButton.defaultProps = {
  className: '',
};

ExitButton.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.string,
};
