package com.mindplates.everyonesprint.biz.sprint.vo.response;


import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingAnswer;
import com.mindplates.everyonesprint.biz.user.vo.response.UserResponse;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ScrumMeetingAnswerResponse {

    private Long id;
    private Long scrumMeetingPlanQuestionId;
    private Long sprintId;
    private LocalDate date;
    private String answer;
    private UserResponse user;

    public ScrumMeetingAnswerResponse(ScrumMeetingAnswer scrumMeetingAnswer) {
        this.id = scrumMeetingAnswer.getId();
        this.scrumMeetingPlanQuestionId = scrumMeetingAnswer.getScrumMeetingQuestion().getId();
        this.sprintId = scrumMeetingAnswer.getSprint().getId();
        this.date = scrumMeetingAnswer.getDate();
        this.answer = scrumMeetingAnswer.getAnswer();
        this.user = new UserResponse(scrumMeetingAnswer.getUser());
    }


}
