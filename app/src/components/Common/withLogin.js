import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import { Button, ProductLogo } from '@/components';
import Spinner from '@/components/Spinner/Spinner';
import './withLogin.scss';
import { CONFERENCE_URL_PATTERN } from '@/constants/constants';

const withLogin = (WrappedComponent) => {
  class NeedLogin extends React.Component {
    timer = null;

    constructor(props) {
      super(props);
      this.state = {
        delayed: false,
      };
    }

    componentDidMount() {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        this.setState({
          delayed: true,
        });
      }, 500);
    }

    componentWillUnmount() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    }

    render() {
      const { user, t, history } = this.props;
      const { delayed } = this.state;

      if (user.tried && delayed && user && user.id) {
        return <WrappedComponent {...this.props} />;
      }

      const isConference = CONFERENCE_URL_PATTERN.test(history.location.pathname);

      return (
        <div className={`with-login-wrapper ${isConference ? 'black' : ''}`}>
          {(!user.tried || (user.tried && !delayed)) && (
            <div>
              <Spinner color="primary" />
            </div>
          )}
          {user.tried && delayed && (
            <div>
              <div className="logo">
                <ProductLogo className="bg-transparent d-inline-block" name={false} width="auto" />
              </div>
              <div className="message">{t('사용을 위해 로그인이 필요합니다.')}</div>
              <div className="login">
                <Button
                  size="sm"
                  color="white"
                  outline
                  onClick={() => {
                    history.push(`/login?url=${window.location.pathname}`);
                  }}
                >
                  로그인
                </Button>
              </div>
              <div className="new-user">
                <Link to="/join">{t('회원가입')}</Link>
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  NeedLogin.propTypes = {
    user: UserPropTypes,
    t: PropTypes.func,
    history: HistoryPropTypes,
  };

  const mapStateToProps = (state) => {
    return {
      user: state.user,
    };
  };

  return compose(withTranslation(), connect(mapStateToProps, undefined))(withRouter(NeedLogin));
};

export default withLogin;
