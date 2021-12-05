package com.mindplates.everyonesprint.biz.sprint.vo.response;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SprintListResponse {
    private Long id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isJiraSprint;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Integer userCount;

    public SprintListResponse(Sprint sprint) {
        this.id = sprint.getId();
        this.name = sprint.getName();
        this.startDate = sprint.getStartDate();
        this.endDate = sprint.getEndDate();
        this.isJiraSprint = sprint.getIsJiraSprint();
        this.allowSearch = sprint.getAllowSearch();
        this.allowAutoJoin = sprint.getAllowAutoJoin();
        this.userCount = sprint.getUsers().size();


    }
}
