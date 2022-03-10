import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { HistoryPropTypes } from '@/proptypes';
import request from '@/utils/request';
import './Talks.scss';
import { withLogin } from '@/components';

const Talks = ({
                 t,
                 history,
                 match: {
                   params: { code },
                 },
               }) => {
  const [room, setRoom] = useState(null);

  const getRoom = () => {
    request.get(
      `/api/talks/${code}`,
      null,
      (data) => {
        setRoom(data);
        history.push(`/talks/${data.meeting.code}/rooms/${data.code}`);
      },
      (error, response) => {
        if (response && response.status === 403) {
          // TODO 권한이 없는 경우, 요청 및 승인 처리
        }

        setRoom({});

        return true;
      },
      t('미팅 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    if (code) {
      getRoom();
    }
  }, [code]);

  return <div className="meetings-wrapper g-content">{room?.code}</div>;
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default compose(withLogin, connect(mapStateToProps, undefined), withRouter, withTranslation())(Talks);

Talks.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      code: PropTypes.string,
    }),
  }),
};
