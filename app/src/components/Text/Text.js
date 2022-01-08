import React from 'react';
import PropTypes from 'prop-types';
import './Text.scss';

const Text = ({ className, children, size, bold, verticalAlign }) => {
  return (
    <div
      className={`text-wrapper ${className} size-${size} ${bold ? 'is-bold' : ''}`}
      style={{
        alignSelf: verticalAlign,
      }}
    >
      <div
        className="text"
        style={{
          alignSelf: verticalAlign,
        }}
      >
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
  verticalAlign: 'center',
};

Text.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.string,
  bold: PropTypes.bool,
  verticalAlign: PropTypes.string,
};
