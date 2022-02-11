import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withResizeDetector } from 'react-resize-detector';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { BlockTitle, PageContent, PageTitle, SocketClient, TimeLineItem } from '@/components';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import request from '@/utils/request';
import dateUtil from '@/utils/dateUtil';
import { DATE_FORMATS_TYPES } from '@/constants/constants';
import './Home.scss';

const today = dateUtil.getToday();

const now = Date.now();

const Home = ({ t, user, history, height }) => {
  const timeSpan = useRef(2);

  const getTimes = useCallback((startTime, endTime) => {
    const defaultTimes = [];
    for (let i = startTime; i < endTime; i += timeSpan.current) {
      defaultTimes.push(today.setHours(i));
    }

    return defaultTimes;
  }, []);

  const [meetings, setMeetings] = useState(null);
  const [times, setTimes] = useState(getTimes(8, 24));
  const debounceSetTimes = useCallback(
    _.debounce((startTime, endTime) => {
      setTimes(getTimes(startTime, endTime));
    }, 500),
    [],
  );

  const content = useRef(null);
  const socket = useRef(null);

  const getMeetings = () => {
    request.get(
      '/api/meetings/today',
      { date: today },
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

  useEffect(() => {
    if (height > 1000) {
      timeSpan.current = 1;
      debounceSetTimes(0, 24);
    } else {
      timeSpan.current = 2;
      debounceSetTimes(8, 24);
    }
  }, [height]);

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
          <div className="home-content" ref={content}>
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
                        } else if (now > d && now < d + timeSpan * 1000 * 60 * 60) {
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
                                } else if (d + timeSpan.current * 1000 * 60 * 60 > startDate && startDate >= d) {
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
                                      top: `${(dateUtil.getSpanHours(d, dateUtil.getLocalDate(meeting.startDate), true) / timeSpan.current) * 100}%`,
                                    }}
                                  >
                                    <TimeLineItem
                                      meeting={meeting}
                                      count={meetingCount}
                                      zIndex={meetingCount}
                                      timeSpan={timeSpan.current}
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

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(withResizeDetector(Home))));

Home.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  height: PropTypes.number,
};
