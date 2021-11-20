import React from 'react';
import PropTypes from 'prop-types';
import './CompanyLogo.scss';

const CompanyLogo = ({ className }) => {
  return (
    <div className={`company-logo-wrapper ${className}`}>
      <div>
        <div className="logo-icon">
          <div>
            <span>
              <i className="fas fa-tshirt" />
            </span>
          </div>
        </div>
        <div className="company-name">
          <div className="company-text">케빈네 잡화점</div>
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
