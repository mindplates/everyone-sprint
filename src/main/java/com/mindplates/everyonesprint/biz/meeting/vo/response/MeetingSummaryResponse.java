package com.mindplates.everyonesprint.biz.meeting.vo.response;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingPlan;
import lombok.*;

import java.time.LocalDateTime;
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


    public MeetingSummaryResponse(Meeting meeting) {
        this.id = meeting.getId();
        this.startDate = meeting.getStartDate();
        this.endDate = meeting.getEndDate();
        this.realStartDate = meeting.getRealStartDate();
        this.realEndDate = meeting.getRealEndDate();
        this.durationSeconds = meeting.getDurationSeconds();
        this.scrumMeetingPlanId = Optional.ofNullable(meeting.getScrumMeetingPlan()).map(ScrumMeetingPlan::getId).orElse(null);
        this.users = meeting.getUsers().stream().map(
                (meetingUser) -> User.builder()
                        .id(meetingUser.getId())
                        .userId(meetingUser.getUser().getId())
                        .firstJoinDate(meetingUser.getFirstJoinDate())
                        .lastOutDate(meetingUser.getLastOutDate())
                        .joinDurationSeconds(meetingUser.getJoinDurationSeconds())
                        .talkedSeconds(meetingUser.getTalkedSeconds())
                        .build()).collect(Collectors.toList());
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
    }
}
