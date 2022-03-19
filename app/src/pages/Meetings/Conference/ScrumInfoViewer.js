import React, { useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { BlockTitle, Button, ConferenceVideoItem, FadeMessage } from '@/components';
import './ScrumInfoViewer.scss';
import { UserPropTypes } from '@/proptypes';
import request from '@/utils/request';

const ScrumInfoViewer = ({ t, user, questions, answers, dailyScrumInfo, conference, stream, onFocus }) => {
  const initMessage = useRef(false);
  const [message, setMessage] = useState(null);
  const [currentUserMessage, setCurrentUserMessage] = useState(null);

  const doneUserScrumDone = () => {
    request.put(`/api/meets/${conference.code}/scrum?operation=next`, null, null, null, t('다음 데일리 스크럼 사용자를 찾고 있습니다.'));
  };

  const currentUser = conference.users.find((d) => d.userId === dailyScrumInfo.currentSpeakerUserId);

  useEffect(() => {
    setMessage(t('데일리 스크럼을 시작합니다.'));
  }, []);

  useEffect(() => {
    if (currentUser && initMessage.current) {
      setCurrentUserMessage(currentUser.alias);
    }
  }, [currentUser]);

  const currentUserAnswers = answers.filter((answer) => answer.user.id === dailyScrumInfo.currentSpeakerUserId);

  const myTurn = user.id === dailyScrumInfo.currentSpeakerUserId;

  return (
    <div className="scrum-info-viewer-wrapper">
      {message && (
        <FadeMessage
          className="message-content"
          onComplete={() => {
            initMessage.current = true;
            setMessage(null);
          }}
        >
          <div>
            <div>
              <div className="image-content" />
            </div>
            <div className="message-text">{message}</div>
          </div>
        </FadeMessage>
      )}
      {currentUserMessage && (
        <FadeMessage
          className="message-content"
          onComplete={() => {
            setCurrentUserMessage(null);
          }}
        >
          <div>
            <div className="message-text">{currentUserMessage}</div>
          </div>
        </FadeMessage>
      )}

      <div className="scrum-info-content">
        <div className="question-answer">
          <div className="scrum-info-title">
            <BlockTitle size="lg" className="mb-0">
              {currentUser?.alias}&lsquo;S TODAY
            </BlockTitle>
          </div>
          <div className="question-answer-content">
            {questions && questions.length > 0 && (
              <ul>
                {questions.map((d) => {
                  const currentAnswer = currentUserAnswers.find((answer) => answer.scrumMeetingQuestionId === d.id)?.answer;
                  return (
                    <li
                      key={d.id}
                      className={`${dailyScrumInfo.currentFocusId === d.id ? 'focused' : ''} ${myTurn ? 'my-turn' : ''}`}
                      onClick={() => {
                        if (dailyScrumInfo.currentFocusId === d.id) {
                          onFocus(null);
                        } else {
                          onFocus(d.id);
                        }
                      }}
                    >
                      <div className="question">
                        <span>{d.question}</span>
                      </div>
                      <div className="answer">
                        <span>{currentAnswer || <span>&nbsp;</span>}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        <div className="current-user-video">
          <ConferenceVideoItem
            className="current-scrum-info-user-video"
            stream={stream}
            muted
            alias={currentUser?.alias ? '' : ''}
            imageType={currentUser?.imageType}
            imageData={currentUser?.imageData}
            controls={{
              audio: currentUser?.participant?.audio,
              video: currentUser?.participant?.video,
            }}
          />
        </div>
      </div>
      <div className="scrum-info-button">
        {myTurn && (
          <Button size="md" color="white" outline onClick={doneUserScrumDone}>
            <i className="fas fa-check-circle" /> {t('완료')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default withTranslation()(ScrumInfoViewer);

ScrumInfoViewer.propTypes = {
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
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      question: PropTypes.string,
    }),
  ),
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string,
    }),
  ),
  user: UserPropTypes,
  stream: PropTypes.objectOf(PropTypes.any),
  onFocus: PropTypes.func,
  conference: PropTypes.shape(PropTypes.any),
};
