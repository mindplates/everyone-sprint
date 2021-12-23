import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import qs from 'qs';
import { Button, CheckBox, Form, Input, Liner, Page, PageContent, ProductLogo } from '@/components';
import { setUserInfo } from '@/store/actions';
import request from '@/utils/request';
import storage from '@/utils/storage';
import { HistoryPropTypes, LocationPropTypes } from '@/proptypes';
import './StartingLine.scss';

const StartingLine = ({ t, history, location, setUserInfo: setUserInfoReducer }) => {
  const [info, setInfo] = useState({ email: '', password: '', autoLogin: false });
  const [url, setUrl] = useState('');

  const changeInfo = (key, value) => {
    const next = { ...info };
    next[key] = value;
    setInfo(next);
  };

  useEffect(() => {
    const search = qs.parse(location.search, { ignoreQueryPrefix: true });
    const { url: searchUrl } = search;
    setUrl(searchUrl);
  }, [location.search]);

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
    <Page className="starting-line-wrapper">
      <PageContent className="starting-line-content">
        <Form onSubmit={onSubmit}>
          <div className="mb-2">
            <ProductLogo className="bg-white" />
          </div>
          <Liner width="100%" height="1px" color="light" margin="1rem 0" />
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
            <Link to="/entry">새로운 사용자를 등록합니다.</Link>
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withRouter(StartingLine)));

StartingLine.propTypes = {
  t: PropTypes.func,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  history: HistoryPropTypes,
  setUserInfo: PropTypes.func,
  location: LocationPropTypes,
};
