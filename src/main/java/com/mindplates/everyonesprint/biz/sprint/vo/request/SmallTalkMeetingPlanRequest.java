package com.mindplates.everyonesprint.biz.sprint.vo.request;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SmallTalkMeetingPlanRequest {

    private Long id;
    private String CRUD;
    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean onHoliday;
    private String days;
    private Integer limitUserCount;


}
