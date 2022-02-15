package com.mindplates.everyonesprint.biz.common.vo.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class StatsInfoResponse {
    private Long sprintCount;
    private Long meetingCount;
    private Long userCount;

}
