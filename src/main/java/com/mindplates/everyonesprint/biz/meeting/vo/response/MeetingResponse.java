package com.mindplates.everyonesprint.biz.meeting.vo.response;

import com.mindplates.everyonesprint.biz.common.vo.response.SimpleUserResponse;
import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.Room;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingPlan;
import com.mindplates.everyonesprint.biz.sprint.entity.SmallTalkMeetingPlan;
import com.mindplates.everyonesprint.biz.sprint.vo.response.ScrumMeetingQuestionResponse;
import com.mindplates.everyonesprint.common.code.MeetingTypeCode;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MeetingResponse {
    private Long id;
    private Long sprintId;
    private String sprintName;
    private String name;
    private String code;
    private String roomCode;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<SimpleUserResponse> users;
    private Long scrumMeetingPlanId;
    private List<ScrumMeetingQuestionResponse> scrumMeetingQuestions;
    private Long connectedUserCount;
    private Long smallTalkMeetingPlanId;
    private Integer limitUserCount;
    private MeetingTypeCode type;

    public MeetingResponse(Meeting meeting) {
        this.id = meeting.getId();
        this.name = meeting.getName();
        this.code = meeting.getCode();
        this.type = meeting.getType();
        this.startDate = meeting.getStartDate();
        this.endDate = meeting.getEndDate();
        this.sprintId = meeting.getSprint().getId();
        this.sprintName = meeting.getSprint().getName();
        this.scrumMeetingPlanId = Optional.ofNullable(meeting.getScrumMeetingPlan()).map(ScrumMeetingPlan::getId).orElse(null);
        this.smallTalkMeetingPlanId = Optional.ofNullable(meeting.getSmallTalkMeetingPlan()).map(SmallTalkMeetingPlan::getId).orElse(null);
        this.limitUserCount = meeting.getLimitUserCount();

        this.users = meeting.getUsers().stream().map(
                (meetingUser) -> SimpleUserResponse.builder()
                        .id(meetingUser.getId())
                        .userId(meetingUser.getUser().getId())
                        .email(meetingUser.getUser().getEmail())
                        .name(meetingUser.getUser().getName())
                        .alias(meetingUser.getUser().getAlias())
                        .imageType(meetingUser.getUser().getImageType())
                        .imageData(meetingUser.getUser().getImageData())
                        .build()).collect(Collectors.toList());
        if (meeting.getScrumMeetingPlan() != null) {
            this.scrumMeetingQuestions = meeting.getScrumMeetingPlan().getScrumMeetingQuestions()
                    .stream()
                    .map((ScrumMeetingQuestionResponse::new)).collect(Collectors.toList());
        }

    }

    public MeetingResponse(Meeting meeting, Room room) {
        this.id = meeting.getId();
        this.name = meeting.getName();
        this.code = meeting.getCode();
        this.type = meeting.getType();
        this.roomCode = room.getCode();
        this.startDate = meeting.getStartDate();
        this.endDate = meeting.getEndDate();
        this.sprintId = meeting.getSprint().getId();
        this.sprintName = meeting.getSprint().getName();
        this.scrumMeetingPlanId = Optional.ofNullable(meeting.getScrumMeetingPlan()).map(ScrumMeetingPlan::getId).orElse(null);
        this.smallTalkMeetingPlanId = Optional.ofNullable(meeting.getSmallTalkMeetingPlan()).map(SmallTalkMeetingPlan::getId).orElse(null);
        this.limitUserCount = meeting.getLimitUserCount();

        this.users = room.getUsers().stream().map(
                (meetingUser) -> SimpleUserResponse.builder()
                        .id(meetingUser.getId())
                        .userId(meetingUser.getUser().getId())
                        .email(meetingUser.getUser().getEmail())
                        .name(meetingUser.getUser().getName())
                        .alias(meetingUser.getUser().getAlias())
                        .imageType(meetingUser.getUser().getImageType())
                        .imageData(meetingUser.getUser().getImageData())
                        .build()).collect(Collectors.toList());
        if (meeting.getScrumMeetingPlan() != null) {
            this.scrumMeetingQuestions = meeting.getScrumMeetingPlan().getScrumMeetingQuestions()
                    .stream()
                    .map((ScrumMeetingQuestionResponse::new)).collect(Collectors.toList());
        }

    }


}
