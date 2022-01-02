package com.mindplates.everyonesprint.biz.sprint.vo.response;


import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeetingAnswer;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SprintDailyMeetingAnswerResponse {

    private Long id;
    private Long sprintDailyMeetingQuestionId;
    private Long sprintId;
    private LocalDate date;
    private String answer;

    public SprintDailyMeetingAnswerResponse(SprintDailyMeetingAnswer sprintDailyMeetingAnswer) {
        this.id = sprintDailyMeetingAnswer.getId();
        this.sprintDailyMeetingQuestionId = sprintDailyMeetingAnswer.getSprintDailyMeetingQuestion().getId();
        this.sprintId = sprintDailyMeetingAnswer.getSprint().getId();
        this.date = sprintDailyMeetingAnswer.getDate();
        this.answer = sprintDailyMeetingAnswer.getAnswer();

    }


}
