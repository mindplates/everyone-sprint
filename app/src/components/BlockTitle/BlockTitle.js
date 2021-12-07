import React from 'react';
import PropTypes from 'prop-types';
import './BlockTitle.scss';

const BlockTitle = ({ className, children, size, bold }) => {
  return (
    <div className={`block-title-wrapper ${className} size-${size} ${bold ? 'is-bold' : ''}`}>
      <div className="bullet bullet-1">
        <span />
      </div>
      <div className="bullet bullet-2">
        <span />
      </div>
      <div className="bullet bullet-3">
        <span />
      </div>
      <div className="text">
        <span>{children}</span>
      </div>
    </div>
  );
};

export default BlockTitle;

BlockTitle.defaultProps = {
  className: '',
  size: 'md',
  bold: true,
};

BlockTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.string,
  bold: PropTypes.bool,
};
