package com.mindplates.everyonesprint.biz.space.vo.response;

import com.mindplates.everyonesprint.biz.space.entity.SpaceApplicant;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SpaceApplicantResponse {
    private Long id;
    private Long userId;
    private String email;
    private String name;
    private String alias;
    private String imageType;
    private String imageData;
    private ApprovalStatusCode approvalStatusCode;

    public SpaceApplicantResponse(SpaceApplicant spaceApplicant) {
        if (spaceApplicant != null) {
            this.id = spaceApplicant.getId();
            this.approvalStatusCode = spaceApplicant.getApprovalStatusCode();
            this.userId = spaceApplicant.getUser().getId();
            this.email = spaceApplicant.getUser().getEmail();
            this.alias = spaceApplicant.getUser().getAlias();
            this.imageType = spaceApplicant.getUser().getImageType();
            this.imageData = spaceApplicant.getUser().getImageData();
        }

    }


}
