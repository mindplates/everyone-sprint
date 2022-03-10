package com.mindplates.everyonesprint.biz.sprint.vo.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScrumMeetingQuestionRequest {

    private Long id;
    private String question;
    private Integer sortOrder;


}
