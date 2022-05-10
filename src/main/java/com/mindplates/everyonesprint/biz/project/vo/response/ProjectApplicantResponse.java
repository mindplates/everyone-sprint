package com.mindplates.everyonesprint.biz.project.vo.response;

import com.mindplates.everyonesprint.biz.project.entity.ProjectApplicant;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectApplicantResponse {
    private Long id;
    private Long userId;
    private String email;
    private String name;
    private String alias;
    private String imageType;
    private String imageData;
    private ApprovalStatusCode approvalStatusCode;

    public ProjectApplicantResponse(ProjectApplicant projectApplicant) {
        if (projectApplicant != null) {
            this.id = projectApplicant.getId();
            this.approvalStatusCode = projectApplicant.getApprovalStatusCode();
            this.userId = projectApplicant.getUser().getId();
            this.email = projectApplicant.getUser().getEmail();
            this.alias = projectApplicant.getUser().getAlias();
            this.imageType = projectApplicant.getUser().getImageType();
            this.imageData = projectApplicant.getUser().getImageData();
        }

    }


}
