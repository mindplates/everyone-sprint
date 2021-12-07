import React from 'react';
import PropTypes from 'prop-types';
import './PageContent.scss';

const PageContent = ({ className, children }) => {
  return <div className={`page-content-wrapper ${className}`}>{children}</div>;
};

export default PageContent;

PageContent.defaultProps = {
  className: '',
};

PageContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
