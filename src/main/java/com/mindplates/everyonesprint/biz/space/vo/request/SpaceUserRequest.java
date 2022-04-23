package com.mindplates.everyonesprint.biz.space.vo.request;

import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpaceUserRequest {
    private Long id;
    private String CRUD;
    private Long userId;
    private RoleCode role;
}
