import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Page.scss';
import { Breadcrumbs } from '@/components';

const Page = ({ className, children, breadcrumbs }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`page-wrapper ${className}`}>
      {breadcrumbs && (
        <div className="page-breadcrumbs">
          <Breadcrumbs className="flex-grow-1" list={breadcrumbs} />
        </div>
      )}
      {children}
    </div>
  );
};

export default Page;

Page.defaultProps = {
  className: '',
};

Page.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      link: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
};
