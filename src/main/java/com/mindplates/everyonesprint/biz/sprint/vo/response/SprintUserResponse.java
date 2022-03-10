package com.mindplates.everyonesprint.biz.sprint.vo.response;

import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Builder;
import lombok.Data;

@Builder
@Data

public class SprintUserResponse {
    private Long id;
    private Long userId;
    private RoleCode role;
    private String email;
    private String name;
    private String alias;
    private String imageType;
    private String imageData;


}
