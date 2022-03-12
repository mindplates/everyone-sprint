package com.mindplates.everyonesprint.biz.meeting.vo.response;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.RoomUser;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingPlan;
import com.mindplates.everyonesprint.common.code.MeetingTypeCode;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MeetingSummaryResponse {
    private Long id;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime realStartDate;
    private LocalDateTime realEndDate;
    private Long durationSeconds;
    private List<User> users;
    private Long scrumMeetingPlanId;
    private MeetingTypeCode type;

    public MeetingSummaryResponse(Meeting meeting) {
        this.id = meeting.getId();
        this.startDate = meeting.getStartDate();
        this.endDate = meeting.getEndDate();
        this.realStartDate = meeting.getRealStartDate();
        this.realEndDate = meeting.getRealEndDate();
        this.durationSeconds = meeting.getDurationSeconds();
        this.scrumMeetingPlanId = Optional.ofNullable(meeting.getScrumMeetingPlan()).map(ScrumMeetingPlan::getId).orElse(null);
        this.type = meeting.getType();
        if (!meeting.getType().equals(MeetingTypeCode.SMALLTALK)) {
            this.users = meeting.getUsers().stream().map(
                    (meetingUser) -> User.builder()
                            .id(meetingUser.getId())
                            .userId(meetingUser.getUser().getId())
                            .firstJoinDate(meetingUser.getFirstJoinDate())
                            .lastOutDate(meetingUser.getLastOutDate())
                            .joinDurationSeconds(meetingUser.getJoinDurationSeconds())
                            .talkedSeconds(meetingUser.getTalkedSeconds())
                            .talkedCount(meetingUser.getTalkedCount())
                            .build()).collect(Collectors.toList());
        } else {
            List<RoomUser> roomUsers = new ArrayList<>();
            meeting.getRooms().stream().forEach((room -> roomUsers.addAll(room.getUsers())));
            this.users = roomUsers.stream().map(
                    (roomUser) -> User.builder()
                            .id(roomUser.getId())
                            .userId(roomUser.getUser().getId())
                            .firstJoinDate(roomUser.getFirstJoinDate())
                            .lastOutDate(roomUser.getLastOutDate())
                            .joinDurationSeconds(roomUser.getJoinDurationSeconds())
                            .talkedSeconds(roomUser.getTalkedSeconds())
                            .talkedCount(roomUser.getTalkedCount())
                            .build()).collect(Collectors.toList());
        }

    }

    @Data
    @Builder
    public static class User {
        private Long id;
        private Long userId;
        private LocalDateTime firstJoinDate;
        private LocalDateTime lastOutDate;
        private Long joinDurationSeconds;
        private Long talkedSeconds;
        private Long talkedCount;
        private Long answerCount;

    }
}
