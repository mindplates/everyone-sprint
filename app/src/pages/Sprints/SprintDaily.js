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
  Selector,
  Tabs,
  TextArea,
  UserImage,
  withLogin, withSpace,
} from '@/components';
import request from '@/utils/request';
import { UserPropTypes } from '@/proptypes';
import sprintUtil from '@/pages/Sprints/sprintUtil';
import dateUtil from '@/utils/dateUtil';
import DateCustomInput from '@/components/DateRange/DateCustomInput/DateCustomInput';
import { DATE_FORMATS, MESSAGE_CATEGORY } from '@/constants/constants';
import RadioButton from '@/components/RadioButton/RadioButton';
import dialog from '@/utils/dialog';
import './SprintCommon.scss';
import './SprintDaily.scss';
import commonUtil from '@/utils/commonUtil';

const SprintDaily = ({
  t,
  user,
  match: {
    params: { id: idString, date },
  },
}) => {
  const viewTypes = [
    {
      key: 'my',
      value: t('MY'),
    },
    {
      key: 'team',
      value: t('ALL'),
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

  const [viewType, setViewType] = useState('team');
  const [subViewType, setSubViewType] = useState('list');
  const [currentSubViewIndex, setCurrentSubViewIndex] = useState(0);
  const [meetingListCollapsed, setMeetingListCollapsed] = useState(false);

  const [sprint, setSprint] = useState(null);

  const [meetings, setMeetings] = useState([]);
  const [dailyAnswers, setDailyAnswers] = useState([]);

  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [selectedDailyMeetingId, setSelectedDailyMeetingId] = useState(null);

  // 범위 데이터 조회 시
  const day = dateUtil.getTimeAtStartOfDay(date || new Date().toLocaleDateString().substring(0, 11));
  const startDate = new Date(day);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  // 날짜 데이터 조회 시
  const localDayString = dateUtil.getLocalDateISOString(day);

  const selectMeeting = (meetingId) => {
    const meeting = meetings.find((d) => d.id === meetingId);
    setSelectedMeetingId(meetingId);

    const scrumMeetingPlan = sprint?.scrumMeetingPlans.find((d) => d.id === meeting.scrumMeetingPlanId);
    setSelectedDailyMeetingId(scrumMeetingPlan?.id);

    const nextAnswers = scrumMeetingPlan?.scrumMeetingQuestions.map((d) => {
      const currentAnswer = dailyAnswers.find((answer) => answer.scrumMeetingQuestionId === d.id && answer.user.id === user.id);

      if (currentAnswer) {
        return {
          ...currentAnswer,
        };
      }
      return {
        sprintId: id,
        scrumMeetingQuestionId: d.id,
        answer: '',
        date: localDayString,
      };
    });

    setSelectedAnswers(nextAnswers);
  };

  const getSprint = (sprintId) => {
    request.get(
      `/api/{spaceCode}/sprints/${sprintId}`,
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
      `/api/{spaceCode}/sprints/${id}/daily?start=${start.toISOString()}&end=${end.toISOString()}&date=${dayString}`,
      null,
      (data) => {
        setMeetings(data.scrumMeetings);
        setDailyAnswers(data.scrumMeetingAnswers);
      },
      null,
      t('스프린트 보드에 필요한 정보를 모으고 있습니다.'),
    );
  };

  const saveDailyMeetingAnswers = () => {
    request.post(
      `/api/{spaceCode}/sprints/${id}/answers?date=${localDayString}`,
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
      getBoardInfo(startDate, endDate, localDayString);
    }
  }, [id, day]);

  useEffect(() => {
    if (meetings.length > 0) {
      const meetingId = meetings.find((d) => d.scrumMeetingPlanId === selectedDailyMeetingId)?.id;

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
    commonUtil.move(`/sprints/${id}/daily/${nextData.toLocaleDateString('sv').substring(0, 10)}`);
  };

  const onChangeAnswer = (questionId, value) => {
    const nextAnswers = selectedAnswers.slice(0);
    const answer = nextAnswers.find((d) => d.scrumMeetingQuestionId === questionId);
    answer.answer = value;
    setSelectedAnswers(nextAnswers);
  };

  const getLastMeetingAnswer = () => {
    const meeting = meetings.find((d) => d.id === selectedMeetingId);
    const { scrumMeetingPlanId } = meeting;

    request.get(
      `/api/{spaceCode}/sprints/${id}/meetings/${scrumMeetingPlanId}/answers/latest?date=${localDayString}`,
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
          const info = nextSelectedAnswers.find((d) => d.scrumMeetingQuestionId === answer.scrumMeetingQuestionId && d.sprintId === answer.sprintId);
          info.answer = answer.answer;
        });

        setSelectedAnswers(nextSelectedAnswers);
      },
      null,
      t('지난 마지막 스크럼 정보를 불러오고 있습니다.'),
    );
  };

  const dailyMeetingList = sprint?.scrumMeetingPlans
    .find((d) => d.id === meetings.find((meeting) => meeting.id === selectedMeetingId)?.scrumMeetingPlanId)
    ?.scrumMeetingQuestions?.sort((a, b) => {
      return a.sortOrder - b.sortOrder;
    });

  return (
    <Page className="sprint-daily-wrapper sprint-common">
      <PageTitle
        breadcrumbs={[
          {
            link: commonUtil.getSpaceUrl('/'),
            name: t('TOP'),
          },
          {
            link: commonUtil.getSpaceUrl('/sprints'),
            name: t('스프린트 목록'),
          },
          {
            link: commonUtil.getSpaceUrl(`/sprints/${sprint?.id}`),
            name: sprint?.name,
          },
          {
            link: commonUtil.getSpaceUrl(`/sprints/${sprint?.id}/daily`),
            name: t('데일리'),
            current: true,
          },
        ]}
      >
        <div className="title">
          <span>{sprint?.name}</span>
          <span className="spring-title-tag">DAILY</span>
        </div>
      </PageTitle>
      {sprint && (
        <PageContent className="page-content" info>
          <div className="board-content">
            <div className="day-content">
              <div className={`daily-meeting-list ${meetingListCollapsed ? 'collapsed' : ''}`}>
                {meetingListCollapsed && (
                  <Button
                    className="collapse-button"
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
                      <div className="break" />
                      <div className="meeting-list-selector">
                        <Selector
                          outline
                          size="md"
                          items={meetings.map((d) => {
                            return {
                              key: d.id,
                              value: d.name,
                            };
                          })}
                          value={selectedMeetingId}
                          onChange={(val) => {
                            if (selectedMeetingId !== val) {
                              selectMeeting(val);
                            }
                          }}
                          minWidth="100px"
                        />
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
                                          <ReactTimeAgo locale={user.language} date={dateUtil.getTime(d.startDate)} />
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
                                        size="sm"
                                        color="white"
                                        rounded
                                        outline
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          commonUtil.move(`/meetings/${d.id}/edit`);
                                        }}
                                      >
                                        <i className="fas fa-cog" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        color="white"
                                        rounded
                                        outline
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          commonUtil.move(`/meets/${d.code}`);
                                        }}
                                      >
                                        <i className="fas fa-arrow-right" />
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
                      width="36px"
                      height="36px"
                      border
                      content={
                        <div className={`sub-view-type d-none ${viewType === 'team' ? '' : 'd-none'}`}>
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
                              const currentAnswer = selectedAnswers.find((answer) => answer.scrumMeetingQuestionId === d.id)?.answer;
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
                                    <div className="user-image">
                                      <UserImage border rounded size="30px" iconFontSize="15px" imageType={u.imageType} imageData={u.imageData} />
                                    </div>
                                    <div className="user-name">
                                      <span>
                                        <span className="user-alias">{u.alias}</span>
                                        {u.name && <span className="name-text">{u.name}</span>}
                                      </span>
                                    </div>
                                  </div>
                                  {(!dailyMeetingList || dailyMeetingList.length < 1) && (
                                    <>
                                      <Placeholder className="mb-3" height="110px" />
                                      <Placeholder height="106px" />
                                    </>
                                  )}
                                  <div className="question-answer-content">
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
                                                        dailyAnswers.find((answer) => answer.scrumMeetingQuestionId === d.id && answer.user.id === u.userId)
                                                          ?.answer
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
                                                        dailyAnswers.find((answer) => answer.scrumMeetingQuestionId === d.id && answer.user.id === u.userId)
                                                          ?.answer
                                                      }
                                                    </div>
                                                  </div>
                                                </li>
                                              );
                                            })}
                                        </ul>
                                      </div>
                                    )}
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
                                                      dailyAnswers.find((answer) => answer.scrumMeetingQuestionId === d.id && answer.user.id === u.userId)
                                                        ?.answer
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
                                                        dailyAnswers.find((answer) => answer.scrumMeetingQuestionId === d.id && answer.user.id === u.userId)
                                                          ?.answer
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

export default compose(withLogin, withSpace, connect(mapStateToProps, undefined), withRouter, withTranslation())(SprintDaily);

SprintDaily.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,

  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.string,
    }),
  }),
};
