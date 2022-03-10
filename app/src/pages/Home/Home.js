import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { BlockTitle, MeetingTimeLine, MySprintSummaryList, Page, PageContent, SocketClient, Tabs, withLogin } from '@/components';
import { UserPropTypes } from '@/proptypes';
import request from '@/utils/request';
import dateUtil from '@/utils/dateUtil';
import ScrumInfoEditorPopup from '@/pages/Meetings/Conference/ScrumInfoEditorPopup';
import './Home.scss';
import { DATE_FORMATS_TYPES } from '@/constants/constants';
import sprintUtil from '@/pages/Sprints/sprintUtil';

const Home = ({ t, user }) => {
  const tabs = [
    {
      key: 'meeting',
      value: t('오늘의 미팅'),
    },
    {
      key: 'sprint',
      value: t('오늘의 스프린트'),
    },
  ];

  const socket = useRef(null);
  const [tab, setTab] = useState('meeting');
  const [today] = useState(dateUtil.getToday());
  const [meetings, setMeetings] = useState(null);
  const [sprints, setSprints] = useState(null);
  const [scrumInfo, setScrumInfo] = useState({
    isOpen: false,
    sprintId: null,
    scrumMeetingPlans: [],
    currentSprintDailyMeetingId: null,
  });

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

  const getSprints = () => {
    // 클라이언트에서 서버로 날짜+시간 값을 보낼때는, Date.toISOString() 형식으로 문자열로 전송 (2022-02-13T15:00:00.000Z)
    // 클라이언트에서 서버로 날짜를 보낼때는 dateUtil.getLocalDateISOString()로 날짜 문자열로 전송 (2022-02-14)

    request.get(
      `/api/sprints?date=${dateUtil.getLocalDateISOString(today)}&startDate=${today.toISOString()}`,
      null,
      (list) => {
        setSprints(
          list.map((d) => {
            return sprintUtil.getSprint(d);
          }),
        );
      },
      null,
      t('사용자의 스프린트 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    if (user?.id) {
      getMeetings();
      getSprints();
    }
  }, [user]);

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

  const onChangeScrumInfo = (sprintId, isOpen) => {
    if (isOpen) {
      const todayString = dateUtil.getLocalDateISOString(Date.now());
      request.get(
        `/api/sprints/${sprintId}/scrums?date=${todayString}&startDate=${today.toISOString()}`,
        null,
        (scrumMeetingPlans) => {
          const nextScrumInfo = { ...scrumInfo };
          nextScrumInfo.isOpen = isOpen;
          nextScrumInfo.sprintId = sprintId;
          nextScrumInfo.scrumMeetingPlans = scrumMeetingPlans;
          if (nextScrumInfo.scrumMeetingPlans.length > 0) {
            nextScrumInfo.currentSprintDailyMeetingId = nextScrumInfo.scrumMeetingPlans[0].id;
          }

          setScrumInfo(nextScrumInfo);
        },
        null,
        t('사용자의 스프린트 목록을 모으고 있습니다.'),
      );
    } else {
      setScrumInfo({
        isOpen: false,
      });
    }
  };

  const onChangeCurrentSprintDailyMeetingId = (scrumMeetingPlanId) => {
    const nextScrumInfo = { ...scrumInfo };
    nextScrumInfo.currentSprintDailyMeetingId = scrumMeetingPlanId;
    setScrumInfo(nextScrumInfo);
  };

  return (
    <Page
      className="home-wrapper"
      breadcrumbs={[
        {
          link: '/',
          name: t('TOP'),
        },
        {
          link: '/home',
          name: t('HOME'),
          current: true,
        },
      ]}
    >
      <SocketClient
        topics={['/sub/conferences/notify']}
        onMessage={onMessage}
        onConnect={() => {}}
        setRef={(client) => {
          socket.current = client;
        }}
      />
      <PageContent className="home-page-content">
        <div className="home-layout">
          <Tabs
            className="tabs"
            tab={tab}
            tabs={tabs}
            onChange={setTab}
            border={false}
            cornered
            size="sm"
            content={<span className="today">{dateUtil.getDateString(today, DATE_FORMATS_TYPES.days)}</span>}
          />
          <div className={`home-content ${tab}`}>
            <div className="timeline-content">
              <BlockTitle className="content-title mb-3">{t('오늘의 미팅')}</BlockTitle>
              <div className="timeline-meeting">
                <MeetingTimeLine user={user} meetings={meetings} date={today} />
              </div>
            </div>
            <div className="my-sprints">
              <BlockTitle className="content-title mb-3">
                {t('오늘의 스프린트')}
                <span className="today">{dateUtil.getDateString(today, DATE_FORMATS_TYPES.days)}</span>
              </BlockTitle>
              <div className="my-sprints-content">
                <MySprintSummaryList
                  sprints={sprints}
                  onClickScrumInfo={(sprintId) => {
                    onChangeScrumInfo(sprintId, true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </PageContent>
      {scrumInfo.isOpen && (
        <ScrumInfoEditorPopup
          setOpen={() => {
            onChangeScrumInfo(null, false);
          }}
          scrumMeetingPlans={scrumInfo.scrumMeetingPlans}
          onChangeCurrentSprintDailyMeetingId={onChangeCurrentSprintDailyMeetingId}
          sprintId={scrumInfo.sprintId}
          date={dateUtil.getLocalDateISOString(Date.now())}
          scrumMeetingPlanId={scrumInfo.currentSprintDailyMeetingId}
          questions={scrumInfo.scrumMeetingPlans.find((d) => d.id === scrumInfo.currentSprintDailyMeetingId).scrumMeetingPlanQuestions}
          answers={scrumInfo.scrumMeetingPlans.find((d) => d.id === scrumInfo.currentSprintDailyMeetingId).scrumMeetingPlanAnswers}
          onSaveComplete={() => {
            getSprints();
            // this.sendToAll('SCRUM_INFO_CHANGED');
          }}
        />
      )}
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
    user: state.user,
  };
};

export default compose(connect(mapStateToProps, undefined), withRouter, withTranslation(), withLogin)(Home);

Home.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
};
