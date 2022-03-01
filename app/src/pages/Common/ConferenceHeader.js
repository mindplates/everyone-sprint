import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import TimeAgo from 'javascript-time-ago/modules/TimeAgo';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import storage from '@/utils/storage';
import { BlockTitle, Button, Liner, ProductLogo, UserImage } from '@/components';
import { setUserInfo } from '@/store/actions';
import './ConferenceHeader.scss';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { COUNTRIES, LANGUAGES, USER_STUB } from '@/constants/constants';
import commonUtil from '@/utils/commonUtil';

const ConferenceHeader = (props) => {
  const { setUserInfo: setUserInfoReducer, location, t, user, i18n, history } = props;

  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {}, []);

  const values = (location.pathname.split('/') || []).filter((value) => value);
  const [currentTopMenu] = values;

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
        history.push('/');
      },
      null,
      t('로그인 정보를 깨끗하게 정리하고 있습니다.'),
    );
  };

  const updateLanguage = (language) => {
    i18n.changeLanguage(language || 'ko');
    request.put(
      '/api/users/my-info/language',
      { language },
      () => {
        TimeAgo.setDefaultLocale(language || 'ko');
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
    <div className="conference-header-wrapper">
      <div className="header-content">
        <div className="product-logo">
          <Link
            to="/"
            onClick={() => {
              commonUtil.fullscreen(false);
            }}
          >
            <ProductLogo hover backgroundColor="transparent" name={false} width="auto" />
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
                {user && user.id && <UserImage size="36px" iconFontSize="20px" imageType={user.imageType} imageData={user.imageData} rounded />}
                {!(user && user.id) && <i className="fas fa-cog" />}
              </Button>
            </div>
            {!(user && user.id) && (
              <div className="login">
                <div className={currentTopMenu === 'starting-line' ? 'selected' : ''}>
                  <div className="arrow">
                    <div />
                  </div>
                  <Link to="/login">
                    <span>{t('로그인')}</span>
                  </Link>
                </div>
              </div>
            )}
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
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUserInfo: (user) => dispatch(setUserInfo(user)),
  };
};

export default withRouter(withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ConferenceHeader)));

ConferenceHeader.propTypes = {
  t: PropTypes.func,
  i18n: PropTypes.objectOf(PropTypes.any),
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
  user: UserPropTypes,
  setUserInfo: PropTypes.func,
  history: HistoryPropTypes,
};
