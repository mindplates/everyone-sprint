package com.mindplates.everyonesprint.biz.sprint.vo.response;


import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingPlan;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingAnswer;
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

    List<ScrumMeetingQuestionResponse> scrumMeetingPlanQuestions;
    List<ScrumMeetingAnswerResponse> scrumMeetingPlanAnswers;
    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean useQuestion;
    private Boolean onHoliday;
    private String days;
    private Long sprintId;
    private String sprintName;

    public SprintDailyMeetingResponse(ScrumMeetingPlan scrumMeetingPlan, List<ScrumMeetingAnswer> scrumMeetingAnswers) {
        this.id = scrumMeetingPlan.getId();
        this.name = scrumMeetingPlan.getName();
        this.sprintId = scrumMeetingPlan.getSprint().getId();
        this.sprintName = scrumMeetingPlan.getSprint().getName();
        this.startTime = scrumMeetingPlan.getStartTime();
        this.endTime = scrumMeetingPlan.getEndTime();
        this.useQuestion = scrumMeetingPlan.getUseQuestion();
        this.onHoliday = scrumMeetingPlan.getOnHoliday();
        this.days = scrumMeetingPlan.getDays();
        this.scrumMeetingPlanQuestions = scrumMeetingPlan.getScrumMeetingQuestions().stream().map(ScrumMeetingQuestionResponse::new).collect(Collectors.toList());
        this.scrumMeetingPlanAnswers = scrumMeetingAnswers.stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList());
    }


}
