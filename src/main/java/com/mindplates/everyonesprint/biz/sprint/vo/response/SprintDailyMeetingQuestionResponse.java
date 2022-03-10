package com.mindplates.everyonesprint.biz.sprint.vo.response;

import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingQuestion;
import lombok.Data;

@Data
public class SprintDailyMeetingQuestionResponse {

    private Long id;
    private Long scrumMeetingPlanId;
    private String question;
    private Integer sortOrder;


    public SprintDailyMeetingQuestionResponse(ScrumMeetingQuestion scrumMeetingQuestion) {
        this.id = scrumMeetingQuestion.getId();
        this.scrumMeetingPlanId = scrumMeetingQuestion.getScrumMeetingPlan().getId();
        this.question = scrumMeetingQuestion.getQuestion();
        this.sortOrder = scrumMeetingQuestion.getSortOrder();
    }


}
