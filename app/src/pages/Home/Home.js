import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { BlockTitle, PageContent, PageTitle, TimeLineItem } from '@/components';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import request from '@/utils/request';
import dateUtil from '@/utils/dateUtil';
import { DATE_FORMATS_TYPES } from '@/constants/constants';
import './Home.scss';

const times = [];
const today = dateUtil.getToday();
const startTime = 8;
const endTime = 24;
const timeSpan = 2;
for (let i = startTime; i < endTime; i += timeSpan) {
  times.push(today.setHours(i));
}
const now = Date.now();

const Home = ({ t, user, history }) => {
  const [meetings, setMeetings] = useState(null);

  const getMeetings = () => {
    request.get(
      '/api/meetings',
      { date: dateUtil.getToday() },
      (list) => {
        setMeetings(list.sort((a, b) => dateUtil.getTime(a.startDate) - dateUtil.getTime(b.startDate)));
      },
      null,
      t('사용자의 미팅 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    getMeetings();
  }, []);

  /*
  * code: "1iuvibhrdiek3"
endDate: "2022-02-09T03:00:00"
id: 417
name: "데일리 스크럼"
sprintDailyMeetingId: 46
sprintDailyMeetingQuestions: (3) [{…}, {…}, {…}]
sprintId: 68
sprintName: "모두의 스프린트 2차"
startDate: "2022-02-09T02:00:00"
* */

  let meetingCount = 0;

  return (
    <div className="home-wrapper g-content">
      <PageTitle className="d-none">{t('HOME')}</PageTitle>
      <PageContent border padding="0">
        {user?.id && (
          <div className="home-content">
            <div className="timeline-content">
              <BlockTitle className="mb-3">오늘의 미팅</BlockTitle>
              <div className="timeline-meeting">
                <div className="timeline">
                  <div>
                    <ul>
                      {times.map((d, inx) => {
                        let current = false;
                        if (inx < times.length - 1) {
                          if (d < now && now < times[inx + 1]) {
                            current = true;
                          }
                        } else if (now > d) {
                          current = true;
                        }
                        return (
                          <li key={inx}>
                            <div className="time">{dateUtil.getDateString(d, DATE_FORMATS_TYPES.hours)}</div>
                            <div>{current && <div className="current-time" />}</div>
                            {meetings
                              ?.filter((meeting) => {
                                const startDate = dateUtil.getLocalDate(meeting.startDate);

                                if (inx < times.length - 1) {
                                  if (d <= startDate && startDate < times[inx + 1]) {
                                    return true;
                                  }
                                } else if (startDate >= d) {
                                  return true;
                                }

                                return false;
                              })
                              .map((meeting) => {
                                meetingCount += 1;
                                return (
                                  <div
                                    className="meeting-item"
                                    key={meeting.id}
                                    style={{
                                      left: `${60 + 10 * meetingCount}px`,
                                      top: `${(dateUtil.getSpanHours(d, dateUtil.getLocalDate(meeting.startDate), true) / timeSpan) * 100}%`,
                                    }}
                                  >
                                    <TimeLineItem
                                      meeting={meeting}
                                      count={meetingCount}
                                      zIndex={meetingCount}
                                      timeSpan={timeSpan}
                                      baseTime={d}
                                      user={user}
                                      onClick={() => {
                                        history.push(`/conferences/${meeting.code}`);
                                      }}
                                    />
                                  </div>
                                );
                              })}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="other-content">
              <div />
            </div>
          </div>
        )}
      </PageContent>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(Home)));

Home.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
};
