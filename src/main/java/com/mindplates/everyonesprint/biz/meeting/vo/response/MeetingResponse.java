package com.mindplates.everyonesprint.biz.meeting.vo.response;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeeting;
import com.mindplates.everyonesprint.biz.sprint.vo.response.SprintDailyMeetingQuestionResponse;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
    private Long sprintDailyMeetingId;
    private List<SprintDailyMeetingQuestionResponse> sprintDailyMeetingQuestions;

    public MeetingResponse(Meeting meeting) {
        this.id = meeting.getId();
        this.name = meeting.getName();
        this.code = meeting.getCode();
        this.startDate = meeting.getStartDate();
        this.endDate = meeting.getEndDate();
        this.sprintId = meeting.getSprint().getId();
        this.sprintName = meeting.getSprint().getName();
        this.sprintDailyMeetingId = Optional.ofNullable(meeting.getSprintDailyMeeting()).map(SprintDailyMeeting::getId).orElse(null);
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
        if (meeting.getSprintDailyMeeting() != null) {
            this.sprintDailyMeetingQuestions = meeting.getSprintDailyMeeting().getSprintDailyMeetingQuestions()
                    .stream()
                    .map((SprintDailyMeetingQuestionResponse::new)).collect(Collectors.toList());
        }

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
