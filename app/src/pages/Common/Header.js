import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { HistoryPropTypes } from '@/proptypes';
import MENU from '@/constants/menu';
import './Header.scss';
import { Button, ProductLogo } from '@/components';

const Header = (props) => {
  const { systemInfo, history } = props;

  useEffect(() => {}, []);

  return (
    <div className="header-wrapper">
      <div>
        <div className="product-logo">
          <Link to="/">
            <ProductLogo />
          </Link>
        </div>
        <div className="top-menu">
          <ul>
            {Object.keys(MENU).map((topMenuKey, inx) => {
              const menu = MENU[topMenuKey];
              return (
                <li key={topMenuKey} className={`${inx === 0 ? 'selected' : ''}`}>
                  <Link to={`/${topMenuKey}`}>
                    <span>{menu.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="top-button">
          <Button color="white" size="lg" outline onClick={() => {}}>
            <i className="fas fa-cog" />
          </Button>
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

export default connect(mapStateToProps, undefined)(Header);

Header.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      promotionId: PropTypes.string,
      couponId: PropTypes.string,
    }),
  }),
  history: HistoryPropTypes,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
};
