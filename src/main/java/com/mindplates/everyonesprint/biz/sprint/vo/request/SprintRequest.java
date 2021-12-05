package com.mindplates.everyonesprint.biz.sprint.vo.request;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintUser;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class SprintRequest {

    private Long id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isJiraSprint;
    private String jiraSprintUrl;
    private String jiraAuthKey;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private List<SprintRequest.User> users;

    public Sprint buildEntity() {

        Sprint sprint = Sprint.builder()
                .id(id)
                .name(name)
                .startDate(startDate)
                .endDate(endDate)
                .isJiraSprint(isJiraSprint)
                .jiraSprintUrl(jiraSprintUrl)
                .jiraAuthKey(jiraAuthKey)
                .allowSearch(allowSearch)
                .allowAutoJoin(allowAutoJoin)
                .build();

        List<SprintUser> sprintUsers = users.stream().map((user) -> SprintUser.builder()
                .user(com.mindplates.everyonesprint.biz.user.entity.User.builder().id(user.getId()).build())
                .role(user.getRole()).sprint(sprint).build()).collect(Collectors.toList());

        sprint.setUsers(sprintUsers);

        return sprint;
    }

    @Data
    public static class User {
        private Long id;
        private RoleCode role;
    }


}
