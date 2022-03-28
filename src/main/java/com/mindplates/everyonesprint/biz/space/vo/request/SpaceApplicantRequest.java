package com.mindplates.everyonesprint.biz.space.vo.request;

import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.entity.SpaceApplicant;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import lombok.Data;

@Data
public class SpaceApplicantRequest {
    private Long id;
    private Long userId;
    private Long spaceId;
    private ApprovalStatusCode approvalStatusCode;

    public SpaceApplicant buildEntity() {

        SpaceApplicant spaceApplicant = SpaceApplicant.builder()
                .id(id)
                .user(User.builder().id(userId).build())
                .space(Space.builder().id(spaceId).build())
                .approvalStatusCode(approvalStatusCode)
                .build();

        return spaceApplicant;
    }
}
