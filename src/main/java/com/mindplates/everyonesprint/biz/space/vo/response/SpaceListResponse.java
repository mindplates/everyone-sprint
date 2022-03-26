package com.mindplates.everyonesprint.biz.space.vo.response;

import com.mindplates.everyonesprint.biz.common.vo.response.SimpleUserResponse;
import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.space.entity.Space;
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
public class SpaceListResponse {
    private Long id;
    private String name;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private List<SimpleUserResponse> users;
    private Boolean isMember;
    private Boolean isAdmin;
    private Long activatedProjectCount = 0L;

    public SpaceListResponse(Space space, UserSession userSession) {
        this.id = space.getId();
        this.name = space.getName();
        this.allowSearch = space.getAllowSearch();
        this.allowAutoJoin = space.getAllowAutoJoin();
        this.activated = space.getActivated();
        this.isMember = space.getUsers().stream().anyMatch((projectUser -> projectUser.getUser().getId().equals(userSession.getId())));
        this.isAdmin = space.getUsers().stream().anyMatch((projectUser -> projectUser.getRole().equals(RoleCode.ADMIN) && projectUser.getUser().getId().equals(userSession.getId())));
        this.users = space.getUsers().stream().map(
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

        if (space.getProjects() != null) {
            this.activatedProjectCount = space.getProjects().stream().filter(Project::getActivated).count();
        }
    }


}
