package com.mindplates.everyonesprint.biz.meeting.vo.response;

import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyScrumStatusResponse {
    private Long userId;
    private Integer order;
    private Boolean isCurrentSpeaker;
    private Boolean isDailyScrumDone;

    public DailyScrumStatusResponse(Participant participant) {
        this.userId = Long.parseLong(participant.getId());
        this.order = participant.getDailyScrumOrder();
        this.isCurrentSpeaker = participant.getIsCurrentSpeaker();
        this.isDailyScrumDone = participant.getIsDailyScrumDone();
    }

}
