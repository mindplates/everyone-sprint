import React from 'react';
import PropTypes from 'prop-types';
import './PageContent.scss';

const PageContent = ({ className, children, border, padding, listLayout, info }) => {
  return (
    <div
      className={`page-content-wrapper ${className} ${border ? 'has-border' : ''} ${listLayout ? 'list-layout' : ''} ${info ? 'info-layout' : ''}`}
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
  padding: '',
  info : false,
};

PageContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  border: PropTypes.bool,
  padding: PropTypes.string,
  listLayout: PropTypes.bool,
  info : PropTypes.bool
};
