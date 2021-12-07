import React from 'react';
import PropTypes from 'prop-types';
import './BlockRow.scss';

const BlockRow = ({ className, children, expand }) => {
  return <div className={`block-row-wrapper ${className} ${expand ? 'expand' : ''}`}>{children}</div>;
};

export default BlockRow;

BlockRow.defaultProps = {
  className: '',
  expand: false,
};

BlockRow.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  expand: PropTypes.bool,
};
