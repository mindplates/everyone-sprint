package com.mindplates.everyonesprint.biz.meeting.vo.request;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class MeetingRequest {

    private Long id;
    private Long sprintId;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<MeetingRequest.User> users;

    public Meeting buildEntity() {

        Meeting meeting = Meeting.builder()
                .id(id)
                .name(name)
                .startDate(startDate)
                .endDate(endDate)
                .sprint(Sprint.builder().id(sprintId).build())
                .build();

        List<MeetingUser> meetingUsers = users.stream().map(
                (user) -> MeetingUser.builder()
                        .id(user.getId())
                        .user(com.mindplates.everyonesprint.biz.user.entity.User.builder()
                                .id(user.getUserId()).build())
                        .meeting(meeting).build()).collect(Collectors.toList());

        meeting.setUsers(meetingUsers);

        return meeting;
    }

    @Data
    public static class User {
        private Long id;
        private Long userId;
    }


}
