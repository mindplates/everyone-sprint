import dateUtil from '@/utils/dateUtil';

function getSprint(sprint) {
  const result = {
    ...sprint,
  };

  result.scrumMeetingPlans?.forEach((scrumMeetingPlan) => {
    scrumMeetingPlan.CRUD = 'R';
    const starts = scrumMeetingPlan.startTime.split(':');
    const ends = scrumMeetingPlan.endTime.split(':');

    const startTime = new Date();
    startTime.setHours(Number(starts[0]) + dateUtil.getUserOffsetHours());
    startTime.setMinutes(Number(starts[1]) + dateUtil.getUserOffsetMinutes());

    const endTime = new Date();
    endTime.setHours(Number(ends[0]) + dateUtil.getUserOffsetHours());
    endTime.setMinutes(Number(ends[1]) + dateUtil.getUserOffsetMinutes());

    scrumMeetingPlan.startTime = startTime.getTime();
    scrumMeetingPlan.endTime = endTime.getTime();

    scrumMeetingPlan.scrumMeetingQuestions.sort((a, b) => {
      return a.sortOrder - b.sortOrder;
    });
  });

  result.smallTalkMeetingPlans?.forEach((smallTalkMeetingPlan) => {
    smallTalkMeetingPlan.CRUD = 'R';
    const starts = smallTalkMeetingPlan.startTime.split(':');
    const ends = smallTalkMeetingPlan.endTime.split(':');

    const startTime = new Date();
    startTime.setHours(Number(starts[0]) + dateUtil.getUserOffsetHours());
    startTime.setMinutes(Number(starts[1]) + dateUtil.getUserOffsetMinutes());

    const endTime = new Date();
    endTime.setHours(Number(ends[0]) + dateUtil.getUserOffsetHours());
    endTime.setMinutes(Number(ends[1]) + dateUtil.getUserOffsetMinutes());

    smallTalkMeetingPlan.startTime = startTime.getTime();
    smallTalkMeetingPlan.endTime = endTime.getTime();
  });

  result.startDate = dateUtil.getTime(result.startDate);
  result.endDate = dateUtil.getTime(result.endDate);

  return result;
}

const sprintUtil = {
  getSprint,
};

export default sprintUtil;
