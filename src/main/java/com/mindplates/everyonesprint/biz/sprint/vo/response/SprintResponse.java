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
    private Boolean allowAutoJoin;
    private Boolean activated;
    private Boolean doDailyScrumMeeting;
    private Boolean doDailySmallTalkMeeting;
    private List<User> users;
    private List<SprintDailyMeeting> scrumMeetingPlans;
    private List<SprintDailySmallTalkMeeting> sprintDailySmallTalkMeetings;

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
        this.allowAutoJoin = sprint.getAllowAutoJoin();
        this.activated = sprint.getActivated();
        this.doDailyScrumMeeting = sprint.getDoDailyScrumMeeting();
        this.doDailySmallTalkMeeting = sprint.getDoDailySmallTalkMeeting();
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
        this.scrumMeetingPlans = sprint.getScrumMeetingPlans()
                .stream()
                .map(
                        (scrumMeetingPlan) -> SprintDailyMeeting.builder()
                                .id(scrumMeetingPlan.getId())
                                .name(scrumMeetingPlan.getName())
                                .startTime(scrumMeetingPlan.getStartTime())
                                .endTime(scrumMeetingPlan.getEndTime())
                                .useQuestion(scrumMeetingPlan.getUseQuestion())
                                .onHoliday(scrumMeetingPlan.getOnHoliday())
                                .days(scrumMeetingPlan.getDays())
                                .scrumMeetingPlanQuestions((scrumMeetingPlan.getScrumMeetingQuestions().stream()
                                        .map((scrumMeetingPlanQuestion -> SprintDailyMeetingQuestion.builder()
                                                .id(scrumMeetingPlanQuestion.getId())
                                                .question(scrumMeetingPlanQuestion.getQuestion())
                                                .sortOrder(scrumMeetingPlanQuestion.getSortOrder())
                                                .build()))
                                        .collect(Collectors.toList())))
                                .build()
                ).collect(Collectors.toList());

        this.sprintDailySmallTalkMeetings = sprint.getSprintDailySmallTalkMeetings()
                .stream()
                .map(
                        (sprintDailySmallTalkMeeting) -> SprintDailySmallTalkMeeting.builder()
                                .id(sprintDailySmallTalkMeeting.getId())
                                .name(sprintDailySmallTalkMeeting.getName())
                                .limitUserCount(sprintDailySmallTalkMeeting.getLimitUserCount())
                                .startTime(sprintDailySmallTalkMeeting.getStartTime())
                                .endTime(sprintDailySmallTalkMeeting.getEndTime())
                                .onHoliday(sprintDailySmallTalkMeeting.getOnHoliday())
                                .days(sprintDailySmallTalkMeeting.getDays())
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
        private List<SprintDailyMeetingQuestion> scrumMeetingPlanQuestions;

    }

    @Data
    @Builder
    public static class SprintDailySmallTalkMeeting {
        private Long id;
        private String name;
        private LocalTime startTime;
        private LocalTime endTime;
        private Boolean onHoliday;
        private String days;
        private Integer limitUserCount;
    }

    @Data
    @Builder
    public static class SprintDailyMeetingQuestion {
        private Long id;
        private String question;
        private Integer sortOrder;
    }
}
