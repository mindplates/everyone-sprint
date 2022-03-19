import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Button, Liner } from '@/components';
import { HistoryPropTypes } from '@/proptypes';
import './ConferenceControls.scss';

const ConferenceControls = ({ t, setControls, controls, screenShare, startScreenShare, stopScreenShare, history }) => {
  return (
    <div className="conference-controls-wrapper">
      <div>
        <Button
          className="first"
          size="md"
          rounded
          color="white"
          onClick={() => {
            setControls('audio', !controls.audio);
          }}
        >
          {controls.audio && <i className="fas fa-microphone" />}
          {!controls.audio && <i className="fas fa-microphone-slash" />}
        </Button>
        <Button
          size="md"
          rounded
          color="white"
          onClick={() => {
            setControls('video', !controls.video);
          }}
        >
          {controls.video && <i className="fas fa-video" />}
          {!controls.video && <i className="fas fa-video-slash" />}
        </Button>
        <Liner display="inline-block" width="1px" height="10px" color="white" margin="0 0.5rem" />
        {!screenShare.sharing && !controls.sharing && (
          <Button size="md" rounded data-tip={t('내 화면 공유')} color="white" onClick={startScreenShare}>
            <i className="fas fa-desktop" />
          </Button>
        )}
        {!screenShare.sharing && controls.sharing && (
          <Button size="md" rounded data-tip={t('공유 중지')} color="danger" onClick={stopScreenShare}>
            <i className="fas fa-desktop" />
          </Button>
        )}
        {screenShare.sharing && (
          <Button size="md" data-tip={t('공유 중지 요청')} color="danger" onClick={() => {}}>
            공유 중지 요청
          </Button>
        )}
        <Liner display="inline-block" width="1px" height="10px" color="white" margin="0 0.5rem" />
        <Button
          size="md"
          rounded
          color="danger"
          onClick={() => {
            history.push('/meetings');
          }}
        >
          <i className="fas fa-times" />
        </Button>
        <div className="additional-button">
          <Button
            size="md"
            rounded
            color="white"
            data-tip={t('참석자 목록')}
            className={controls.participants ? 'selected' : ''}
            onClick={() => {
              setControls('participants', !controls.participants);
            }}
          >
            <i className="fas fa-child" />
          </Button>
          <Button size="md" rounded color="white" data-tip={t('채팅')} className={controls.chatting ? 'selected' : ''} onClick={() => {}} disabled>
            <i className="far fa-comment-dots" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(withRouter(ConferenceControls));

ConferenceControls.propTypes = {
  t: PropTypes.func,
  dailyScrumInfo: PropTypes.shape({
    started: PropTypes.bool,
    scrumUserOrders: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.number,
        order: PropTypes.number,
        isCurrentSpeaker: PropTypes.bool,
        isDailyScrumDone: PropTypes.bool,
      }),
    ),
    currentSpeakerUserId: PropTypes.number,
    currentFocusId: PropTypes.number,
  }),
  history: HistoryPropTypes,
  controls: PropTypes.shape({
    audio: PropTypes.bool,
    video: PropTypes.bool,
    participants: PropTypes.bool,
    sharing: PropTypes.bool,
    chatting: PropTypes.bool,
    scrumInfo: PropTypes.bool,
  }),
  setControls: PropTypes.func,
  screenShare: PropTypes.shape({
    sharing: PropTypes.bool,
    userId: PropTypes.number,
  }),
  startScreenShare: PropTypes.func,
  stopScreenShare: PropTypes.func,
};
