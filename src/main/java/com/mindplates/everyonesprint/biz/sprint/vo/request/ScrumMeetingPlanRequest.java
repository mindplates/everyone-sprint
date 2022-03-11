package com.mindplates.everyonesprint.biz.sprint.vo.request;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ScrumMeetingPlanRequest {

    private Long id;
    private String CRUD;
    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean useQuestion;
    private Boolean onHoliday;
    private String days;
    private List<ScrumMeetingQuestionRequest> scrumMeetingQuestions;


}
