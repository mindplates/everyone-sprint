import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { BlockTitle, MeetingTimeLine, PageContent, PageTitle, SocketClient } from '@/components';
import { UserPropTypes } from '@/proptypes';
import request from '@/utils/request';
import dateUtil from '@/utils/dateUtil';
import './Home.scss';

const Home = ({ t, user }) => {
  const socket = useRef(null);
  const today = dateUtil.getToday();
  const [meetings, setMeetings] = useState(null);

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
                <MeetingTimeLine user={user} meetings={meetings} date={today} />
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

export default connect(mapStateToProps, undefined)(withTranslation()(Home));

Home.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
};
