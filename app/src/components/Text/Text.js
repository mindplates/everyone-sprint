import React from 'react';
import PropTypes from 'prop-types';
import './Text.scss';

const Text = ({ className, children, size, bold }) => {
  return (
    <div className={`text-wrapper ${className} size-${size} ${bold ? 'is-bold' : ''}`}>
      <div className="text">
        <span>{children}</span>
      </div>
    </div>
  );
};

export default Text;

Text.defaultProps = {
  className: '',
  size: 'md',
  bold: false,
};

Text.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.string,
  bold: PropTypes.bool,
};
