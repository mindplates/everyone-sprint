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

const SpaceListPropTypes = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  code: PropTypes.string,
  description: PropTypes.string,
  allowSearch: PropTypes.bool,
  allowAutoJoin: PropTypes.bool,
  activated: PropTypes.bool,
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
});

const SpacePropTypes = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  code: PropTypes.string,
  description: PropTypes.string,
  allowSearch: PropTypes.bool,
  allowAutoJoin: PropTypes.bool,
  activated: PropTypes.bool,
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
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
  spaces: PropTypes.arrayOf(SpaceListPropTypes),
});

const SimpleUserPropTypes = PropTypes.shape({
  id: PropTypes.number,
  userId: PropTypes.number,
  alias: PropTypes.string,
  email: PropTypes.string,
  name: PropTypes.string,
  imageData: PropTypes.string,
  imageType: PropTypes.string,
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
  scrumMeetingQuestions: PropTypes.arrayOf(SprintDailyMeetingQuestionPropTypes),
});

const ProjectPropTypes = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  allowSearch: PropTypes.bool,
  allowAutoJoin: PropTypes.bool,
  activated: PropTypes.bool,
  users: PropTypes.arrayOf(UserPropTypes),
  activatedSprintCount: PropTypes.number,
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
});

const SprintPropTypes = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  startDate: PropTypes.number,
  endDate: PropTypes.number,
  realEndDate: PropTypes.string,
  isJiraSprint: PropTypes.bool,
  jiraSprintUrl: PropTypes.string,
  jiraAuthKey: PropTypes.string,
  allowSearch: PropTypes.bool,
  allowAutoJoin: PropTypes.bool,
  activated: PropTypes.bool,
  doDailyScrumMeeting: PropTypes.bool,
  users: PropTypes.arrayOf(UserPropTypes),
  scrumMeetingPlans: PropTypes.arrayOf(SprintDailyMeetingPropTypes),
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
  hasScrumMeeting: PropTypes.bool,
  isUserScrumInfoRegistered: PropTypes.bool,
  projectId: PropTypes.number,
  projectName: PropTypes.string,
  projectActivated: PropTypes.bool,
});

const MeetingPropTypes = PropTypes.shape({
  code: PropTypes.string,
  endDate: PropTypes.string,
  id: PropTypes.number,
  name: PropTypes.string,
  scrumMeetingPlanId: PropTypes.number,
  smallTalkMeetingPlanId: PropTypes.number,
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
      scrumMeetingPlanId: PropTypes.number,
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

const AnswerPropTypes = PropTypes.shape({
  answer: PropTypes.string,
  date: PropTypes.string,
  id: PropTypes.number,
  scrumMeetingQuestionId: PropTypes.number,
  sprintId: PropTypes.number,
  users: PropTypes.arrayOf(SimpleUserPropTypes),
});

const ConferencePropTypes = PropTypes.shape({
  id: PropTypes.number,
  projectId: PropTypes.number,
  projectName: PropTypes.string,
  sprintId: PropTypes.number,
  sprintName: PropTypes.string,
  name: PropTypes.string,
  code: PropTypes.string,
  roomCode: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  users: PropTypes.arrayOf(SimpleUserPropTypes),
  scrumMeetingPlanId: PropTypes.number,
  scrumMeetingQuestions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      scrumMeetingPlanId: PropTypes.number,
      question: PropTypes.string,
      sortOrder: PropTypes.number,
    }),
  ),
  connectedUserCount: PropTypes.number,
  smallTalkMeetingPlanId: PropTypes.number,
  limitUserCount: PropTypes.number,
  type: PropTypes.string,
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
  ConferencePropTypes,
  AnswerPropTypes,
  SpacePropTypes,
};
