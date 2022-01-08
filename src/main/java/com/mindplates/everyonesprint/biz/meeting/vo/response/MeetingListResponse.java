package com.mindplates.everyonesprint.biz.meeting.vo.response;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MeetingListResponse {
    private Long id;
    private Long sprintId;
    private String sprintName;
    private String name;
    private String code;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer userCount;
    private Integer durationSeconds;

    public MeetingListResponse(Meeting meeting) {
        this.id = meeting.getId();
        this.name = meeting.getName();
        this.code = meeting.getCode();
        this.sprintId = meeting.getSprint().getId();
        this.sprintName = meeting.getSprint().getName();
        this.startDate = meeting.getStartDate();
        this.endDate = meeting.getEndDate();
        this.userCount = meeting.getUsers().size();
        this.durationSeconds = meeting.getDurationSeconds();
    }
}
