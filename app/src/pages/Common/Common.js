import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import TimeAgo from 'javascript-time-ago';
import { compose } from 'recompose';
import { setHistory, setSpaceInfo, setSystemInfo, setUserInfo } from '@/store/actions';
import { MessageDialog } from '@/components';
import request from '@/utils/request';
import storage from '@/utils/storage';
import Spinner from '@/components/Spinner/Spinner';
import commonUtil from '@/utils/commonUtil';
import { HistoryPropTypes } from '@/proptypes';
import { USER_STUB } from '@/constants/constants';
import './Common.scss';

class Common extends React.Component {
  componentDidMount() {
    this.getSystemInfo();
    this.getMyInfo();
    const { history } = this.props;
    const { setHistory: setHistoryReducer } = this.props;
    setHistoryReducer(history);
  }

  getSystemInfo = () => {
    const { setSystemInfo: setSystemInfoReducer } = this.props;
    request.get('/api/common/system/info', null, (data) => {
      setSystemInfoReducer(data);
    });
  };

  getMyInfo = () => {
    const { setSpaceInfo: setSpaceInfoReducer } = this.props;

    request.get('/api/users/my-info', null, (data) => {
      setSpaceInfoReducer(commonUtil.getUserSpace(data.spaces));

      const token = storage.getItem('auth', 'token');
      if (!data.id && token) {
        storage.setItem('auth', 'token', null);
      }
      const { setUserInfo: setUserInfoReducer, i18n } = this.props;
      if (data.id) {
        setUserInfoReducer(data);
        i18n.changeLanguage(data.language);
        TimeAgo.setDefaultLocale(data.language);
      } else {
        setUserInfoReducer({ ...USER_STUB });
        i18n.changeLanguage(USER_STUB.language);
        TimeAgo.setDefaultLocale(USER_STUB.language);
      }
    });
  };

  render() {
    const {
      message,
      loading: { requests, loading },
      confirm,
    } = this.props;

    return (
      <div className="common-wrapper">
        {message && message.content && (
          <MessageDialog type="message" category={message.category} title={message.title} message={message.content} okHandler={message.okHandler} />
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
        <div className={`g-overlay loader ${requests.length > 0 ? 'show-loading' : 'hide-loading'}`}>
          <div className="loading-message-content">
            {requests.map((info, inx) => {
              return (
                <div key={inx}>
                  <div className="loading-message show-loading">
                    <Spinner className="spinner" color="yellow" type="bar" size="40px" />
                    <div>{info.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`g-overlay loader ${loading ? 'show-loading' : 'hide-loading'}`}>
          <div>
            <div>
              <div className="loading-message">loading</div>
            </div>
          </div>
        </div>
        <ReactTooltip effect="solid" />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    message: state.message,
    loading: state.loading,
    user: state.user,
    confirm: state.confirm,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUserInfo: (user) => dispatch(setUserInfo(user)),
    setSystemInfo: (systemInfo) => dispatch(setSystemInfo(systemInfo)),
    setSpaceInfo: (space) => dispatch(setSpaceInfo(space)),
    setHistory: (history) => dispatch(setHistory(history)),
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter, withTranslation())(Common);

Common.propTypes = {
  i18n: PropTypes.objectOf(PropTypes.any),
  message: PropTypes.shape({
    category: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    okHandler: PropTypes.func,
  }),
  confirm: PropTypes.shape({
    category: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    okHandler: PropTypes.func,
    noHandler: PropTypes.func,
  }),
  loading: PropTypes.shape({
    loading: PropTypes.bool,
    requests: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        text: PropTypes.string,
      }),
    ),
  }),
  setUserInfo: PropTypes.func,
  setSystemInfo: PropTypes.func,
  setHistory: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
  setSpaceInfo: PropTypes.func,
  history: HistoryPropTypes,
};
