import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { SettingPropTypes, UserPropTypes } from '@/proptypes';
import MENU from '@/constants/menu';
import { Button, Liner, Overlay, ProductLogo, UserImage } from '@/components';
import { setSetting, setUserInfo } from '@/store/actions';
import './Header.scss';
import request from '@/utils/request';

const Header = (props) => {
  const { setSetting: setSettingReducer, setting, location, t, user } = props;

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {}, []);

  const values = (location.pathname.split('/') || []).filter((value) => value);
  const [currentTopMenu] = values;

  const logout = () => {
    const { setUserInfo: setUserInfoReducer } = props;

    request.del('/api/users/logout', null, () => {
      setUserInfoReducer({});
    });
  };

  return (
    <div className={`header-wrapper ${setting.collapsed ? 'collapsed' : ''}`}>
      <div>
        <div className="top-menu">
          <Button
            className="menu-toggle-button"
            color="white"
            size="lg"
            outline
            onClick={() => {
              setMenuOpen(!menuOpen);
            }}
          >
            <i className="fas fa-bars" />
          </Button>
          {menuOpen && (
            <Overlay
              className="mobile-overlay"
              zIndex={10}
              onClick={() => {
                setMenuOpen(false);
              }}
            />
          )}
          <ul className={menuOpen ? 'opened' : ''}>
            <li className="menu-toggle-list-button">
              <Button
                className="menu-toggle-button"
                color="white"
                size="lg"
                outline
                onClick={() => {
                  setMenuOpen(!menuOpen);
                }}
              >
                <i className="fas fa-bars" />
              </Button>
            </li>
            {Object.keys(MENU).map((topMenuKey) => {
              const menu = MENU[topMenuKey];
              return (
                <li
                  key={topMenuKey}
                  className={`${(currentTopMenu || 'public-park') === topMenuKey ? 'selected' : 'no-selected'}`}
                >
                  <Link
                    to={`/${topMenuKey}`}
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                  >
                    <div>
                      <div className={`icon ${topMenuKey}`}>
                        <div>
                          <span>{menu.icon}</span>
                        </div>
                      </div>
                      <div className="text">{t(menu.name)}</div>
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
          <div className={menuOpen ? 'opened' : ''}>
            {user && user.id && (
              <div className="user-icon">
                <Button
                  color="white"
                  size="lg"
                  outline
                  onClick={() => {
                    logout();
                  }}
                >
                  <UserImage size="30px" imageType={user.imageType} imageData={user.imageData} rounded />
                </Button>
              </div>
            )}
            {!(user && user.id) && (
              <div className="login">
                <div>
                  <Link to="/starting-line">
                    <span>{t('로그인')}</span>
                  </Link>
                </div>
              </div>
            )}
            <div className="liner">
              <Liner height="10px" />
            </div>
            <div>
              <Button
                className="collapsed-button"
                color="white"
                size="lg"
                outline
                onClick={() => {
                  setSettingReducer('collapsed', !setting.collapsed);
                }}
              >
                {!setting.collapsed && <i className="fas fa-angle-up" />}
                {setting.collapsed && <i className="fas fa-angle-down" />}
              </Button>
            </div>
            <div>
              <Button color="white" size="lg" outline onClick={() => {}}>
                <i className="fas fa-cog" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
    setting: state.setting,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSetting: (key, value) => dispatch(setSetting(key, value)),
    setUserInfo: (user) => dispatch(setUserInfo(user)),
  };
};

export default withRouter(withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Header)));

Header.propTypes = {
  t: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      promotionId: PropTypes.string,
      couponId: PropTypes.string,
    }),
  }),
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
  setting: SettingPropTypes,
  setSetting: PropTypes.func,
  user: UserPropTypes,
  setUserInfo: PropTypes.func,
};
