import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Page.scss';

const Page = ({ className, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
