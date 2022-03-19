package com.mindplates.everyonesprint.biz.meeting.vo.request;

import lombok.Data;

@Data
public class JoinResponseRequest {

    private Long userId;
    private Boolean allowed;


}
