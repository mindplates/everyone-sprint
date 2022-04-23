package com.mindplates.everyonesprint.biz.project.vo.request;

import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectUserRequest {
    private Long id;
    private Long userId;
    private String CRUD;
    private RoleCode role;
}
