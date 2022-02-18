package com.mindplates.everyonesprint.biz.project.vo.request;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.entity.ProjectUser;
import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class ProjectRequest {

    private Long id;
    private String name;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private List<ProjectRequest.User> users;

    public Project buildEntity() {

        Project project = Project.builder()
                .id(id)
                .name(name)
                .allowSearch(allowSearch)
                .allowAutoJoin(allowAutoJoin)
                .activated(activated)
                .build();

        List<ProjectUser> projectUsers = users.stream().map(
                (user) -> ProjectUser.builder()
                        .id(user.getId())
                        .user(com.mindplates.everyonesprint.biz.user.entity.User.builder().id(user.getUserId()).build())
                        .role(user.getRole())
                        .project(project).build()).collect(Collectors.toList());

        project.setUsers(projectUsers);


        return project;
    }

    @Data
    public static class User {
        private Long id;
        private Long userId;
        private RoleCode role;
    }


}
