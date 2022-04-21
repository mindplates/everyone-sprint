import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { UserPropTypes } from '@/proptypes';
import { Button } from '@/components';
import request from '@/utils/request';
import './JoinRequestManager.scss';

const JoinRequestManager = ({ t, code, joinRequests, setJoinRequests }) => {
  const onJoinRequestResponse = (userId, allowed) => {
    request.put(
      `/api/{spaceCode}/meets/${code}/request/join/response`,
      {
        userId,
        allowed,
      },
      null,
      null,
      allowed ? t('사용자에게 참석을 안내합니다.') : t('사용자에게 거절 메세지를 알립니다.'),
    );
  };

  const onRemoveJoinRequest = (userId) => {
    const nextJoinRequests = joinRequests.slice(0);
    const index = nextJoinRequests.findIndex((d) => d.user.id === userId);
    if (index > -1) {
      nextJoinRequests[index].visible = false;
      setJoinRequests(nextJoinRequests);
    }
  };

  return (
    <div className="join-request-manager-wrapper">
      {joinRequests.length > 0 && (
        <ul>
          {joinRequests
            .filter((d) => d.visible)
            .map((joinRequest, inx) => {
              return (
                <li key={inx}>
                  {joinRequest.message && (
                    <div className="message">
                      <span>{`${joinRequest.message}`}</span>
                    </div>
                  )}
                  {!joinRequest.message && (
                    <div className="message">
                      <span>{`${joinRequest.user.alias}님이 미팅 참석을 요청하였습니다.`}</span>
                      <Button
                        size="xs"
                        color="danger"
                        onClick={() => {
                          onJoinRequestResponse(joinRequest.user.id, false);
                        }}
                      >
                        {t('거절')}
                      </Button>
                      <Button
                        size="xs"
                        color="white"
                        onClick={() => {
                          onJoinRequestResponse(joinRequest.user.id, true);
                        }}
                      >
                        {t('수락')}
                      </Button>
                      <Button
                        size="xs"
                        rounded
                        color="white"
                        onClick={() => {
                          onRemoveJoinRequest(joinRequest.user.id);
                        }}
                      >
                        <i className="fas fa-times" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default compose(withTranslation())(JoinRequestManager);

JoinRequestManager.propTypes = {
  t: PropTypes.func,
  code: PropTypes.string,
  joinRequests: PropTypes.arrayOf(
    PropTypes.shape({
      user: UserPropTypes,
      allow: PropTypes.bool,
    }),
  ),
  setJoinRequests: PropTypes.func,
};
