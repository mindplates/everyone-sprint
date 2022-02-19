import React from 'react';
import PropTypes from 'prop-types';
import './Spinner.scss';

const Spinner = ({ className, color }) => {
  return (
    <div className={`spinner-wrapper ${className} spinner-color-${color}`}>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};

export default Spinner;

Spinner.defaultProps = {
  className: '',
  color: 'white',
};

Spinner.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
};
