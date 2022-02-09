package com.mindplates.everyonesprint.biz.sprint.vo.response;

import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeetingQuestion;
import lombok.Data;

@Data
public class SprintDailyMeetingQuestionResponse {

    private Long id;
    private Long sprintDailyMeetingId;
    private String question;
    private Integer sortOrder;


    public SprintDailyMeetingQuestionResponse(SprintDailyMeetingQuestion sprintDailyMeetingQuestion) {
        this.id = sprintDailyMeetingQuestion.getId();
        this.sprintDailyMeetingId = sprintDailyMeetingQuestion.getSprintDailyMeeting().getId();
        this.question = sprintDailyMeetingQuestion.getQuestion();
        this.sortOrder = sprintDailyMeetingQuestion.getSortOrder();
    }


}
