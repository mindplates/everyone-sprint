import React from 'react';
import PropTypes from 'prop-types';
import './Component.scss';

const Component = ({ className }) => {
  return <div className={`component-wrapper ${className}`}>컨텐츠</div>;
};

export default Component;

Component.defaultProps = {
  className: '',
};

Component.propTypes = {
  className: PropTypes.string,
};
