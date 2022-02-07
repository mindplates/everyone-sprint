package com.mindplates.everyonesprint.biz.meeting.vo.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DailyScrumStatusResponse {
    private Long userId;
    private Integer order;
    private Boolean isCurrentSpeaker;
    private Boolean isDailyScrumDone;

}
