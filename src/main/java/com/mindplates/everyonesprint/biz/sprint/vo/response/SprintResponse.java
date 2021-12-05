package com.mindplates.everyonesprint.biz.sprint.vo.response;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SprintResponse {
    private Long id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isJiraSprint;
    private String jiraSprintUrl;
    private String jiraAuthKey;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private List<User> users;

    public SprintResponse(Sprint sprint) {
        this.id = sprint.getId();
        this.name = sprint.getName();
        this.startDate = sprint.getStartDate();
        this.endDate = sprint.getEndDate();
        this.isJiraSprint = sprint.getIsJiraSprint();
        this.jiraSprintUrl = sprint.getJiraSprintUrl();
        this.jiraAuthKey = sprint.getJiraAuthKey();
        this.allowSearch = sprint.getAllowSearch();
        this.allowAutoJoin = sprint.getAllowAutoJoin();
        this.users = sprint.getUsers().stream().map(
                (sprintUser) -> User.builder()
                        .id(sprintUser.getId())
                        .role(sprintUser.getUser().getRoleCode())
                        .email(sprintUser.getUser().getEmail())
                        .name(sprintUser.getUser().getName())
                        .alias(sprintUser.getUser().getAlias())
                        .imageType(sprintUser.getUser().getImageType())
                        .imageData(sprintUser.getUser().getImageData())
                        .build()).collect(Collectors.toList());
    }

    @Data
    @Builder
    public static class User {
        private Long id;
        private RoleCode role;
        private String email;
        private String name;
        private String alias;
        private String imageType;
        private String imageData;
    }
}
