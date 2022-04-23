import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { debounce as debounceFunc } from 'lodash';
import PropTypes from 'prop-types';
import qs from 'qs';
import { Button, CheckBox, Form, Input, Liner, Page, PageContent, ProductLogo } from '@/components';
import { setSpaceInfo, setUserInfo } from '@/store/actions';
import request from '@/utils/request';
import storage from '@/utils/storage';
import { HistoryPropTypes, LocationPropTypes } from '@/proptypes';
import { COLORS } from '@/constants/constants';
import commonUtil from '@/utils/commonUtil';
import './Login.scss';

const enableTypingEffect = true;

const Login = ({ t, history, location, setUserInfo: setUserInfoReducer, setSpaceInfo: setSpaceInfoReducer }) => {
  const bgRef = useRef(null);

  const [info, setInfo] = useState({ email: '', password: '', autoLogin: true });
  const [url, setUrl] = useState('');
  const [dots, setDots] = useState([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const search = qs.parse(location.search, { ignoreQueryPrefix: true });
    const { url: searchUrl } = search;
    setUrl(searchUrl);
  }, [location.search]);

  useEffect(() => {
    const count = 3 + Math.round(Math.random() * 6);
    const nextDots = [];
    let targetWidth = 1000;
    if (bgRef.current) {
      targetWidth = bgRef.current.offsetWidth;
    }

    for (let i = 0; i < count; i += 1) {
      const size = targetWidth / 6 + (targetWidth / 2) * Math.random();
      const dir1 = Math.floor(Math.random() * 10) % 2 === 1 ? 1 : -1;
      const dir2 = Math.floor(Math.random() * 10) % 2 === 1 ? 1 : -1;
      const colorIndex = Math.floor(Math.random() * COLORS.length);
      const animationDuration = 4 + Math.random() * 5;

      nextDots.push({
        width: size,
        height: size,
        left: (10 + Math.random() * 60) * dir1,
        top: (10 + Math.random() * 60) * dir2,
        color: COLORS[colorIndex],
        opacity: 0.1 + Math.random() * 0.2,
        animationDuration,
      });
    }
    setDots(nextDots);
  }, []);

  const setTypingEffect = (value) => {
    setTyping(value);
  };

  const setTypingEffectDebounce = useRef(debounceFunc(setTyping, 300)).current;

  const changeInfo = (key, value) => {
    if (enableTypingEffect) {
      setTypingEffect(true);
      setTypingEffectDebounce(false);
    }
    const next = { ...info };
    next[key] = value;
    setInfo(next);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    request.post(
      '/api/users/login',
      info,
      (data) => {
        const { autoLogin } = data;
        if (autoLogin) {
          storage.setItem('auth', 'token', data.loginToken);
        } else {
          storage.setItem('auth', 'token', null);
        }

        setUserInfoReducer(data);
        setSpaceInfoReducer(commonUtil.getUserSpace(data.spaces));
        if (url) {
          history.push(url);
        } else {
          history.push('/');
        }
      },
      null,
      t('인증 정보를 확인하고 있습니다.'),
    );
  };

  return (
    <Page className="login-wrapper">
      <div className="bg" ref={bgRef}>
        {dots.map((dot, inx) => {
          return (
            <div
              key={inx}
              className="dot"
              style={{
                width: `${dot.width}px`,
                height: `${dot.height}px`,
                top: `${dot.top}%`,
                left: `${dot.left}%`,
                backgroundColor: dot.color,
                opacity: dot.opacity,
                animationDuration: `${dot.animationDuration}s`,
              }}
            />
          );
        })}
      </div>
      <PageContent listLayout className="login-content">
        <Form onSubmit={onSubmit} className={typing ? 'typing' : ''}>
          <div className="mb-2 text-center">
            <ProductLogo className="bg-white d-inline-block" />
          </div>
          <Liner className="d-none d-sm-block" width="100%" height="1px" color="light" margin="1rem 0" />
          {url && (
            <div className="need-auth-message">
              <span>{t('로그인이 필요합니다.')}</span>
            </div>
          )}
          <div className="email">
            <Input
              type="email"
              size="md"
              value={info.email}
              onChange={(val) => changeInfo('email', val)}
              placeholderMessage="EMAIL"
              required
              minLength={1}
              focus
            />
          </div>
          <div className="password">
            <Input
              type="password"
              size="md"
              value={info.password}
              onChange={(val) => changeInfo('password', val)}
              placeholderMessage="PASSWORD"
              required
              minLength={2}
            />
          </div>
          <div className="auto-login">
            <CheckBox size="sm" type="checkbox" value={info.autoLogin} onChange={(val) => changeInfo('autoLogin', val)} label={t('자동 로그인')} />
          </div>
          <div className="bottom-button">
            <Button type="submit" size="md" color="white" outline>
              {t('로그인')}
            </Button>
          </div>
          <div className="message">
            <Link to="/join">회원 가입</Link>
          </div>
        </Form>
      </PageContent>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUserInfo: (user) => dispatch(setUserInfo(user)),
    setSpaceInfo: (space) => dispatch(setSpaceInfo(space)),
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter, withTranslation())(Login);

Login.propTypes = {
  t: PropTypes.func,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  history: HistoryPropTypes,
  setUserInfo: PropTypes.func,
  location: LocationPropTypes,
  setSpaceInfo: PropTypes.func,
};
