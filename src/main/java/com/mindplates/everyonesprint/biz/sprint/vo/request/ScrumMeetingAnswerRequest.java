package com.mindplates.everyonesprint.biz.sprint.vo.request;


import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingAnswer;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingQuestion;
import com.mindplates.everyonesprint.biz.user.entity.User;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ScrumMeetingAnswerRequest {

    private Long id;
    private Long sprintId;
    private Long scrumMeetingPlanQuestionId;
    private LocalDate date;
    private String answer;


    public ScrumMeetingAnswer buildEntity(Long userId) {
        return ScrumMeetingAnswer.builder()
                .id(id)
                .sprint(Sprint.builder().id(sprintId).build())
                .scrumMeetingQuestion(ScrumMeetingQuestion.builder().id(scrumMeetingPlanQuestionId).build())
                .user(User.builder().id(userId).build())
                .date(date)
                .answer(answer)
                .build();
    }


}
