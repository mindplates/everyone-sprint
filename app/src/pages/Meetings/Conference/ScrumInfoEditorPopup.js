import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Liner, Popup, TextArea } from '@/components';
import './ScrumInfoEditorPopup.scss';
import request from '@/utils/request';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import dateUtil from '@/utils/dateUtil';

const ScrumInfoEditorPopup = ({
  t,
  setOpen,
  questions,
  answers: propsAnswer,
  scrumMeetingPlanId,
  date,
  sprintId,
  onSaveComplete,
  scrumMeetingPlans,
  onChangeCurrentSprintDailyMeetingId,
}) => {
  const [answers, setAnswer] = useState(_.cloneDeep(propsAnswer));

  useEffect(() => {
    setAnswer(_.cloneDeep(propsAnswer));
  }, [scrumMeetingPlanId]);

  const getLastMeetingAnswer = () => {
    request.get(
      `/api/{spaceCode}/sprints/${sprintId}/meetings/${scrumMeetingPlanId}/answers/latest?date=${date}`,
      null,
      (result) => {
        if (result.length < 1) {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('데이터 없음'), `${dateUtil.getDateString(date, 'days')} 이전에 작성된 정보가 없습니다.`);
          return;
        }

        const nextSelectedAnswers = answers.slice(0);

        result.forEach((answer) => {
          let info = nextSelectedAnswers.find((d) => d.scrumMeetingQuestionId === answer.scrumMeetingQuestionId);

          if (!info) {
            info = {
              date,
              scrumMeetingQuestionId: answer.scrumMeetingQuestionId,
              sprintId,
            };
            nextSelectedAnswers.push(info);
          }

          info.answer = answer.answer;
        });

        setAnswer(nextSelectedAnswers);
      },
      null,
      t('지난 마지막 스크럼 정보를 불러오고 있습니다.'),
    );
  };

  const onChangeAnswer = (questionId, value) => {
    const nextAnswers = answers.slice(0);
    let answer = nextAnswers.find((d) => d.scrumMeetingQuestionId === questionId);
    if (!answer) {
      answer = {
        date,
        scrumMeetingQuestionId: questionId,
        sprintId,
      };
      nextAnswers.push(answer);
    }
    answer.answer = value;
    setAnswer(nextAnswers);
  };

  const saveDailyMeetingAnswers = () => {
    request.post(
      `/api/{spaceCode}/sprints/${sprintId}/answers?date=${date}`,
      answers,
      () => {
        if (onSaveComplete) {
          onSaveComplete();
        }
        setOpen();
      },
      null,
      t('입력하신 스크럼 정보를 저장하고 있습니다.'),
    );
  };

  return (
    <Popup
      title={t('데일리 스크럼 정보')}
      className="scrum-info-editor-popup-wrapper"
      size="md"
      open
      setOpen={() => {
        setOpen(false);
      }}
    >
      <div className="scrum-info-content">
        {scrumMeetingPlans?.length > 1 && (
          <div className="daily-meeting-list">
            <ul>
              {scrumMeetingPlans.map((d) => {
                return (
                  <li key={d.id}>
                    <Button
                      size="sm"
                      color="white"
                      className={`${d.id === scrumMeetingPlanId ? 'selected' : ''}`}
                      outline
                      onClick={() => {
                        onChangeCurrentSprintDailyMeetingId(d.id);
                      }}
                    >
                      {d.name}
                    </Button>
                  </li>
                );
              })}
            </ul>
            <Liner width="100%" height="1px" color="light" margin="1rem 0" />
          </div>
        )}
        {questions && questions.length > 0 && (
          <ul className="questions">
            {questions.map((d, inx) => {
              const currentAnswer = answers.find((answer) => answer.scrumMeetingQuestionId === d.id)?.answer;
              return (
                <li key={d.id}>
                  <div className="question">{d.question}</div>
                  <div className="answer">
                    <div className="textarea">
                      <TextArea
                        value={currentAnswer}
                        onChange={(value) => {
                          onChangeAnswer(d.id, value);
                        }}
                        simple
                        showLength
                        maxLength={1000}
                        rows={3}
                      />
                    </div>
                    <div className="controls">
                      <div>
                        <div>
                          {inx < 1 && questions.length > 1 && (
                            <Button
                              size="sm"
                              color="white"
                              outline
                              rounded
                              onClick={() => {
                                onChangeAnswer(questions[1].id, currentAnswer);
                              }}
                            >
                              <i className="fas fa-level-down-alt" />
                            </Button>
                          )}
                          {inx > 0 && (
                            <Button
                              size="sm"
                              color="white"
                              outline
                              rounded
                              onClick={() => {
                                onChangeAnswer(questions[inx - 1].id, currentAnswer);
                              }}
                            >
                              <i className="fas fa-level-up-alt" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <Button
                            size="sm"
                            color="white"
                            outline
                            rounded
                            onClick={() => {
                              onChangeAnswer(d.id, '');
                            }}
                          >
                            <i className="fas fa-times" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="buttons">
          <Button size="md" color="white" outline onClick={getLastMeetingAnswer}>
            <i className="fas fa-retweet" /> {t('지난 마지막 스크럼 정보 불러오기')}
          </Button>
          <Button
            size="md"
            color="white"
            outline
            onClick={() => {
              saveDailyMeetingAnswers();
            }}
          >
            <i className="fas fa-save" /> {t('저장')}
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default withTranslation()(ScrumInfoEditorPopup);

ScrumInfoEditorPopup.propTypes = {
  t: PropTypes.func,
  setOpen: PropTypes.func,
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
  scrumMeetingPlanId: PropTypes.number,
  date: PropTypes.string,
  sprintId: PropTypes.number,
  onSaveComplete: PropTypes.func,

  scrumMeetingPlans: PropTypes.arrayOf(PropTypes.any),
  onChangeCurrentSprintDailyMeetingId: PropTypes.func,
};
