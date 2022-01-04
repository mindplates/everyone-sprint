import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';
import PropTypes from 'prop-types';
import {
  Block,
  BlockRow,
  BlockTitle,
  Button,
  DatePicker,
  DateRangeText,
  Label,
  Liner,
  Page,
  PageContent,
  PageTitle,
  Tabs,
  Text,
  TextArea,
  UserImage,
} from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import sprintUtil from '@/pages/Sprints/sprintUtil';
import dateUtil from '@/utils/dateUtil';
import DateCustomInput from '@/components/DateRange/DateCustomInput/DateCustomInput';
import { DATE_FORMATS } from '@/constants/constants';
import './SprintCommon.scss';
import './SprintBoard.scss';
import RadioButton from '@/components/RadioButton/RadioButton';

const labelMinWidth = '140px';

const SprintBoard = ({
  t,
  history,
  user,
  match: {
    params: { id, date },
  },
}) => {
  const tabs = [
    {
      key: 'today',
      value: t('오늘'),
    },
    {
      key: 'summary',
      value: t('요약'),
    },
  ];

  const viewTypes = [
    {
      key: 'my',
      value: t('MY'),
    },
    {
      key: 'team',
      value: t('TEAM'),
    },
  ];

  const subViewTypes = [
    {
      key: 'list',
      value: t('LIST'),
    },
    {
      key: 'grid',
      value: t('GRID'),
    },
    {
      key: 'card',
      value: t('CARD'),
    },
  ];

  const [tab, setTab] = useState('today');
  const [viewType, setViewType] = useState('team');
  const [subViewType, setSubViewType] = useState('list');
  const [currentSubViewIndex, setCurrentSubViewIndex] = useState(0);

  const [sprint, setSprint] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [dailyAnswers, setDailyAnswers] = useState([]);

  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  // 범위 데이터 조회 시
  const day = dateUtil.getTimeAtStartOfDay(date || new Date().toLocaleDateString().substring(0, 10));
  const startDate = new Date(day);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  // 날짜 데이터 조회 시
  const localDayString = dateUtil.getLocalDateISOString(day);

  const selectMeeting = (meetingId) => {
    const meeting = meetings.find((d) => d.id === meetingId);
    setSelectedMeetingId(meetingId);

    const sprintDailyMeeting = sprint?.sprintDailyMeetings.find((d) => d.id === meeting.sprintDailyMeetingId);

    const nextAnswers = sprintDailyMeeting?.sprintDailyMeetingQuestions.map((d) => {
      const currentAnswer = dailyAnswers.find((answer) => answer.sprintDailyMeetingQuestionId === d.id && answer.user.id === user.id);

      if (currentAnswer) {
        return {
          ...currentAnswer,
        };
      }
      return {
        sprintId: id,
        sprintDailyMeetingQuestionId: d.id,
        answer: '',
        date: localDayString,
      };
    });

    setSelectedAnswers(nextAnswers);
  };

  const getSprint = (sprintId) => {
    request.get(
      `/api/sprints/${sprintId}`,
      null,
      (data) => {
        setSprint(sprintUtil.getSprint(data));
      },
      null,
      t('스프린트 정보를 가져오고 있습니다.'),
    );
  };

  const getBoardInfo = (start, end, dayString) => {
    request.get(
      `/api/sprints/${id}/board?start=${start.toISOString()}&end=${end.toISOString()}&date=${dayString}`,
      null,
      (data) => {
        setMeetings(data.dailyMeetings);
        setDailyAnswers(data.sprintDailyMeetingAnswers);
      },
      null,
      t('스프린티 보드에 필요한 정보를 모으고 있습니다.'),
    );
  };

  const saveDailyMeetingAnswers = () => {
    request.post(
      `/api/sprints/${id}/answers?date=${localDayString}`,
      selectedAnswers,
      () => {
        getBoardInfo(startDate, endDate, localDayString);
      },
      null,
      t('입력하신 스크럼 정보를 저장하고 있습니다.'),
    );
  };

  useEffect(() => {
    getSprint(id);
  }, [id]);

  useEffect(() => {
    if (day) {
      setSelectedMeetingId(null);
      getBoardInfo(startDate, endDate, localDayString);
    }
  }, [id, day]);

  useEffect(() => {
    if (meetings.length > 0) {
      if (selectedMeetingId) {
        selectMeeting(selectedMeetingId);
      } else {
        selectMeeting(meetings[0].id);
      }
    }
  }, [meetings, sprint, dailyAnswers]);

  const now = new Date();

  const sprintSpan = dateUtil.getSpan(now.getTime(), sprint?.endDate);

  const moveDate = (nextData) => {
    history.push(`/sprints/${id}/board/${nextData.toLocaleDateString('sv').substring(0, 10)}`);
  };

  const onChangeAnswer = (questionId, value) => {
    const nextAnswers = selectedAnswers.slice(0);
    const answer = nextAnswers.find((d) => d.sprintDailyMeetingQuestionId === questionId);
    answer.answer = value;
    setSelectedAnswers(nextAnswers);
  };

  return (
    <Page className="sprint-board-wrapper sprint-common">
      <PageTitle className="sprint-title-with-tag">
        <span>{sprint?.name}</span>
        <span className="spring-title-tag">BOARD</span>
      </PageTitle>
      {sprint && (
        <PageContent className="page-content">
          <Tabs className="pt-1 pb-0 d-none" tab={tab} tabs={tabs} onChange={setTab} rounded size="45px" border />
          <div className="board-content">
            {tab === 'today' && (
              <div className="day-content">
                {meetings.length < 1 && (
                  <div className="empty-content">
                    <span>{t('스크럼 미팅이 없습니다')}</span>
                  </div>
                )}
                {meetings.length > 0 && (
                  <>
                    <div className="daily-meeting-list">
                      <Block className="pt-0 meeting-content">
                        <BlockTitle className="pb-0 mb-2" liner={false}>
                          {t('스크럼 미팅')}
                        </BlockTitle>
                        <div className="sprint-board-day-selector mb-2">
                          <div>
                            <Button
                              size="sm"
                              color="white"
                              outline
                              rounded
                              onClick={() => {
                                const prevDay = new Date(day);
                                prevDay.setDate(prevDay.getDate() - 1);
                                moveDate(prevDay);
                              }}
                            >
                              <i className="fas fa-angle-left" />
                            </Button>
                          </div>
                          <div className="ml-3">
                            <DatePicker
                              className="date-picker start-date-picker"
                              selected={day}
                              onChange={moveDate}
                              locale={user.language}
                              customInput={<DateCustomInput />}
                              dateFormat={DATE_FORMATS[dateUtil.getUserLocale()].days.picker}
                            />
                          </div>
                          <div>
                            <Button
                              className="ml-1"
                              size="sm"
                              color="white"
                              outline
                              rounded
                              onClick={() => {
                                const nextDay = new Date(day);
                                nextDay.setDate(nextDay.getDate() + 1);
                                moveDate(nextDay);
                              }}
                            >
                              <i className="fas fa-angle-right" />
                            </Button>
                          </div>
                        </div>
                        <div className="meeting-list-content">
                          <div>
                            <ul>
                              {meetings.map((d) => {
                                return (
                                  <li
                                    key={d.id}
                                    onClick={() => {
                                      if (selectedMeetingId !== d.id) {
                                        selectMeeting(d.id);
                                      }
                                    }}
                                    className={d.id === selectedMeetingId ? 'selected' : ''}
                                  >
                                    <div className="name">
                                      <span className={`time-ago ${dateUtil.getTime(d.startDate) > now.getTime() ? 'future' : 'past'}`}>
                                        <ReactTimeAgo locale={user.language || 'ko'} date={dateUtil.getTime(d.startDate)} />
                                      </span>
                                      <span className="text">{d.name}</span>
                                    </div>
                                    <div className="date">
                                      <div>{dateUtil.getDateString(d.startDate)}</div>
                                      <Liner className="dash" width="10px" height="1px" display="inline-block" color="black" margin="0 0.5rem 0 0.5rem" />
                                      <div>{dateUtil.getDateString(d.endDate, 'hours')}</div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </Block>
                    </div>
                    <div className="team-daily-meeting-list">
                      <div className="team-daily-meeting-list-content">
                        <Tabs
                          className="view-type-tabs"
                          tab={viewType}
                          tabs={viewTypes}
                          onChange={setViewType}
                          rounded
                          size="45px"
                          border
                          content={
                            <div className={`sub-view-type ${viewType === 'team' ? '' : 'd-none'}`}>
                              <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem 0 0" />
                              <div>
                                <RadioButton size="xs" items={subViewTypes} value={subViewType} onClick={setSubViewType} />
                              </div>
                            </div>
                          }
                        />
                        {viewType === 'my' && (
                          <div className="my-daily-meeting-form">
                            <ul>
                              {sprint.sprintDailyMeetings
                                .find((d) => d.id === meetings.find((meeting) => meeting.id === selectedMeetingId)?.sprintDailyMeetingId)
                                ?.sprintDailyMeetingQuestions?.sort((a, b) => {
                                  return a.sortOrder - b.sortOrder;
                                })
                                .map((d) => {
                                  return (
                                    <li key={d.id}>
                                      <div className="question">{d.question}</div>
                                      <div className="answer">
                                        <TextArea
                                          value={selectedAnswers.find((answer) => answer.sprintDailyMeetingQuestionId === d.id)?.answer}
                                          onChange={(value) => {
                                            onChangeAnswer(d.id, value);
                                          }}
                                          simple
                                        />
                                      </div>
                                    </li>
                                  );
                                })}
                            </ul>
                            <div>
                              <Button
                                size="md"
                                color="white"
                                outline
                                onClick={() => {
                                  saveDailyMeetingAnswers();
                                }}
                              >
                                <i className="fas fa-save" /> 저장
                              </Button>
                            </div>
                          </div>
                        )}
                        {viewType === 'team' && subViewType === 'list' && (
                          <div className="team-user-daily-meeting-content view-type-list">
                            <div>
                              <ul>
                                {sprint.users.map((u) => {
                                  return (
                                    <li key={u.userId}>
                                      <div>
                                        <div className="user-icon">
                                          <UserImage border rounded size="50px" iconFontSize="140%" imageType={user.imageType} imageData={user.imageData} />
                                        </div>
                                        <div className="user-meeting-content">
                                          <div className="user-name">
                                            <span>
                                              <span className="user-alias">{u.alias}</span>
                                              {user.name && <span className="name-text">{user.name}</span>}
                                            </span>
                                          </div>
                                          <div className="question-answer">
                                            <ul>
                                              {sprint.sprintDailyMeetings
                                                .find((d) => d.id === meetings.find((meeting) => meeting.id === selectedMeetingId)?.sprintDailyMeetingId)
                                                ?.sprintDailyMeetingQuestions?.sort((a, b) => {
                                                  return a.sortOrder - b.sortOrder;
                                                })
                                                .map((d) => {
                                                  return (
                                                    <li key={d.id}>
                                                      <div className="question">
                                                        <span className="icon">
                                                          <span>Q</span>
                                                        </span>
                                                        <span className="text">{d.question}</span>
                                                      </div>
                                                      <div className="answer">
                                                        <span className="icon">
                                                          <span>A</span>
                                                        </span>
                                                        <span className="text">
                                                          {
                                                            dailyAnswers.find(
                                                              (answer) => answer.sprintDailyMeetingQuestionId === d.id && answer.user.id === u.userId,
                                                            )?.answer
                                                          }
                                                        </span>
                                                      </div>
                                                    </li>
                                                  );
                                                })}
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        )}
                        {viewType === 'team' && subViewType === 'grid' && (
                          <div className="team-user-daily-meeting-content view-type-grid">
                            <div>
                              <ul>
                                {sprint.users.map((u) => {
                                  return (
                                    <li key={u.userId}>
                                      <div>
                                        <div className="user-name">
                                          <span>
                                            <span className="user-alias">{u.alias}</span>
                                            {user.name && <span className="name-text">-{user.name}</span>}
                                          </span>
                                        </div>
                                        <div className="question-answer">
                                          <ul>
                                            {sprint.sprintDailyMeetings
                                              .find((d) => d.id === meetings.find((meeting) => meeting.id === selectedMeetingId)?.sprintDailyMeetingId)
                                              ?.sprintDailyMeetingQuestions?.sort((a, b) => {
                                                return a.sortOrder - b.sortOrder;
                                              })
                                              .map((d) => {
                                                return (
                                                  <li key={d.id}>
                                                    <div className="question">
                                                      <span className="icon">
                                                        <span>Q</span>
                                                      </span>
                                                      <span className="text">{d.question}</span>
                                                    </div>
                                                    <div className="answer">
                                                      <div>
                                                        {
                                                          dailyAnswers.find(
                                                            (answer) => answer.sprintDailyMeetingQuestionId === d.id && answer.user.id === u.userId,
                                                          )?.answer
                                                        }
                                                      </div>
                                                    </div>
                                                  </li>
                                                );
                                              })}
                                          </ul>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        )}
                        {viewType === 'team' && subViewType === 'card' && (
                          <div className="team-user-daily-meeting-content view-type-card">
                            <div className="card-move-button left">
                              <Button
                                size="lg"
                                color="white"
                                outline
                                disabled={currentSubViewIndex < 1}
                                rounded
                                onClick={() => {
                                  if (currentSubViewIndex > 0) {
                                    setCurrentSubViewIndex(currentSubViewIndex - 1);
                                  }
                                }}
                              >
                                <i className="fas fa-angle-left" />
                              </Button>
                            </div>
                            <div className="card-content">
                              <div>
                                <ul>
                                  {sprint.users.map((u) => {
                                    return (
                                      <li
                                        key={u.userId}
                                        style={{
                                          right: `${currentSubViewIndex * 100}%`,
                                        }}
                                      >
                                        <div>
                                          <div className="user-icon">
                                            <UserImage border rounded size="50px" iconFontSize="140%" imageType={user.imageType} imageData={user.imageData} />
                                          </div>
                                          <div className="user-name">
                                            <span>
                                              <span className="user-alias">{u.alias}</span>
                                              {user.name && <span className="name-text">-{user.name}</span>}
                                            </span>
                                          </div>
                                          <div className="question-answer">
                                            <ul>
                                              {sprint.sprintDailyMeetings
                                                .find((d) => d.id === meetings.find((meeting) => meeting.id === selectedMeetingId)?.sprintDailyMeetingId)
                                                ?.sprintDailyMeetingQuestions?.sort((a, b) => {
                                                  return a.sortOrder - b.sortOrder;
                                                })
                                                .map((d) => {
                                                  return (
                                                    <li key={d.id}>
                                                      <div className="question">
                                                        <span className="icon">
                                                          <span>Q</span>
                                                        </span>
                                                        <span className="text">{d.question}</span>
                                                      </div>
                                                      <div className="answer">
                                                        <div>
                                                          {
                                                            dailyAnswers.find(
                                                              (answer) => answer.sprintDailyMeetingQuestionId === d.id && answer.user.id === u.userId,
                                                            )?.answer
                                                          }
                                                        </div>
                                                      </div>
                                                    </li>
                                                  );
                                                })}
                                            </ul>
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                            <div className="card-move-button right">
                              <Button
                                size="lg"
                                color="white"
                                outline
                                rounded
                                disabled={currentSubViewIndex >= sprint.users.length - 1}
                                onClick={() => {
                                  if (currentSubViewIndex < sprint.users.length - 1) {
                                    setCurrentSubViewIndex(currentSubViewIndex + 1);
                                  }
                                }}
                              >
                                <i className="fas fa-angle-right" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {tab === 'summary' && (
              <div className="summary-content">
                <Block className="">
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('남은 기간')}</Label>
                    <Text>
                      <span className="sprint-span ml-0">
                        <span>{`${sprintSpan.days}${t('일')}`}</span>
                        <span className="ml-2">{`${sprintSpan.hours}${t('시간')}`}</span>
                        <span className="ml-2">{t('후 종료')}</span>
                      </span>
                    </Text>
                    <DateRangeText className="ml-2" country={user.country} startDate={sprint.startDate} endDate={sprint.endDate} />
                  </BlockRow>
                </Block>
              </div>
            )}
          </div>
        </PageContent>
      )}
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(SprintBoard)));

SprintBoard.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.string,
    }),
  }),
};
