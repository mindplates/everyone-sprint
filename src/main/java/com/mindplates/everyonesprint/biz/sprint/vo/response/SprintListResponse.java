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
    private Boolean activated;
    private Boolean isMember;
    private Boolean isAdmin;
    private Boolean hasScrumMeeting;
    private Boolean isUserScrumInfoRegistered;
    private Long projectId;
    private String projectName;
    private Boolean projectActivated;

    public SprintListResponse(Sprint sprint) {
        this.id = sprint.getId();
        this.name = sprint.getName();
        this.startDate = sprint.getStartDate();
        this.endDate = sprint.getEndDate();
        this.isJiraSprint = sprint.getIsJiraSprint();
        this.allowAutoJoin = sprint.getAllowAutoJoin();
        this.activated = sprint.getActivated();
        this.projectId = sprint.getProject().getId();
        this.projectName = sprint.getProject().getName();
        this.projectActivated = sprint.getProject().getActivated();
        this.isAdmin = sprint.getRoleCode().equals(RoleCode.ADMIN);
        this.isMember = sprint.getRoleCode().equals(RoleCode.ADMIN) || sprint.getRoleCode().equals(RoleCode.MEMBER);
    }
}
