package com.mindplates.everyonesprint.biz.sprint.vo.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Builder
@Data

public class SmallTalkMeetingPlanResponse {
    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean onHoliday;
    private String days;
    private Integer limitUserCount;


}
