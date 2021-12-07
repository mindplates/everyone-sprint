import React from 'react';
import PropTypes from 'prop-types';
import './Page.scss';

const Page = ({ className, children }) => {
  return <div className={`page-wrapper ${className}`}>{children}</div>;
};

export default Page;

Page.defaultProps = {
  className: '',
};

Page.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
