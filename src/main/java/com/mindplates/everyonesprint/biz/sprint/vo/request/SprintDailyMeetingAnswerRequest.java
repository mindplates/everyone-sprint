package com.mindplates.everyonesprint.biz.sprint.vo.request;


import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeetingAnswer;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeetingQuestion;
import com.mindplates.everyonesprint.biz.user.entity.User;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SprintDailyMeetingAnswerRequest {

    private Long id;
    private Long sprintId;
    private Long sprintDailyMeetingQuestionId;
    private LocalDate date;
    private String answer;


    public SprintDailyMeetingAnswer buildEntity(Long userId) {

        SprintDailyMeetingAnswer sprintDailyMeetingAnswer = SprintDailyMeetingAnswer.builder()
                .id(id)
                .sprint(Sprint.builder().id(sprintId).build())
                .sprintDailyMeetingQuestion(SprintDailyMeetingQuestion.builder().id(sprintDailyMeetingQuestionId).build())
                .user(User.builder().id(userId).build())
                .date(date)
                .answer(answer)
                .build();



        return sprintDailyMeetingAnswer;
    }


}
