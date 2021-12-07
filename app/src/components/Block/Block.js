import React from 'react';
import PropTypes from 'prop-types';
import './Block.scss';

const Block = ({ className, children, border }) => {
  return (
    <div className={`block-wrapper ${className}`}>
      {children}
      {border && <div className="bottom-liner" />}
    </div>
  );
};

export default Block;

Block.defaultProps = {
  className: '',
  border: false,
};

Block.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  border: PropTypes.bool,
};
