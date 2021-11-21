import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HistoryPropTypes } from '@/proptypes';
import MENU from '@/constants/menu';
import { Button, ProductLogo } from '@/components';
import { setSetting } from '@/store/actions';
import './Header.scss';

const Header = (props) => {
  const { setSetting, setting, location } = props;

  useEffect(() => {}, []);

  const values = (location.pathname.split('/') || []).filter((value) => value);
  const [currentTopMenu] = values;

  return (
    <div className={`header-wrapper ${setting.collapsed ? 'collapsed' : ''}`}>
      <div>
        <div className="top-menu">
          <ul>
            {Object.keys(MENU).map((topMenuKey) => {
              const menu = MENU[topMenuKey];
              return (
                <li key={topMenuKey} className={`${currentTopMenu === topMenuKey ? 'selected' : 'no-selected'}`}>
                  <Link to={`/${topMenuKey}`}>
                    <div>
                      <div className={`icon ${topMenuKey}`}>
                        <div>
                          <span>{menu.icon}</span>
                        </div>
                      </div>
                      <div className="text">{menu.name}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="product-logo">
          <Link to="/">
            <ProductLogo hover collapsed={setting.collapsed} />
          </Link>
        </div>
        <div className="top-button">
          <Button
            color="white"
            size="lg"
            outline
            onClick={() => {
              setSetting('collapsed', !setting.collapsed);
            }}
          >
            {!setting.collapsed && <i className="fas fa-angle-up" />}
            {setting.collapsed && <i className="fas fa-angle-down" />}
          </Button>
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
    setting: state.setting,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSetting: (key, value) => dispatch(setSetting(key, value)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));

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
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};
