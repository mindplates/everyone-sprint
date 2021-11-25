import React from 'react';
import PropTypes from 'prop-types';
import './SubTitle.scss';

const SubTitle = ({ className, children }) => {
  return (
    <div className={`sub-title-wrapper ${className}`}>
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

export default SubTitle;

SubTitle.defaultProps = {
  className: '',
};

SubTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
