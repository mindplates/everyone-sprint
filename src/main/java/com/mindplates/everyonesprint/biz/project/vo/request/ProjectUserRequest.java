package com.mindplates.everyonesprint.biz.project.vo.request;

import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Data;

@Data
public class ProjectUserRequest {
    private Long id;
    private Long userId;
    private RoleCode role;
}
