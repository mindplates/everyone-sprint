import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HistoryPropTypes, SettingPropTypes, UserPropTypes } from '@/proptypes';
import storage from '@/utils/storage';
import MENU from '@/constants/menu';
import { BlockTitle, Button, Liner, Overlay, ProductLogo, UserImage } from '@/components';
import { setSetting, setUserInfo } from '@/store/actions';
import './Header.scss';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { COUNTRIES, LANGUAGES, USER_STUB } from '@/constants/constants';

const Header = (props) => {
  const {
    setSetting: setSettingReducer,
    setUserInfo: setUserInfoReducer,
    setting,
    location,
    t,
    user,
    i18n,
    history,
  } = props;

  const [menuOpen, setMenuOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {}, []);

  const values = (location.pathname.split('/') || []).filter((value) => value);
  const [currentTopMenu] = values;

  const logout = () => {
    storage.setItem('auth', 'token', null);
    request.del('/api/users/logout', null, () => {
      setUserInfoReducer({
        ...USER_STUB,
        language: user.language,
      });
      history.push('/');
    });
  };

  const updateLanguage = (language) => {
    i18n.changeLanguage(language || 'ko');
    request.put(
      '/api/users/my-info/language',
      { language },
      () => {
        setUserInfoReducer({
          ...user,
          language,
        });
      },
      null,
      t('언어 설정을 변경하고 있습니다.'),
    );
  };

  const updateCountry = (country) => {
    request.put(
      '/api/users/my-info/country',
      { country },
      () => {
        setUserInfoReducer({
          ...user,
          country,
        });
      },
      null,
      t('지역 설정을 변경하고 있습니다.'),
    );
  };

  return (
    <div className={`header-wrapper ${setting.collapsed ? 'collapsed' : ''}`}>
      <div className="header-content">
        <div className="top-menu">
          <Button
            className="menu-toggle-button"
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
          <div>
            <div className={`user-icon ${user.id ? 'logged-in' : ''}`}>
              <Button
                size="lg"
                outline
                onClick={() => {
                  setConfigOpen(!configOpen);
                }}
              >
                {user && user.id && (
                  <UserImage size="36px" imageType={user.imageType} imageData={user.imageData} rounded />
                )}
                {!(user && user.id) && <i className="fas fa-cog" />}
              </Button>
            </div>

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
          </div>
        </div>
      </div>
      {configOpen && (
        <div className={`config-popup ${user.id ? 'logged-in' : ''}`}>
          <div
            className="config-popup-overlay"
            onClick={() => {
              setConfigOpen(false);
            }}
          />
          <div className="config-popup-layout">
            <div>
              <div className="arrow">
                <div />
              </div>
              <div className="config-popup-content">
                {user && user.id && (
                  <>
                    <div className="user-info">
                      <div>
                        <UserImage size="50px" imageType={user.imageType} imageData={user.imageData} rounded border />
                      </div>
                      <div>
                        <div className="name">
                          <span>{user.alias}</span>
                          {user.name && <span>[{user.name}]</span>}
                        </div>
                        <div className="email">{user.email}</div>
                        <div className="link">
                          <Button
                            size="xs"
                            outline
                            color="white"
                            onClick={() => {
                              history.push('/my-info');
                              setConfigOpen(false);
                            }}
                          >
                            내 정보
                          </Button>
                          <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                          <Button
                            className="log-button"
                            size="xs"
                            outline
                            color="danger"
                            onClick={() => {
                              logout();
                              setConfigOpen(false);
                            }}
                          >
                            로그아웃
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Liner width="100%" height="1px" color="light" margin="0.75rem 0" />
                  </>
                )}
                <BlockTitle className="sub-title" size="xs" bold={false}>
                  QUICK MENU
                </BlockTitle>
                <div className="d-flex quick-menu">
                  <div className="quick-menu-label small align-self-center">
                    <span>언어</span>
                  </div>
                  <div className="quick-menu-icon language-icon align-self-center">
                    <span className="icon">
                      <i className="fas fa-language" />
                    </span>
                  </div>
                  <div className="mx-2">
                    <RadioButton
                      className="radio-button"
                      size="xs"
                      items={Object.keys(LANGUAGES).map((key) => {
                        return {
                          key,
                          value: LANGUAGES[key],
                        };
                      })}
                      value={user.language}
                      onClick={(val) => {
                        updateLanguage(val);
                      }}
                    />
                  </div>
                </div>
                <div className="d-flex quick-menu">
                  <div className="quick-menu-label small align-self-center">
                    <span>지역</span>
                  </div>
                  <div className="quick-menu-icon align-self-center">
                    <span className="icon">
                      <i className="fas fa-globe-americas" />
                    </span>
                  </div>
                  <div className="mx-2">
                    <RadioButton
                      className="radio-button"
                      size="xs"
                      items={Object.keys(COUNTRIES).map((key) => {
                        return {
                          key,
                          value: COUNTRIES[key],
                        };
                      })}
                      value={user.country}
                      onClick={(val) => {
                        updateCountry(val);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
  i18n: PropTypes.objectOf(PropTypes.any),
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
  history: HistoryPropTypes,
};
