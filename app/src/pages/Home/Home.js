import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { BlockTitle, PageContent, PageTitle, SocketClient, TimeLineItem } from '@/components';
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
  const socket = useRef(null);

  const getMeetings = () => {
    request.get(
      '/api/meetings/today',
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

  let meetingCount = 0;

  const onMessage = useCallback(
    (info) => {
      const {
        data: { type, data },
      } = info;

      switch (type) {
        case 'JOIN': {
          if (meetings) {
            const nextMeetings = meetings.slice(0);
            const targetMeeting = nextMeetings.find((meeting) => meeting.id === data.meetingId);
            if (targetMeeting) {
              targetMeeting.connectedUserCount += 1;
              setMeetings(nextMeetings);
            }
          }

          break;
        }

        case 'LEAVE': {
          if (meetings) {
            const nextMeetings = meetings.slice(0);
            const targetMeeting = nextMeetings.find((meeting) => meeting.id === data.meetingId);
            if (targetMeeting) {
              targetMeeting.connectedUserCount -= 1;
              if (targetMeeting.connectedUserCount < 0) {
                targetMeeting.connectedUserCount = 0;
              }
              setMeetings(nextMeetings);
            }
          }

          break;
        }

        default: {
          break;
        }
      }
    },
    [meetings],
  );

  return (
    <div className="home-wrapper g-content">
      <PageTitle className="d-none">{t('HOME')}</PageTitle>
      <SocketClient
        topics={['/sub/conferences/notify']}
        onMessage={onMessage}
        onConnect={() => {}}
        setRef={(client) => {
          socket.current = client;
        }}
      />
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
