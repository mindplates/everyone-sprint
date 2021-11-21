import React from 'react';
import PropTypes from 'prop-types';
import './ProductLogo.scss';

const ProductLogo = ({ className, hover, collapsed }) => {
  return (
    <div className={`product-logo-wrapper ${className} ${collapsed ? 'collapsed' : ''} ${hover ? 'hover' : ''}`}>
      <div>
        <div className="logo-icon">
          <div className="hexagon">
            <span className="logo-char d-none">S</span>
            <span>
              <i className="fab fa-stripe-s" />
            </span>
          </div>
        </div>
        <div className="product-name">
          <div className="product-text product-text-1">
            <span>모두의</span>
          </div>
          <div className="product-text product-text-2">
            <span>스프린트</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductLogo;

ProductLogo.defaultProps = {
  className: '',
  hover: false,
};

ProductLogo.propTypes = {
  className: PropTypes.string,
  hover: PropTypes.bool,
  collapsed: PropTypes.bool,
};
