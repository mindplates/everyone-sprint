import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Button, CheckBox, Form, Input } from '@/components';
import { setUserInfo } from '@/store/actions';
import request from '@/utils/request';
import storage from '@/utils/storage';
import './StartingLine.scss';
import { HistoryPropTypes } from '@/proptypes';

const StartingLine = ({ t, history, setUserInfo: setUserInfoReducer }) => {
  const [info, setInfo] = useState({ email: '', password: '', autoLogin: false });

  const changeInfo = (key, value) => {
    const next = { ...info };
    next[key] = value;
    setInfo(next);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    request.post('/api/users/login', info, (data) => {
      const { autoLogin } = data;
      if (autoLogin) {
        storage.setItem('auth', 'token', data.loginToken);
      } else {
        storage.setItem('auth', 'token', null);
      }

      setUserInfoReducer(data);
      history.push('/');
    });
  };

  return (
    <div className="starting-line-wrapper g-content">
      <div className="starting-line-content g-page-content">
        <Form onSubmit={onSubmit}>
          <div className="email">
            <Input
              type="email"
              size="md"
              value={info.email}
              onChange={(val) => changeInfo('email', val)}
              placeholderMessage="EMAIL"
              required
              minLength={1}
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
            <CheckBox
              size="sm"
              type="checkbox"
              value={info.autoLogin}
              onChange={(val) => changeInfo('autoLogin', val)}
              label={t('자동 로그인')}
            />
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
};
