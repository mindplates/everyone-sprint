import React from 'react';
import PropTypes from 'prop-types';
import SockJsClient from 'react-stomp';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';

class SocketClient extends React.PureComponent {
  render() {
    const local = ['localhost', '127.0.0.1', '192.168.39.3'].some((d) => d === window.location.hostname);
    // eslint-disable-next-line no-nested-ternary
    let base = local
      ? window.location.hostname === '192.168.39.3'
        ? 'http://192.168.39.3:15000'
        : 'http://localhost:15000'
      : '';

    if (window.location.hostname === 'mindplates.com' && window.location.port === '5000') {
      base = 'http://mindplates.com:15000';
    }

    const { topics } = this.props;
    const { headers } = this.props;
    const { onConnect, onMessage, onDisconnect, setRef } = this.props;

    return (
      <SockJsClient
        url={`${base}/ws-stomp`}
        topics={topics}
        headers={headers}
        onMessage={onMessage}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        getRetryInterval={(count) => {
          return 5000 * count;
        }}
        // autoReconnect={false}
        onConnectFailure={(e) => {
           console.error(e);
          dialog.setMessage(MESSAGE_CATEGORY.ERROR, '연결 오류', '서버와의 소켓 연결에 실패하였습니다.');
        }}
        ref={(client) => {
          setRef(client);
        }}
      />
    );
  }
}

export default SocketClient;

SocketClient.defaultProps = {};

SocketClient.propTypes = {
  onMessage: PropTypes.func,
  onConnect: PropTypes.func,
  onDisconnect: PropTypes.func,
  topics: PropTypes.arrayOf(PropTypes.string),
  headers: PropTypes.objectOf(PropTypes.any),
  setRef: PropTypes.func,
};
