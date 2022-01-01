import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';
import PropTypes from 'prop-types';
import { Block, BlockRow, BlockTitle, Button, DatePicker, DateRangeText, Label, Liner, Page, PageContent, PageTitle, Tabs, Text } from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import sprintUtil from '@/pages/Sprints/sprintUtil';
import dateUtil from '@/utils/dateUtil';
import DateCustomInput from '@/components/DateRange/DateCustomInput/DateCustomInput';
import { DATE_FORMATS } from '@/constants/constants';
import './SprintCommon.scss';
import './SprintBoard.scss';

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

  const [sprint, setSprint] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [tab, setTab] = useState('today');

  const day = dateUtil.getTimeAtStartOfDay(date || new Date().toLocaleDateString().substring(0, 10));

  useEffect(() => {
    request.get(
      `/api/sprints/${id}`,
      null,
      (data) => {
        setSprint(sprintUtil.getSprint(data));
      },
      null,
      t('스프린트 정보를 가져오고 있습니다.'),
    );
  }, [id]);

  useEffect(() => {
    if (day) {
      const startDate = new Date(day);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      request.get(
        `/api/sprints/${id}/meetings?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        null,
        (data) => {
          setMeetings(data);
        },
        null,
        t('스프린트 정보를 가져오고 있습니다.'),
      );
    }
  }, [id, day]);

  const sprintSpan = dateUtil.getSpan(Date.now(), sprint?.endDate);

  const moveDate = (nextData) => {
    history.push(`/sprints/${id}/board/${nextData.toLocaleDateString('sv').substring(0, 10)}`);
  };

  const now = new Date();

  return (
    <Page className="sprint-board-wrapper sprint-common">
      <PageTitle className="sprint-title-with-tag">
        <span>{sprint?.name}</span>
        <span className="spring-title-tag">BOARD</span>
      </PageTitle>
      {sprint && (
        <PageContent className="page-content">
          <Tabs
            tab={tab}
            tabs={tabs}
            onChange={setTab}
            rounded
            size="45px"
            border
            content={
              <div className="sprint-board-day-selector">
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem 0 0" />
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
            }
          />
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
                    <div className="meetings">
                      <Block className="pt-0 meeting-content">
                        <BlockTitle className="mb-2 mb-sm-3">{t('스크럼 미팅')}</BlockTitle>
                        <BlockRow className="meeting-list-content">
                          <div>
                            <ul className="meeting-list">
                              {meetings.map((d) => {
                                return (
                                  <li key={d.id}>
                                    <div>
                                      <div className="name">
                                        <span className={`time-ago ${dateUtil.getTime(d.startDate) > now ? 'future' : 'past'}`}>
                                          <ReactTimeAgo locale={user.language || 'ko'} date={dateUtil.getTime(d.startDate)} />
                                        </span>
                                        <span className="text">{d.name}</span>
                                      </div>
                                      <div className="date">
                                        <div>{dateUtil.getDateString(d.startDate)}</div>
                                        <Liner className="dash" width="10px" height="1px" display="inline-block" color="black" margin="0 0.5rem 0 0.5rem" />
                                        <div>{dateUtil.getDateString(d.endDate, 'hours')}</div>
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </BlockRow>
                      </Block>
                    </div>
                    <div className="scrum-info">
                      <Block className="pt-0">
                        <BlockTitle className="mb-2 mb-sm-3">{t('스크럼 양식')}</BlockTitle>
                        <BlockRow>
                          <span className="d-none">1</span>
                        </BlockRow>
                      </Block>
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
