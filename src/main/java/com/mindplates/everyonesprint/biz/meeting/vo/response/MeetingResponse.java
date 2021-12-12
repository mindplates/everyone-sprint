package com.mindplates.everyonesprint.biz.meeting.vo.response;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MeetingResponse {
    private Long id;
    private Long sprintId;
    private String sprintName;
    private String name;
    private String code;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<User> users;

    public MeetingResponse(Meeting meeting) {
        this.id = meeting.getId();
        this.name = meeting.getName();
        this.code = meeting.getCode();
        this.startDate = meeting.getStartDate();
        this.endDate = meeting.getEndDate();
        this.sprintId = meeting.getSprint().getId();
        this.sprintName = meeting.getSprint().getName();
        this.users = meeting.getUsers().stream().map(
                (meetingUser) -> User.builder()
                        .id(meetingUser.getId())
                        .userId(meetingUser.getUser().getId())
                        .email(meetingUser.getUser().getEmail())
                        .name(meetingUser.getUser().getName())
                        .alias(meetingUser.getUser().getAlias())
                        .imageType(meetingUser.getUser().getImageType())
                        .imageData(meetingUser.getUser().getImageData())
                        .build()).collect(Collectors.toList());
    }

    @Data
    @Builder
    public static class User {
        private Long id;
        private Long userId;
        private String email;
        private String name;
        private String alias;
        private String imageType;
        private String imageData;
    }
}
