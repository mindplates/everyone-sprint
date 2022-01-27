import React from 'react';
import PropTypes from 'prop-types';
import './ProductLogo.scss';

const ProductLogo = ({ className, hover, collapsed, backgroundColor, name, width }) => {
  return (
    <div
      className={`product-logo-wrapper ${className} ${collapsed ? 'collapsed' : ''} ${hover ? 'hover' : ''}`}
      style={{
        backgroundColor,
        width,
        minWidth: width,
      }}
    >
      <div className="side-rect side-left">
        <div className="side" />
      </div>
      <div className="side-rect side-right">
        <div className="side" />
      </div>
      <div className="product-logo-content">
        <div className="logo-icon">
          <div className="hexagon">
            <span className="logo-char d-none">S</span>
            <span>
              <i className="fab fa-stripe-s" />
            </span>
          </div>
        </div>
        {name && (
          <div className="product-name">
            <div className="product-text product-text-1">
              <span>
                <i className="fas fa-star" /> 모두의
              </span>
            </div>
            <div className="product-text product-text-2">
              <span>스프린트</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductLogo;

ProductLogo.defaultProps = {
  className: '',
  hover: false,
  backgroundColor: '',
  name: true,
  width: '200px',
};

ProductLogo.propTypes = {
  className: PropTypes.string,
  hover: PropTypes.bool,
  collapsed: PropTypes.bool,
  backgroundColor: PropTypes.string,
  name: PropTypes.bool,
  width: PropTypes.string,
};
