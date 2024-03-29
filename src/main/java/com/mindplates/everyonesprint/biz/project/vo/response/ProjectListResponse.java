package com.mindplates.everyonesprint.biz.project.vo.response;

import com.mindplates.everyonesprint.biz.common.vo.response.SimpleUserResponse;
import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectListResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private List<SimpleUserResponse> users;
    private Boolean isMember;
    private Boolean isAdmin;
    private Long activatedSprintCount;

    public ProjectListResponse(Project project, UserSession userSession) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.allowSearch = project.getAllowSearch();
        this.allowAutoJoin = project.getAllowAutoJoin();
        this.activated = project.getActivated();
        this.isMember = project.getUsers().stream().anyMatch((projectUser -> projectUser.getUser().getId().equals(userSession.getId())));
        this.isAdmin = project.getUsers().stream().anyMatch((projectUser -> projectUser.getRole().equals(RoleCode.ADMIN) && projectUser.getUser().getId().equals(userSession.getId())));
        this.users = project.getUsers().stream().map(
                (projectUser) -> SimpleUserResponse.builder()
                        .id(projectUser.getId())
                        .userId(projectUser.getUser().getId())
                        .role(projectUser.getRole())
                        .email(projectUser.getUser().getEmail())
                        .name(projectUser.getUser().getName())
                        .alias(projectUser.getUser().getAlias())
                        .imageType(projectUser.getUser().getImageType())
                        .imageData(projectUser.getUser().getImageData())
                        .build()).collect(Collectors.toList());

        if (project.getSprints() != null) {
            this.activatedSprintCount = project.getSprints().stream().filter(Sprint::getActivated).count();
        }
    }


}
