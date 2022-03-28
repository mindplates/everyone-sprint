package com.mindplates.everyonesprint.biz.space.vo.request;

import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Data;

@Data
public class SpaceUserRequest {
    private Long id;
    private Long userId;
    private RoleCode role;
}
