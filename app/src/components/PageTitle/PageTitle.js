import React from 'react';
import PropTypes from 'prop-types';
import './PageTitle.scss';
import { Liner } from '@/components';

const PageTitle = ({ className, children, control }) => {
  return (
    <div className={`page-title-wrapper ${className}`}>
      <div className="bullet">
        <span />
      </div>
      <div className="text">
        <span>{children}</span>
      </div>
      {control && (
        <div className="control">
          <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
          {control}
        </div>
      )}
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
  control: PropTypes.node,
};
