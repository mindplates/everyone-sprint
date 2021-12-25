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
  startTime: PropTypes.string,
  endTime: PropTypes.string,
  sprintDailyMeetingQuestions: PropTypes.arrayOf(SprintDailyMeetingQuestionPropTypes),
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
});

export {
  HistoryPropTypes,
  SettingPropTypes,
  UserPropTypes,
  LocationPropTypes,
  SprintDailyMeetingQuestionPropTypes,
  SprintDailyMeetingPropTypes,
  SprintPropTypes,
};
