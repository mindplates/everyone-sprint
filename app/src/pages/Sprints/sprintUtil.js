import dateUtil from '@/utils/dateUtil';

function getSprint(sprint) {
  const result = {
    ...sprint,
  };

  result.sprintDailyMeetings.forEach((sprintDailyMeeting) => {
    const starts = sprintDailyMeeting.startTime.split(':');
    const ends = sprintDailyMeeting.endTime.split(':');

    const startTime = new Date();
    startTime.setHours(Number(starts[0]) + dateUtil.getUserOffsetHours());
    startTime.setMinutes(Number(starts[1]) + dateUtil.getUserOffsetMinutes());

    const endTime = new Date();
    endTime.setHours(Number(ends[0]) + dateUtil.getUserOffsetHours());
    endTime.setMinutes(Number(ends[1]) + dateUtil.getUserOffsetMinutes());

    sprintDailyMeeting.startTime = startTime.getTime();
    sprintDailyMeeting.endTime = endTime.getTime();

    sprintDailyMeeting.sprintDailyMeetingQuestions.sort((a, b) => {
      return a.sortOrder - b.sortOrder;
    });
  });

  result.startDate = dateUtil.getTime(result.startDate);
  result.endDate = dateUtil.getTime(result.endDate);

  return result;
}

const sprintUtil = {
  getSprint,
};

export default sprintUtil;
