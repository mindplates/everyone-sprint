import dateUtil from '@/utils/dateUtil';

function getSprint(sprint) {
  const result = {
    ...sprint,
  };

  result.sprintDailyMeetings.forEach((sprintDailyMeeting) => {
    sprintDailyMeeting.CRUD = 'R';
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

  result.sprintDailySmallTalkMeetings.forEach((sprintDailySmallTalkMeeting) => {
    sprintDailySmallTalkMeeting.CRUD = 'R';
    const starts = sprintDailySmallTalkMeeting.startTime.split(':');
    const ends = sprintDailySmallTalkMeeting.endTime.split(':');

    const startTime = new Date();
    startTime.setHours(Number(starts[0]) + dateUtil.getUserOffsetHours());
    startTime.setMinutes(Number(starts[1]) + dateUtil.getUserOffsetMinutes());

    const endTime = new Date();
    endTime.setHours(Number(ends[0]) + dateUtil.getUserOffsetHours());
    endTime.setMinutes(Number(ends[1]) + dateUtil.getUserOffsetMinutes());

    sprintDailySmallTalkMeeting.startTime = startTime.getTime();
    sprintDailySmallTalkMeeting.endTime = endTime.getTime();
  });

  result.startDate = dateUtil.getTime(result.startDate);
  result.endDate = dateUtil.getTime(result.endDate);

  return result;
}

const sprintUtil = {
  getSprint,
};

export default sprintUtil;
