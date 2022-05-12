package com.mindplates.everyonesprint.biz.project.vo.request;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.entity.ProjectApplicant;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import lombok.Data;

@Data
public class ProjectApplicantRequest {
    private Long id;
    private Long userId;
    private ApprovalStatusCode approvalStatusCode;

    public ProjectApplicant buildEntity(Project project) {

        ProjectApplicant projectApplicant = ProjectApplicant.builder()
                .id(id)
                .user(User.builder().id(userId).build())
                .project(project)
                .approvalStatusCode(approvalStatusCode)
                .build();

        return projectApplicant;
    }
}
