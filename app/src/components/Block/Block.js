import React from 'react';
import PropTypes from 'prop-types';
import './Block.scss';

const Block = ({ className, children }) => {
  return <div className={`block-wrapper ${className}`}>{children}</div>;
};

export default Block;

Block.defaultProps = {
  className: '',
};

Block.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
