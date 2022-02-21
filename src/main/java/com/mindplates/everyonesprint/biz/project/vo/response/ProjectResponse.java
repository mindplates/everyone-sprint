package com.mindplates.everyonesprint.biz.project.vo.response;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.vo.response.SprintResponse;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private String name;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private List<SprintResponse> sprints;
    private List<User> users;
    private Boolean isMember;
    private Long activatedSprintCount = 0L;
    private LocalDateTime creationDate;

    public ProjectResponse(Project project, UserSession userSession) {
        this.id = project.getId();
        this.name = project.getName();
        this.allowSearch = project.getAllowSearch();
        this.allowAutoJoin = project.getAllowAutoJoin();
        this.activated = project.getActivated();
        this.isMember = project.getUsers().stream().anyMatch((projectUser -> projectUser.getUser().getId().equals(userSession.getId())));
        this.creationDate = project.getCreationDate();
        this.users = project.getUsers().stream().map(
                (projectUser) -> User.builder()
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

        if (project.getSprints() != null) {
            this.sprints = project.getSprints()
                    .stream()
                    .map(
                            (sprint) -> SprintResponse.builder()
                                    .id(sprint.getId())
                                    .name(sprint.getName())
                                    .startDate(sprint.getStartDate())
                                    .endDate(sprint.getEndDate())
                                    .activated(sprint.getActivated())
                                    .build()
                    ).collect(Collectors.toList());
        }


    }

    @Data
    @Builder
    public static class User {
        private Long id;
        private Long userId;
        private RoleCode role;
        private String email;
        private String name;
        private String alias;
        private String imageType;
        private String imageData;
    }


}
