import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Page.scss';
import { Breadcrumbs } from '@/components';

const Page = ({ className, children, listLayout, breadcrumbs, title }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`page-wrapper ${className} ${title ? 'has-title' : ''} ${listLayout ? 'list-layout' : ''}`}>
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
  listLayout: false,
  title: true,
};

Page.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  listLayout: PropTypes.bool,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      link: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
  title: PropTypes.bool,
};
