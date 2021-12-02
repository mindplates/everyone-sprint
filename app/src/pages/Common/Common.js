import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import { setSystemInfo, setUserInfo } from '@/store/actions';
import { MessageDialog } from '@/components';
import request from '@/utils/request';
import storage from '@/utils/storage';
import './Common.scss';

class Common extends React.Component {
  timer = null;

  constructor(props) {
    super(props);

    this.state = {
      showLoading: false,
    };
  }

  componentDidMount() {
    this.getSystemInfo();
    this.getMyInfo();
  }

  componentDidUpdate(prevProps) {
    const { loading } = this.props;

    if (!prevProps.loading && loading) {
      setTimeout(() => {
        this.setState({
          showLoading: true,
        });
      }, 0);
    }

    if (prevProps.loading && !loading) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.setState({
          showLoading: false,
        });
      }, 300);
    }
  }

  getSystemInfo = () => {
    const { setSystemInfo: setSystemInfoReducer } = this.props;
    request.get('/api/common/system/info', null, (data) => {
      setSystemInfoReducer(data);
    });
  };

  getMyInfo = () => {
    request.get('/api/users/my-info', null, (data) => {
      const token = storage.setItem('auth', 'token');
      if (!data.id && token) {
        storage.setItem('auth', 'token', null);
      }
      const { setUserInfo: setUserInfoReducer, i18n } = this.props;
      setUserInfoReducer(data);
      i18n.changeLanguage(data.language || 'ko');
    });
  };

  render() {
    const { message, loading, confirm } = this.props;
    const { showLoading } = this.state;

    return (
      <div className="common-wrapper">
        {message && message.content && (
          <MessageDialog
            type="message"
            category={message.category}
            title={message.title}
            message={message.content}
            okHandler={message.okHandler}
          />
        )}
        {confirm && confirm.content && (
          <MessageDialog
            type="confirm"
            category={confirm.category}
            title={confirm.title}
            message={confirm.content}
            okHandler={confirm.okHandler}
            noHandler={confirm.noHandler}
          />
        )}
        {false && (loading || showLoading) && (
          <div className={`g-overlay ${showLoading ? 'show-loading' : 'hide-loading'}`}>
            <div>
              <div>
                <div>loading</div>
              </div>
            </div>
          </div>
        )}
        <ReactTooltip effect="solid" />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    message: state.message,
    loading: state.loading.loading,
    user: state.user,
    confirm: state.confirm,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUserInfo: (user) => dispatch(setUserInfo(user)),
    setSystemInfo: (systemInfo) => dispatch(setSystemInfo(systemInfo)),
  };
};

export default withRouter(withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Common)));

Common.propTypes = {
  i18n: PropTypes.objectOf(PropTypes.any),
  message: PropTypes.shape({
    category: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    okHandler: PropTypes.func,
  }),
  confirm: PropTypes.shape({
    category: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    okHandler: PropTypes.func,
    noHandler: PropTypes.func,
  }),
  loading: PropTypes.bool,
  setUserInfo: PropTypes.func,
  setSystemInfo: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};
