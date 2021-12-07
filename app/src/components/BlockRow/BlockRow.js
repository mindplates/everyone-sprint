import React from 'react';
import PropTypes from 'prop-types';
import './BlockRow.scss';

const BlockRow = ({ className, children }) => {
  return <div className={`block-row-wrapper ${className}`}>{children}</div>;
};

export default BlockRow;

BlockRow.defaultProps = {
  className: '',
};

BlockRow.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
