import React from 'react';
import PropTypes from 'prop-types';
import './PageTitle.scss';

const PageTitle = ({ className, children }) => {
  return (
    <div className={`page-title-wrapper ${className}`}>
      <div className="bullet">
        <span />
      </div>
      <div className="text">
        <span>{children}</span>
      </div>
    </div>
  );
};

export default PageTitle;

PageTitle.defaultProps = {
  className: '',
};

PageTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
