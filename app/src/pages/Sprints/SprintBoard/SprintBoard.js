import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ReactTimeAgo from 'react-time-ago';
import PropTypes from 'prop-types';
import {
  Block,
  BlockTitle,
  Button,
  DatePicker,
  Liner,
  Page,
  PageContent,
  PageTitle,
  Placeholder,
  Tabs,
  TextArea,
  UserImage,
  withLogin,
} from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import sprintUtil from '@/pages/Sprints/sprintUtil';
import dateUtil from '@/utils/dateUtil';
import DateCustomInput from '@/components/DateRange/DateCustomInput/DateCustomInput';
import { DATE_FORMATS, MESSAGE_CATEGORY } from '@/constants/constants';
import RadioButton from '@/components/RadioButton/RadioButton';
import dialog from '@/utils/dialog';
import SprintBoardSummary from './SprintBoardSummary';
import '../SprintCommon.scss';
import './SprintBoard.scss';

const SprintBoard = ({
  t,
  history,
  user,
  match: {
    params: { id: idString, tab: tabString, date },
  },
}) => {
  const tabs = [
    {
      key: 'daily',
      value: t('데일리'),
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

  const id = Number(idString);

  const [tab, setTab] = useState(tabString);
  const [viewType, setViewType] = useState('team');
  const [subViewType, setSubViewType] = useState('list');
  const [currentSubViewIndex, setCurrentSubViewIndex] = useState(0);
  const [meetingListCollapsed, setMeetingListCollapsed] = useState(false);

  const [sprint, setSprint] = useState(null);
  const [sprintSummary, setSprintSummary] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [dailyAnswers, setDailyAnswers] = useState([]);

  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [selectedDailyMeetingId, setSelectedDailyMeetingId] = useState(null);

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
    setSelectedDailyMeetingId(sprintDailyMeeting?.id);

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
      t('스프린트 보드에 필요한 정보를 모으고 있습니다.'),
    );
  };

  const getSprintSummary = () => {
    request.get(
      `/api/sprints/${id}/summary`,
      null,
      (data) => {
        setSprintSummary(data);
      },
      null,
      t('스프린트에 관련된 모든 정보를 가져오고 있습니다.'),
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
      // setSelectedMeetingId(null);
      if (tab === tabs[0].key) {
        getBoardInfo(startDate, endDate, localDayString);
      }

      if (tab === tabs[1].key) {
        getSprintSummary();
      }
    }
  }, [id, day, tab]);

  useEffect(() => {
    if (meetings.length > 0) {
      const meetingId = meetings.find((d) => d.sprintDailyMeetingId === selectedDailyMeetingId)?.id;

      if (meetingId) {
        setTimeout(() => {
          selectMeeting(meetingId);
        }, 500);
      } else {
        setTimeout(() => {
          selectMeeting(meetings[0].id);
        }, 500);
      }
    }
  }, [meetings, sprint, dailyAnswers]);

  const now = new Date();

  const moveDate = (nextData) => {
    history.push(`/sprints/${id}/board/daily/${nextData.toLocaleDateString('sv').substring(0, 10)}`);
  };

  const moveTab = (nextTab) => {
    setTab(nextTab);
    history.push(`/sprints/${id}/board/${nextTab}`);
  };

  const onChangeAnswer = (questionId, value) => {
    const nextAnswers = selectedAnswers.slice(0);
    const answer = nextAnswers.find((d) => d.sprintDailyMeetingQuestionId === questionId);
    answer.answer = value;
    setSelectedAnswers(nextAnswers);
  };

  const getLastMeetingAnswer = () => {
    const meeting = meetings.find((d) => d.id === selectedMeetingId);
    const { sprintDailyMeetingId } = meeting;

    request.get(
      `/api/sprints/${id}/meetings/${sprintDailyMeetingId}/answers/latest?date=${localDayString}`,
      null,
      (answers) => {
        if (answers.length < 1) {
          dialog.setMessage(
            MESSAGE_CATEGORY.INFO,
            t('데이터 없음'),
            `'${meeting.name}'의 ${dateUtil.getDateString(day, 'days')} 이전에 작성된 정보가 없습니다.`,
          );
          return;
        }

        const nextSelectedAnswers = selectedAnswers.slice(0);
        answers.forEach((answer) => {
          const info = nextSelectedAnswers.find(
            (d) => d.sprintDailyMeetingQuestionId === answer.sprintDailyMeetingQuestionId && d.sprintId === answer.sprintId,
          );
          info.answer = answer.answer;
        });

        setSelectedAnswers(nextSelectedAnswers);
      },
      null,
      t('지난 마지막 스크럼 정보를 불러오고 있습니다.'),
    );
  };

  const dailyMeetingList = sprint?.sprintDailyMeetings
    .find((d) => d.id === meetings.find((meeting) => meeting.id === selectedMeetingId)?.sprintDailyMeetingId)
    ?.sprintDailyMeetingQuestions?.sort((a, b) => {
      return a.sortOrder - b.sortOrder;
    });

  return (
    <Page className="sprint-board-wrapper sprint-common">
      <PageTitle
        className="sprint-title-with-tag"
        tabs={tabs}
        tab={tab}
        onChangeTab={(value) => {
          moveTab(value);
        }}
      >
        <span>{sprint?.name}</span>
        <span className="spring-title-tag">BOARD</span>
      </PageTitle>
      {sprint && (
        <PageContent className="page-content">
          <div className="board-content">
            {tab === 'daily' && (
              <div className="day-content">
                <div className={`daily-meeting-list ${meetingListCollapsed ? 'collapsed' : ''}`}>
                  {meetingListCollapsed && (
                    <Button
                      size="sm"
                      color="white"
                      outline
                      rounded
                      onClick={() => {
                        setMeetingListCollapsed(!meetingListCollapsed);
                      }}
                    >
                      <i className="fas fa-plus" />
                    </Button>
                  )}
                  {!meetingListCollapsed && (
                    <Block className="pt-0 meeting-content">
                      <BlockTitle className="meeting-list-title pb-0 mb-2" liner={false}>
                        {t('스크럼 미팅')}
                        <Button
                          className="collapsed-button"
                          size="sm"
                          color="white"
                          outline
                          rounded
                          onClick={() => {
                            setMeetingListCollapsed(!meetingListCollapsed);
                          }}
                        >
                          <i className="fas fa-minus" />
                        </Button>
                      </BlockTitle>
                      <div className="sprint-board-day-selector">
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
                            dateFormat={DATE_FORMATS[dateUtil.getUserLocale()].yearsDays.picker}
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
                          {meetings.length < 1 && (
                            <div className="empty-content h-100">
                              <span>{t('스크럼 미팅이 없습니다')}</span>
                            </div>
                          )}
                          {meetings.length > 0 && (
                            <ul className="g-no-select">
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
                                    <div className="line" />
                                    <div className="bar" />
                                    <div className="meeting-list-item">
                                      <div className="list-content">
                                        <div className="name">
                                          <span className={`time-ago ${dateUtil.getTime(d.startDate) > now.getTime() ? 'future' : 'past'}`}>
                                            <ReactTimeAgo locale={user.language || 'ko'} date={dateUtil.getTime(d.startDate)} />
                                          </span>
                                          <span className="text">{d.name}</span>
                                        </div>
                                        <div className="date">
                                          <div>{dateUtil.getDateString(d.startDate)}</div>
                                          <Liner className="dash" width="10px" height="1px" display="inline-block" color="black" margin="0 0.5rem 0 0.5rem" />
                                          <div>{dateUtil.getDateString(d.endDate, 'hoursMinutes')}</div>
                                        </div>
                                      </div>
                                      <div className="list-button">
                                        <Button
                                          size="md"
                                          color="white"
                                          rounded
                                          outline
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                        >
                                          <i className="fas fa-ellipsis-h" />
                                        </Button>
                                        <Button
                                          size="md"
                                          color="white"
                                          rounded
                                          outline
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                        >
                                          <i className="fas fa-podcast" />
                                        </Button>
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    </Block>
                  )}
                </div>
                <div className={`team-daily-meeting-list ${meetingListCollapsed ? 'collapsed' : ''}`}>
                  {meetings.length < 1 && (
                    <div className={`team-daily-meeting-list-content ${meetingListCollapsed ? 'collapsed' : ''}`}>
                      <div className="empty-content h-100 w-100">
                        <span>{t('선택된 스크림 미팅이 없습니다.')}</span>
                      </div>
                    </div>
                  )}
                  {meetings.length > 0 && (
                    <div className={`team-daily-meeting-list-content ${meetingListCollapsed ? 'collapsed' : ''}`}>
                      <Tabs
                        className="view-type-tabs"
                        tab={viewType}
                        tabs={viewTypes}
                        onChange={setViewType}
                        rounded
                        width="45px"
                        height="45px"
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
                          {(!dailyMeetingList || dailyMeetingList.length < 1) && <Placeholder height="376px" />}
                          {dailyMeetingList && dailyMeetingList.length > 0 && (
                            <ul>
                              {dailyMeetingList.map((d, inx) => {
                                const currentAnswer = selectedAnswers.find((answer) => answer.sprintDailyMeetingQuestionId === d.id)?.answer;
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
                                            {inx < 1 && dailyMeetingList.length > 1 && (
                                              <Button
                                                size="sm"
                                                color="white"
                                                outline
                                                rounded
                                                onClick={() => {
                                                  onChangeAnswer(dailyMeetingList[1].id, currentAnswer);
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
                                                  onChangeAnswer(dailyMeetingList[inx - 1].id, currentAnswer);
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
                          <div>
                            <Button size="md" color="white" outline onClick={getLastMeetingAnswer}>
                              <i className="fas fa-retweet" /> 지난 마지막 스크럼 정보 불러오기
                            </Button>
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
                                    <div className="user-info">
                                      <div className="bullet">
                                        <span>
                                          <i className="fas fa-child" />
                                        </span>
                                      </div>
                                      <div className="user-image">
                                        <UserImage border rounded size="30px" iconFontSize="15px" imageType={user.imageType} imageData={user.imageData} />
                                      </div>
                                      <div className="user-name">
                                        <span>
                                          <span className="user-alias">{u.alias}</span>
                                          {user.name && <span className="name-text">{user.name}</span>}
                                        </span>
                                      </div>
                                    </div>
                                    {(!dailyMeetingList || dailyMeetingList.length < 1) && (
                                      <>
                                        <Placeholder className="mb-3" height="110px" />
                                        <Placeholder height="106px" />
                                      </>
                                    )}
                                    {dailyMeetingList && dailyMeetingList.length > 0 && (
                                      <div className="question-answer-info question-answer">
                                        <ul>
                                          {dailyMeetingList &&
                                            dailyMeetingList.slice(0, 2).map((d) => {
                                              return (
                                                <li key={d.id}>
                                                  <div className="liner" />
                                                  <div className="content">
                                                    <div className="question">
                                                      <span className="icon">
                                                        <span>Q</span>
                                                      </span>
                                                      <span className="text">{d.question}</span>
                                                    </div>
                                                    <div className="answer">
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
                                    )}

                                    {dailyMeetingList && dailyMeetingList.length > 2 && (
                                      <div className="question-answer-info others">
                                        <ul>
                                          {dailyMeetingList &&
                                            dailyMeetingList.slice(2).map((d) => {
                                              return (
                                                <li key={d.id}>
                                                  <div className="liner" />
                                                  <div className="content">
                                                    <div className="question">
                                                      <span className="icon">
                                                        <span>Q</span>
                                                      </span>
                                                      <span className="text">{d.question}</span>
                                                    </div>
                                                    <div className="answer">
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
                                    )}
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
                                          {dailyMeetingList &&
                                            dailyMeetingList.map((d) => {
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
                          <div className="current-meeting-index">
                            <span>
                              {currentSubViewIndex + 1} / {sprint.users.length}
                            </span>
                          </div>
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
                                            {dailyMeetingList &&
                                              dailyMeetingList.map((d) => {
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
                  )}
                </div>
              </div>
            )}
            {tab === 'summary' && <SprintBoardSummary sprint={sprint} sprintSummary={sprintSummary} />}
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

export default compose(withLogin, connect(mapStateToProps, undefined), withRouter, withTranslation())(SprintBoard);

SprintBoard.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      tab: PropTypes.string,
      id: PropTypes.string,
      date: PropTypes.string,
    }),
  }),
};
