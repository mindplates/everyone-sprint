import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import TimeAgo from 'javascript-time-ago/modules/TimeAgo';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HistoryPropTypes, SettingPropTypes, SpacePropTypes, UserPropTypes } from '@/proptypes';
import storage from '@/utils/storage';
import MENU from '@/constants/menu';
import { BlockTitle, Button, Liner, Overlay, ProductLogo, UserImage } from '@/components';
import { setSetting, setSpaceInfo, setUserInfo } from '@/store/actions';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { COUNTRIES, LANGUAGES, USER_STUB } from '@/constants/constants';
import './Header.scss';
import commonUtil from '@/utils/commonUtil';

const Header = (props) => {
  const {
    setSetting: setSettingReducer,
    setUserInfo: setUserInfoReducer,
    setSpaceInfo: setSpaceInfoReducer,
    setting,
    location,
    t,
    user,
    i18n,
    history,
    space,
  } = props;

  const [menuOpen, setMenuOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [spaceOpen, setSpaceOpen] = useState(false);

  useEffect(() => {}, []);

  const values = (location.pathname.split('/') || []).filter((value) => value);
  const [firstPath, secondPath] = values;
  const menuPath = secondPath || firstPath;

  let menuAlias = menuPath;
  if (menuPath === 'meets') {
    menuAlias = 'meetings';
  }

  const logout = () => {
    storage.setItem('auth', 'token', null);
    request.del(
      '/api/users/logout',
      null,
      () => {
        setUserInfoReducer({
          ...USER_STUB,
          language: user.language,
        });
        setSpaceInfoReducer({});
        history.push('/');
      },
      null,
      t('로그인 정보를 깨끗하게 정리하고 있습니다.'),
    );
  };

  const updateLanguage = (language) => {
    i18n.changeLanguage(language);
    if (user.id) {
      request.put(
        '/api/users/my-info/language',
        { language },
        () => {
          TimeAgo.setDefaultLocale(language);
          setUserInfoReducer({
            ...user,
            language,
          });
        },
        null,
        t('언어 설정을 변경하고 있습니다.'),
      );
    } else {
      setUserInfoReducer({
        ...user,
        language,
      });
    }
  };

  const updateCountry = (country) => {
    if (user.id) {
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
    } else {
      setUserInfoReducer({
        ...user,
        country,
      });
    }
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
          <ul className={`menu-list ${menuOpen ? 'opened' : ''}`}>
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
            {Object.keys(MENU)
              .filter((menu) => MENU[menu].enabled)
              .filter((menu) => menuOpen || MENU[menu].side === 'left')
              .map((topMenuKey) => {
                const menu = MENU[topMenuKey];
                return (
                  <li key={topMenuKey} className={`${menuAlias === topMenuKey ? 'selected' : 'no-selected'}`}>
                    <Link
                      to={space.code ? `/${space.code}/${topMenuKey}` : `/${topMenuKey}`}
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
        <div className={`product-logo ${user.id ? 'logged-in' : ''}`}>
          <Link to="/">
            <ProductLogo className="d-inline-flex d-sm-none" hover collapsed={setting.collapsed} name={false} width="auto" />
            <ProductLogo className="d-none d-sm-inline-flex" hover collapsed={setting.collapsed} name />
          </Link>
        </div>
        <div className="top-button">
          <div>
            {user.id && (
              <div className="space-selector">
                {user?.spaces?.length > 0 && <div className="label">{t('스페이스')}</div>}
                <div
                  className={`current-space-info ${spaceOpen ? 'opened' : ''} ${user?.spaces?.length > 0 ? 'clickable' : ''}`}
                  onClick={() => {
                    if (user?.spaces?.length > 0) {
                      setSpaceOpen(!spaceOpen);
                    }
                  }}
                >
                  {user?.spaces?.length > 0 && <div className="text">{space?.name || t('SELECT SPACE')}</div>}
                  {user?.spaces?.length < 1 && <div className="text">{t('NO SPACE')}</div>}
                  {user?.spaces?.length > 0 && (
                    <div className="icon">
                      <i className="fas fa-chevron-down" />
                    </div>
                  )}
                </div>
                {user?.spaces?.length > 0 && (
                  <div
                    className="space-config"
                    onClick={() => {
                      // history.push('/spaces/my');
                      history.push(`/spaces/${commonUtil.getCurrentSpaceCode()}`);
                    }}
                  >
                    <div>
                      <i className="fas fa-cog" />
                    </div>
                  </div>
                )}
                {user?.spaces?.length < 1 && (
                  <>
                    <div
                      className="space-config"
                      onClick={() => {
                        history.push('/spaces/new');
                      }}
                    >
                      <div>
                        <i className="fas fa-plus" />
                      </div>
                    </div>
                    <div
                      className="space-config"
                      onClick={() => {
                        history.push('/spaces');
                      }}
                    >
                      <div>
                        <i className="fas fa-search" />
                      </div>
                    </div>
                  </>
                )}
                <Liner height="10px" color="white" />
              </div>
            )}
            <div className={`${user.id ? 'd-none' : 'flex-grow-1'} right-menu`}>
              <ul className="menu-list">
                {Object.keys(MENU)
                  .filter((menu) => MENU[menu].enabled)
                  .filter((menu) => MENU[menu].side === 'right')
                  .map((topMenuKey) => {
                    const menu = MENU[topMenuKey];
                    return (
                      <li key={topMenuKey} className={`${menuAlias === topMenuKey ? 'selected' : 'no-selected'}`}>
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
            <div className={`user-icon ${user.id ? 'logged-in' : ''}`}>
              <Button
                className="config-or-user-button"
                size="lg"
                outline
                onClick={() => {
                  setConfigOpen(!configOpen);
                }}
              >
                {user && user.id && <UserImage size="36px" iconFontSize="20px" imageType={user.imageType} imageData={user.imageData} rounded />}
                {!(user && user.id) && <i className="fas fa-cog" />}
              </Button>
            </div>
            {!(user && user.id) && (
              <div className="login">
                <div className={menuPath === 'starting-line' ? 'selected' : ''}>
                  <Link to="/login">
                    <span>{t('로그인')}</span>
                  </Link>
                </div>
              </div>
            )}
            <div className="d-none liner">
              <Liner height="10px" color="black" />
            </div>
            <div>
              <Button
                className="d-none collapsed-button"
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
      {spaceOpen && (
        <div className={`space-popup ${user.id ? 'logged-in' : ''}`}>
          <div
            className="popup-overlay"
            onClick={() => {
              setSpaceOpen(false);
            }}
          />
          <div className="popup-layout">
            <div>
              <div className="arrow">
                <div />
              </div>
              <div className="popup-content">
                <div className="label">내 스페이스</div>
                <ul>
                  {user?.spaces?.map((d) => {
                    return (
                      <li
                        key={d.id}
                        className={space?.code === d.code ? 'selected' : ''}
                        onClick={() => {
                          storage.setItem('setting', 'space', d.code);
                          setSpaceInfoReducer(d);
                          history.push(`/${d.code}`);
                          setSpaceOpen(false);
                        }}
                      >
                        {d.name}
                      </li>
                    );
                  })}
                  <div className="other-button">
                    <div>
                      <Button
                        type="submit"
                        size="xs"
                        color="white"
                        outline
                        onClick={() => {
                          history.push('/spaces/new');
                          setSpaceOpen(false);
                        }}
                      >
                        <i className="fas fa-plus" /> {t('새 스페이스')}
                      </Button>
                    </div>
                    <div>
                      <Button
                        type="submit"
                        size="xs"
                        color="white"
                        outline
                        onClick={() => {
                          history.push('/spaces/my');
                          setSpaceOpen(false);
                        }}
                      >
                        <i className="fas fa-house-user" /> {t('내 스페이스')}
                      </Button>
                    </div>
                    <div>
                      <Button
                        type="submit"
                        size="xs"
                        color="white"
                        outline
                        onClick={() => {
                          history.push('/spaces');
                          setSpaceOpen(false);
                        }}
                      >
                        <i className="fas fa-search" /> {t('스페이스 검색')}
                      </Button>
                    </div>
                  </div>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {configOpen && (
        <div className={`config-popup ${user.id ? 'logged-in' : ''}`}>
          <div
            className="popup-overlay"
            onClick={() => {
              setConfigOpen(false);
            }}
          />
          <div className="popup-layout">
            <div>
              <div className="arrow">
                <div />
              </div>
              <div className="popup-content">
                {user && user.id && (
                  <div className="user-info">
                    <div>
                      <UserImage size="50px" iconFontSize="30px" imageType={user.imageType} imageData={user.imageData} rounded border />
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
                )}
                <BlockTitle className={`sub-title ${user && user.id ? '' : 'pt-0'}`} size="xs" bold={false}>
                  QUICK MENU
                </BlockTitle>
                <div className="d-flex quick-menu">
                  <div className="quick-menu-label small align-self-center">
                    <span>{t('언어')}</span>
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
                          tooltip: {
                            text: '',
                            place: '',
                          },
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
                    <span>{t('지역')}</span>
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
                          tooltip: {
                            text: '',
                            place: '',
                          },
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
    space: state.space,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSetting: (key, value) => dispatch(setSetting(key, value)),
    setUserInfo: (user) => dispatch(setUserInfo(user)),
    setSpaceInfo: (space) => dispatch(setSpaceInfo(space)),
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
  space: SpacePropTypes,
  setSpaceInfo: PropTypes.func,
};
