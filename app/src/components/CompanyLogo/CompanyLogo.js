import React from 'react';
import PropTypes from 'prop-types';
import './CompanyLogo.scss';
import images from '@/images';

const CompanyLogo = ({ className }) => {
  return (
    <div className={`company-logo-wrapper ${className}`}>
      <div>
        <div className="logo-icon">
          <div>
            <span>
              <img src={images.mindplates} alt="mindplates" />
            </span>
          </div>
        </div>
        <div className="company-name">
          <div className="company-text">MINDPLATES</div>
          <div className="created-by">CREATED BY</div>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogo;

CompanyLogo.defaultProps = {
  className: '',
};

CompanyLogo.propTypes = {
  className: PropTypes.string,
};
