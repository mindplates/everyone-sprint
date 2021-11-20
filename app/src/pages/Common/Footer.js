import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { HistoryPropTypes } from '@/proptypes';
import { setSetting } from '@/store/actions';
import { CompanyLogo, ExitButton, Liner } from '@/components';
import './Footer.scss';

const Footer = ({ className, productName, systemInfo, setSetting }) => {
  useEffect(() => {}, []);

  return (
    <div className={`footer-wrapper ${className}`}>
      <div>
        <div className="company-logo-content">
          <CompanyLogo />
        </div>
        <div className="product-info">
          <div>
            <div className="product-name">{productName}</div>
            <div className="product-version">
              <div>
                {process.env.REACT_APP_NAME}-{process.env.REACT_APP_VERSION}
              </div>
              <div>
                {systemInfo.name}-{systemInfo.version}
              </div>
            </div>
          </div>
        </div>
        <div className="liner">
          <Liner height="20px" />
        </div>
        <div className="others">
          <div>
            <ExitButton
              size="xs"
              color="white"
              onClick={() => {
                setSetting('footer', false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSetting: (key, value) => dispatch(setSetting(key, value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);

Footer.defaultProps = {
  className: '',
  productName: '',
};

Footer.propTypes = {
  className: PropTypes.string,
  productName: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      promotionId: PropTypes.string,
      couponId: PropTypes.string,
    }),
  }),
  history: HistoryPropTypes,
  systemInfo: PropTypes.shape({
    name: PropTypes.string,
    version: PropTypes.string,
  }),
};
