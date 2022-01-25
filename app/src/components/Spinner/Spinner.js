import React from 'react';
import PropTypes from 'prop-types';
import './Spinner.scss';

const Spinner = ({ className }) => {
  return (
    <div className={`spinner-wrapper ${className}`}>
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
};

Spinner.propTypes = {
  className: PropTypes.string,
};
