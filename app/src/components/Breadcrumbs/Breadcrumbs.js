import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './Breadcrumbs.scss';
import { Liner } from '@/components';

const Breadcrumbs = ({ className, list }) => {
  return (
    <div className={`breadcrumbs-wrapper ${className}`}>
      <ul>
        <li>
          <i className="fas fa-map-marker" />
        </li>
        {list.map((breadcrumb, inx) => {
          return (
            <li key={inx}>
              <Link className={breadcrumb.current ? 'current' : ''} to={breadcrumb.link}>
                {breadcrumb.name}
              </Link>
              {inx < list.length - 1 && <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0 0 0.5rem" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Breadcrumbs;

Breadcrumbs.defaultProps = {
  className: '',
};

Breadcrumbs.propTypes = {
  className: PropTypes.string,

  list: PropTypes.arrayOf(
    PropTypes.shape({
      link: PropTypes.string,
      name: PropTypes.string,
      current: PropTypes.bool,
    }),
  ),
};
