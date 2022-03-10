package com.mindplates.everyonesprint.biz.sprint.vo.request;

import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Data;

@Data
public class SprintUserRequest {

    private Long id;
    private Long userId;
    private RoleCode role;


}
