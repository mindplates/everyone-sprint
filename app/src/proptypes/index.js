import PropTypes from 'prop-types';

const HistoryPropTypes = PropTypes.shape({
  goBack: PropTypes.func,
  goForward: PropTypes.func,
  push: PropTypes.func,
});

const LocationPropTypes = PropTypes.shape({
  pathname: PropTypes.string,
  search: PropTypes.string,
});

const SettingPropTypes = PropTypes.shape({
  footer: PropTypes.bool,
  collapsed: PropTypes.bool,
});

const UserPropTypes = PropTypes.shape({
  id: PropTypes.number,
  alias: PropTypes.string,
  autoLogin: PropTypes.bool,
  language: PropTypes.string,
  country: PropTypes.string,
  email: PropTypes.string,
  imageData: PropTypes.string,
  imageType: PropTypes.string,
  loginToken: PropTypes.string,
  name: PropTypes.string,
  tel: PropTypes.string,
});

const SprintDailyMeetingQuestionPropTypes = PropTypes.shape({
  id: PropTypes.number,
  question: PropTypes.string,
  sortOrder: PropTypes.number,
});

const SprintDailyMeetingPropTypes = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  startTime: PropTypes.number,
  endTime: PropTypes.number,
  sprintDailyMeetingQuestions: PropTypes.arrayOf(SprintDailyMeetingQuestionPropTypes),
});

const ProjectPropTypes = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  allowSearch: PropTypes.bool,
  allowAutoJoin: PropTypes.bool,
  activated: PropTypes.bool,
  users: PropTypes.arrayOf(UserPropTypes),
  activatedSprintCount: PropTypes.number,
});

const SprintPropTypes = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  realEndDate: PropTypes.string,
  isJiraSprint: PropTypes.bool,
  jiraSprintUrl: PropTypes.string,
  jiraAuthKey: PropTypes.string,
  allowSearch: PropTypes.bool,
  allowAutoJoin: PropTypes.bool,
  activated: PropTypes.bool,
  doDailyScrumMeeting: PropTypes.bool,
  users: PropTypes.arrayOf(UserPropTypes),
  sprintDailyMeetings: PropTypes.arrayOf(SprintDailyMeetingPropTypes),
  isMember: PropTypes.bool,
  userCount: PropTypes.number,
  hasScrumMeeting: PropTypes.bool,
  isUserScrumInfoRegistered: PropTypes.bool,
  projectId: PropTypes.number,
  projectName: PropTypes.string,
});

const MeetingPropTypes = PropTypes.shape({
  code: PropTypes.string,
  endDate: PropTypes.string,
  id: PropTypes.number,
  name: PropTypes.string,
  sprintDailyMeetingId: PropTypes.number,
  sprintDailySmallTalkMeetingId: PropTypes.number,
  sprintId: PropTypes.number,
  sprintName: PropTypes.string,
  startDate: PropTypes.string,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      alias: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.number,
      imageData: PropTypes.string,
      imageType: PropTypes.string,
      name: PropTypes.string,
      userId: PropTypes.number,
    }),
  ),
});

const SprintSummaryPropTypes = PropTypes.shape({
  meetings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      durationSeconds: PropTypes.number,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      realEndDate: PropTypes.number,
      realStartDate: PropTypes.number,
      sprintDailyMeetingId: PropTypes.number,
      users: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          firstJoinDate: PropTypes.string,
          lastOutDate: PropTypes.string,
          joinDurationSeconds: PropTypes.number,
          talkedSeconds: PropTypes.number,
          userId: PropTypes.number,
        }),
      ),
    }),
  ),
});

export {
  HistoryPropTypes,
  SettingPropTypes,
  UserPropTypes,
  LocationPropTypes,
  ProjectPropTypes,
  SprintDailyMeetingQuestionPropTypes,
  SprintDailyMeetingPropTypes,
  SprintPropTypes,
  SprintSummaryPropTypes,
  MeetingPropTypes,
};
