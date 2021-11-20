import React from 'react';
import PropTypes from 'prop-types';
import './ProductLogo.scss';

const ProductLogo = ({ className }) => {
  return (
    <div className={`product-logo-wrapper ${className}`}>
      <div>
        <div className="logo-icon">
          <div>
            <span>
              <i className="fas fa-bolt" />
            </span>
          </div>
        </div>
        <div className="product-name">
          <div className="product-text">모두의 스프린트</div>
        </div>
      </div>
    </div>
  );
};

export default ProductLogo;

ProductLogo.defaultProps = {
  className: '',
};

ProductLogo.propTypes = {
  className: PropTypes.string,
};
