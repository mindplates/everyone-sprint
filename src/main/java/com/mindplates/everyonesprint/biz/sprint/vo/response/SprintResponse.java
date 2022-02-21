package com.mindplates.everyonesprint.biz.sprint.vo.response;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SprintResponse {
    private Long id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime realEndDate;
    private Boolean isJiraSprint;
    private String jiraSprintUrl;
    private String jiraAuthKey;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private Boolean doDailyScrumMeeting;
    private List<User> users;
    private List<SprintDailyMeeting> sprintDailyMeetings;

    private Long projectId;
    private String projectName;

    public SprintResponse(Sprint sprint) {
        this.id = sprint.getId();
        this.name = sprint.getName();
        this.startDate = sprint.getStartDate();
        this.endDate = sprint.getEndDate();
        this.realEndDate = sprint.getRealEndDate();
        this.isJiraSprint = sprint.getIsJiraSprint();
        this.jiraSprintUrl = sprint.getJiraSprintUrl();
        this.jiraAuthKey = sprint.getJiraAuthKey();
        this.allowSearch = sprint.getAllowSearch();
        this.allowAutoJoin = sprint.getAllowAutoJoin();
        this.activated = sprint.getActivated();
        this.doDailyScrumMeeting = sprint.getDoDailyScrumMeeting();
        this.users = sprint.getUsers().stream().map(
                (sprintUser) -> User.builder()
                        .id(sprintUser.getId())
                        .userId(sprintUser.getUser().getId())
                        .role(sprintUser.getRole())
                        .email(sprintUser.getUser().getEmail())
                        .name(sprintUser.getUser().getName())
                        .alias(sprintUser.getUser().getAlias())
                        .imageType(sprintUser.getUser().getImageType())
                        .imageData(sprintUser.getUser().getImageData())
                        .build()).collect(Collectors.toList());
        this.sprintDailyMeetings = sprint.getSprintDailyMeetings()
                .stream()
                .map(
                        (sprintDailyMeeting) -> SprintDailyMeeting.builder()
                                .id(sprintDailyMeeting.getId())
                                .name(sprintDailyMeeting.getName())
                                .startTime(sprintDailyMeeting.getStartTime())
                                .endTime(sprintDailyMeeting.getEndTime())
                                .useQuestion(sprintDailyMeeting.getUseQuestion())
                                .onHoliday(sprintDailyMeeting.getOnHoliday())
                                .days(sprintDailyMeeting.getDays())
                                .sprintDailyMeetingQuestions((sprintDailyMeeting.getSprintDailyMeetingQuestions().stream()
                                        .map((sprintDailyMeetingQuestion -> SprintDailyMeetingQuestion.builder()
                                                .id(sprintDailyMeetingQuestion.getId())
                                                .question(sprintDailyMeetingQuestion.getQuestion())
                                                .sortOrder(sprintDailyMeetingQuestion.getSortOrder())
                                                .build()))
                                        .collect(Collectors.toList())))
                                .build()
                ).collect(Collectors.toList());

        if (sprint.getProject() != null) {
            this.projectId = sprint.getProject().getId();
            this.projectName = sprint.getProject().getName();
        }

    }

    @Data
    @Builder
    public static class User {
        private Long id;
        private Long userId;
        private RoleCode role;
        private String email;
        private String name;
        private String alias;
        private String imageType;
        private String imageData;
    }

    @Data
    @Builder
    public static class SprintDailyMeeting {
        private Long id;
        private String name;
        private LocalTime startTime;
        private LocalTime endTime;
        private Boolean useQuestion;
        private Boolean onHoliday;
        private String days;
        private List<SprintDailyMeetingQuestion> sprintDailyMeetingQuestions;

    }

    @Data
    @Builder
    public static class SprintDailyMeetingQuestion {
        private Long id;
        private String question;
        private Integer sortOrder;
    }
}
