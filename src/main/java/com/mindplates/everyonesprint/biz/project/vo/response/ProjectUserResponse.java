package com.mindplates.everyonesprint.biz.project.vo.response;

import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ProjectUserResponse {
    private Long id;
    private Long userId;
    private RoleCode role;
    private String email;
    private String name;
    private String alias;
    private String imageType;
    private String imageData;


}
