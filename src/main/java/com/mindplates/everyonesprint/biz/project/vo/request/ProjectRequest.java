package com.mindplates.everyonesprint.biz.project.vo.request;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.entity.ProjectUser;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class ProjectRequest {

    private Long id;
    private String name;
    private String description;
    private String token;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private List<ProjectUserRequest> users;

    public Project buildEntity() {

        Project project = Project.builder()
                .id(id)
                .name(name)
                .description(description)
                .token(token)
                .allowSearch(allowSearch)
                .allowAutoJoin(allowAutoJoin)
                .activated(activated)
                .build();

        List<ProjectUser> projectUsers = users.stream().map(
                (projectUser) -> ProjectUser.builder()
                        .id(projectUser.getId())
                        .user(com.mindplates.everyonesprint.biz.user.entity.User.builder().id(projectUser.getUserId()).build())
                        .role(projectUser.getRole())
                        .CRUD(projectUser.getCRUD())
                        .tags(projectUser.getTags())
                        .project(project).build()).collect(Collectors.toList());

        project.setUsers(projectUsers);

        return project;
    }


}
