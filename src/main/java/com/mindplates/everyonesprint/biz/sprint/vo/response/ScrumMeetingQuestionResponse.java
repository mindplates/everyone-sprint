package com.mindplates.everyonesprint.biz.sprint.vo.response;

import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingQuestion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScrumMeetingQuestionResponse {

    private Long id;
    private Long scrumMeetingPlanId;
    private String question;
    private Integer sortOrder;


    public ScrumMeetingQuestionResponse(ScrumMeetingQuestion scrumMeetingQuestion) {
        this.id = scrumMeetingQuestion.getId();
        this.scrumMeetingPlanId = scrumMeetingQuestion.getScrumMeetingPlan().getId();
        this.question = scrumMeetingQuestion.getQuestion();
        this.sortOrder = scrumMeetingQuestion.getSortOrder();
    }


}
