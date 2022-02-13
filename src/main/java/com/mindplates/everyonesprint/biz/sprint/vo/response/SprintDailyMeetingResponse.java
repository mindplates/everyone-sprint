package com.mindplates.everyonesprint.biz.sprint.vo.response;


import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeeting;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeetingAnswer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
public class SprintDailyMeetingResponse {

    List<SprintDailyMeetingQuestionResponse> sprintDailyMeetingQuestions;
    List<SprintDailyMeetingAnswerResponse> sprintDailyMeetingAnswers;
    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean useQuestion;
    private Boolean onHoliday;
    private String days;
    private Long sprintId;
    private String sprintName;

    public SprintDailyMeetingResponse(SprintDailyMeeting sprintDailyMeeting, List<SprintDailyMeetingAnswer> sprintDailyMeetingAnswers) {
        this.id = sprintDailyMeeting.getId();
        this.name = sprintDailyMeeting.getName();
        this.sprintId = sprintDailyMeeting.getSprint().getId();
        this.sprintName = sprintDailyMeeting.getSprint().getName();
        this.startTime = sprintDailyMeeting.getStartTime();
        this.endTime = sprintDailyMeeting.getEndTime();
        this.useQuestion = sprintDailyMeeting.getUseQuestion();
        this.onHoliday = sprintDailyMeeting.getOnHoliday();
        this.days = sprintDailyMeeting.getDays();
        this.sprintDailyMeetingQuestions = sprintDailyMeeting.getSprintDailyMeetingQuestions().stream().map(SprintDailyMeetingQuestionResponse::new).collect(Collectors.toList());
        this.sprintDailyMeetingAnswers = sprintDailyMeetingAnswers.stream().map(SprintDailyMeetingAnswerResponse::new).collect(Collectors.toList());
    }


}
