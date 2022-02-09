import React from 'react';
import PropTypes from 'prop-types';
import './PageContent.scss';

const PageContent = ({ className, children, border, padding }) => {
  return (
    <div
      className={`page-content-wrapper ${className} ${border ? 'has-border' : ''}`}
      style={{
        padding,
      }}
    >
      {children}
    </div>
  );
};

export default PageContent;

PageContent.defaultProps = {
  className: '',
  border: true,
  padding: '1rem',
};

PageContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  border: PropTypes.bool,
  padding: PropTypes.string,
};
