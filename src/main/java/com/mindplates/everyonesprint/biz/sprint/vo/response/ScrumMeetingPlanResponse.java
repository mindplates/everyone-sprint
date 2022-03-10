package com.mindplates.everyonesprint.biz.sprint.vo.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;

@Builder
@Data
public class ScrumMeetingPlanResponse {
    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean useQuestion;
    private Boolean onHoliday;
    private String days;
    private List<ScrumMeetingQuestionResponse> scrumMeetingPlanQuestions;


}
