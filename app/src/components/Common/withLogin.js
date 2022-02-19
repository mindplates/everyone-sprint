import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserPropTypes } from '@/proptypes';
import { ProductLogo } from '@/components';
import Spinner from '@/components/Spinner/Spinner';
import './withLogin.scss';

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
      const { user, t } = this.props;
      const { delayed } = this.state;

      if (user.tried && delayed && user && user.id) {
        return <WrappedComponent {...this.props} />;
      }

      return (
        <div className="with-login-wrapper">
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
              <div className="message">{t('로그인이 필요한 서비스입니다')}</div>
              <div className="login">
                <Link to="/starting-line">
                  <span>{t('로그인')}</span>
                </Link>
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
  };

  const mapStateToProps = (state) => {
    return {
      user: state.user,
    };
  };

  return compose(withTranslation(), connect(mapStateToProps, undefined))(NeedLogin);
};

export default withLogin;
