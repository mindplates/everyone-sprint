import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { UserPropTypes } from '@/proptypes';
import { BlockRow, Button, CheckBox, DateRange, DateRangeText, Input, Label, Liner, Text } from '@/components';
import './DailyScrumMeeting.scss';

const DailyScrumMeeting = ({
  className,
  t,
  edit,
  no,
  onRemove,
  onChangeInfo,
  sprintDailyMeeting,
  onChangeMeetingDays,
  onChangeQuestionOrder,
  onChangeQuestion,
  user,
}) => {
  const labelMinWidth = '140px';

  return (
    <div className={`daily-scrum-meeting-wrapper ${className} ${edit ? 'edit' : ''}`}>
      <div className="meeting-index">
        <span>
          <span>{no}</span>
        </span>
      </div>
      {edit && (
        <div className="meeting-remove-button">
          <Button
            size="sm"
            color="warning"
            outline
            rounded
            onClick={() => {
              onRemove();
            }}
          >
            <i className="fas fa-times" />
          </Button>
        </div>
      )}
      <BlockRow>
        <Label minWidth={labelMinWidth}>{t('미팅 이름')}</Label>
        {edit && (
          <Input type="text" size="md" value={sprintDailyMeeting.name} onChange={(val) => onChangeInfo('name', val)} outline simple required minLength={1} />
        )}
        {!edit && <Text>{sprintDailyMeeting.name}</Text>}
      </BlockRow>
      <BlockRow>
        <div className="date-info">
          <div>
            <Label minWidth={labelMinWidth}>{t('시간')}</Label>
            {edit && (
              <DateRange
                country={user.country}
                language={user.language}
                startDate={sprintDailyMeeting.startTime}
                endDate={sprintDailyMeeting.endTime}
                showTimeSelectOnly
                startDateKey="startTime"
                endDateKey="endTime"
                onChange={(key, value) => {
                  onChangeInfo(key, value);
                }}
              />
            )}
          </div>
          <div>
            {!edit && <DateRangeText showTimeOnly country={user.country} startDate={sprintDailyMeeting.startTime} endDate={sprintDailyMeeting.endTime} />}
            {edit && (
              <div className="day-of-weeks">
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
                {[t('월'), t('화'), t('수'), t('목'), t('금'), t('토'), t('일')].map((day, jnx) => {
                  return (
                    <Button
                      key={jnx}
                      className={sprintDailyMeeting.days[jnx] === '1' ? 'selected' : ''}
                      size="md"
                      color="white"
                      outline
                      rounded
                      onClick={() => {
                        onChangeMeetingDays(jnx, sprintDailyMeeting.days[jnx] === '1' ? '0' : '1');
                      }}
                    >
                      {day}
                    </Button>
                  );
                })}
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
                <Button
                  size="sm"
                  className={sprintDailyMeeting.onHoliday ? 'selected' : ''}
                  color="white"
                  outline
                  onClick={() => {
                    onChangeInfo('onHoliday', !sprintDailyMeeting.onHoliday);
                  }}
                >
                  휴일 제외
                </Button>
              </div>
            )}
            {!edit && (
              <div className="day-of-weeks">
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
                {[t('월'), t('화'), t('수'), t('목'), t('금'), t('토'), t('일')]
                  .filter((d, inx) => {
                    return sprintDailyMeeting.days[inx] === '1';
                  })
                  .map((day, jnx) => {
                    return (
                      <span key={jnx} className="day-text">
                        <span>{day}</span>
                      </span>
                    );
                  })}
                {sprintDailyMeeting.onHoliday && (
                  <>
                    <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
                    <span className="holiday-text">
                      <span>휴일 제외</span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </BlockRow>
      <BlockRow>
        <Label minWidth={labelMinWidth}>{t('스크럼 양식 사용')}</Label>
        {edit && (
          <CheckBox
            size="md"
            type="checkbox"
            value={sprintDailyMeeting.useQuestion}
            onChange={(val) => onChangeInfo('useQuestion', val)}
            label={t('정해진 스크럼 미팅 양식을 사용합니다.')}
          />
        )}
        {!edit && <Text>{sprintDailyMeeting.useQuestion ? 'Y' : 'N'}</Text>}
      </BlockRow>
      {sprintDailyMeeting.useQuestion && (
        <BlockRow>
          <Label className="align-self-baseline" minWidth={labelMinWidth}>
            {t('스크럼 질문')}
          </Label>
          <div className="flex-grow-1">
            {sprintDailyMeeting.sprintDailyMeetingQuestions.map((sprintDailyMeetingQuestion, jnx) => {
              return (
                <div key={jnx} className="question-item">
                  {edit && (
                    <>
                      <div className="dir-button up">
                        <Button
                          size="sm"
                          color="white"
                          outline
                          rounded
                          disabled={jnx < 1}
                          onClick={() => {
                            onChangeQuestionOrder(jnx, 'up');
                          }}
                        >
                          <i className="fas fa-arrow-up" />
                        </Button>
                      </div>
                      <div className="dir-button down">
                        <Button
                          size="sm"
                          color="white"
                          outline
                          rounded
                          disabled={sprintDailyMeeting.sprintDailyMeetingQuestions.length - 2 < jnx}
                          onClick={() => {
                            onChangeQuestionOrder(jnx, 'down');
                          }}
                        >
                          <i className="fas fa-arrow-down" />
                        </Button>
                      </div>
                    </>
                  )}
                  <div className="question">
                    {edit && (
                      <Input
                        type="text"
                        size="md"
                        value={sprintDailyMeetingQuestion.question}
                        onChange={(val) => onChangeQuestion(jnx, 'question', val)}
                        outline
                        simple
                        required
                        minLength={1}
                      />
                    )}
                    {!edit && <Text>{sprintDailyMeetingQuestion.question}</Text>}
                  </div>
                  {edit && (
                    <div className="dir-button delete">
                      <Button
                        size="sm"
                        color="warning"
                        outline
                        rounded
                        onClick={() => {
                          onChangeQuestionOrder(jnx, 'remove');
                        }}
                      >
                        <i className="fas fa-times" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {edit && (
              <div className="add-button">
                <Button
                  size="sm"
                  color="white"
                  outline
                  rounded
                  onClick={() => {
                    onChangeQuestionOrder(null, 'add');
                  }}
                >
                  <i className="fas fa-plus" />
                </Button>
              </div>
            )}
          </div>
        </BlockRow>
      )}
    </div>
  );
};

export default withTranslation()(withRouter(DailyScrumMeeting));

DailyScrumMeeting.defaultProps = {
  className: '',
  edit: false,
};

DailyScrumMeeting.propTypes = {
  className: PropTypes.string,
  edit: PropTypes.bool,
  t: PropTypes.func,
  no: PropTypes.number,
  onRemove: PropTypes.func,
  sprintDailyMeeting: PropTypes.shape({
    days: PropTypes.string,
    endTime: PropTypes.number,
    id: PropTypes.number,
    name: PropTypes.string,
    onHoliday: PropTypes.bool,
    sprintDailyMeetingQuestions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        question: PropTypes.string,
        sortOrder: PropTypes.number,
      }),
    ),
    startTime: PropTypes.number,
    useQuestion: PropTypes.bool,
  }),
  onChangeInfo: PropTypes.func,
  onChangeMeetingDays: PropTypes.func,
  onChangeQuestionOrder: PropTypes.func,
  onChangeQuestion: PropTypes.func,
  user: UserPropTypes,
};
