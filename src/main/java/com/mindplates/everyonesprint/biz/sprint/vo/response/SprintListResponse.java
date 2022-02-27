package com.mindplates.everyonesprint.biz.sprint.vo.response;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SprintListResponse {
    private Long id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isJiraSprint;
    private Boolean allowAutoJoin;
    private Integer userCount;
    private Boolean activated;
    private Boolean isMember;
    private Boolean isAdmin;
    private Boolean hasScrumMeeting;
    private Boolean isUserScrumInfoRegistered;
    private Long projectId;
    private String projectName;
    private Boolean projectActivated;

    public SprintListResponse(Sprint sprint, UserSession userSession) {
        this.id = sprint.getId();
        this.name = sprint.getName();
        this.startDate = sprint.getStartDate();
        this.endDate = sprint.getEndDate();
        this.isJiraSprint = sprint.getIsJiraSprint();
        this.allowAutoJoin = sprint.getAllowAutoJoin();
        this.userCount = sprint.getUsers().size();
        this.activated = sprint.getActivated();
        this.projectId = sprint.getProject().getId();
        this.projectName = sprint.getProject().getName();
        this.projectActivated = sprint.getProject().getActivated();
        this.isMember = sprint.getUsers().stream().anyMatch((sprintUser -> sprintUser.getUser().getId().equals(userSession.getId())));
        this.isAdmin = sprint.getUsers().stream().anyMatch((sprintUser -> sprintUser.getRole().equals(RoleCode.ADMIN) && sprintUser.getUser().getId().equals(userSession.getId())));
    }
}
