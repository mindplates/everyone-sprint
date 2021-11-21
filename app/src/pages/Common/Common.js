import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import { setSystemInfo, setUserInfo } from '@/store/actions';
import { MessageDialog, SocketClient } from '@/components';
import request from '@/utils/request';
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
    const { setSystemInfo: setSystemInfoReducer, i18n } = this.props;
    request.get('/api/common/system/info', null, (data) => {
      setSystemInfoReducer(data);

      if (1 > 2) {
        i18n.changeLanguage('en');
      }
    });
  };

  onMessage = (msg) => {
    const { type } = msg;

    switch (type) {
      case 'SHARE_PUBLIC_INFO_CHANGED': {
        break;
      }

      default: {
        break;
      }
    }
  };

  render() {
    const { message, loading, confirm, setUserInfo: setUserInfoReducer } = this.props;
    const { showLoading } = this.state;

    if (1>2) {
      console.log(setUserInfoReducer);
    }


    return (
      <div className="common-wrapper">
        {false && (
          <SocketClient
            topics={['/sub/public']}
            onMessage={this.onMessage}
            onConnect={() => {}}
            onDisconnect={() => {}}
            setRef={(client) => {
              this.clientRef = client;
            }}
          />
        )}
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
    user: state.user.user,
    confirm: state.confirm,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUserInfo: (user, grps, shareCount) => dispatch(setUserInfo(user, grps, shareCount)),

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
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  user: PropTypes.shape({
    id: PropTypes.number,
  }),
};
