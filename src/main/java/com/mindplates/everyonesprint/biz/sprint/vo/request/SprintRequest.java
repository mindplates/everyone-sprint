package com.mindplates.everyonesprint.biz.sprint.vo.request;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.sprint.entity.*;
import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Builder;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class SprintRequest {

    private Long id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isJiraSprint;
    private String jiraSprintUrl;
    private String jiraAuthKey;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private Boolean doDailyScrumMeeting;
    private Boolean doDailySmallTalkMeeting;
    private List<SprintRequest.User> users;
    private List<SprintRequest.SprintDailyMeeting> scrumMeetingPlans;
    private List<SprintRequest.SprintDailySmallTalkMeeting> sprintDailySmallTalkMeetings;

    @NotNull
    private Long projectId;


    public Sprint buildEntity() {

        Sprint sprint = Sprint.builder()
                .id(id)
                .name(name)
                .startDate(startDate)
                .endDate(endDate)
                .isJiraSprint(isJiraSprint)
                .jiraSprintUrl(jiraSprintUrl)
                .jiraAuthKey(jiraAuthKey)
                .allowAutoJoin(allowAutoJoin)
                .activated(activated)
                .doDailyScrumMeeting(doDailyScrumMeeting)
                .doDailySmallTalkMeeting(doDailySmallTalkMeeting)
                .build();

        sprint.setProject(Project.builder().id(this.projectId).build());

        List<SprintUser> sprintUsers = users.stream().map(
                (user) -> SprintUser.builder()
                        .id(user.getId())
                        .user(com.mindplates.everyonesprint.biz.user.entity.User.builder()
                                .id(user.getUserId()).build())
                        .role(user.getRole())
                        .sprint(sprint).build()).collect(Collectors.toList());

        List<ScrumMeetingPlan> meetings = scrumMeetingPlans
                .stream()
                .map((scrumMeetingPlan) -> {
                            ScrumMeetingPlan meeting = ScrumMeetingPlan.builder()
                                    .id(scrumMeetingPlan.getId())
                                    .CRUD(scrumMeetingPlan.getCRUD())
                                    .sprint(sprint)
                                    .name(scrumMeetingPlan.getName())
                                    .startTime(scrumMeetingPlan.getStartTime().toLocalTime())
                                    .endTime(scrumMeetingPlan.getEndTime().toLocalTime())
                                    .useQuestion(scrumMeetingPlan.getUseQuestion())
                                    .onHoliday(scrumMeetingPlan.getOnHoliday())
                                    .days(scrumMeetingPlan.getDays())
                                    .build();

                            meeting.setScrumMeetingQuestions(scrumMeetingPlan.getScrumMeetingPlanQuestions()
                                    .stream()
                                    .map((scrumMeetingPlanQuestion -> ScrumMeetingQuestion
                                            .builder()
                                            .scrumMeetingPlan(meeting)
                                            .id(scrumMeetingPlanQuestion.getId())
                                            .question(scrumMeetingPlanQuestion.getQuestion())
                                            .sortOrder(scrumMeetingPlanQuestion.getSortOrder())
                                            .build())).collect(Collectors.toList()));

                            return meeting;


                        }
                ).collect(Collectors.toList());


        List<SmallTalkMeetingPlan> smallTalkMeetings = sprintDailySmallTalkMeetings
                .stream()
                .map((sprintDailySmallTalkMeeting) -> {
                            SmallTalkMeetingPlan meeting = SmallTalkMeetingPlan.builder()
                                    .id(sprintDailySmallTalkMeeting.getId())
                                    .CRUD(sprintDailySmallTalkMeeting.getCRUD())
                                    .sprint(sprint)
                                    .name(sprintDailySmallTalkMeeting.getName())
                                    .startTime(sprintDailySmallTalkMeeting.getStartTime().toLocalTime())
                                    .endTime(sprintDailySmallTalkMeeting.getEndTime().toLocalTime())
                                    .limitUserCount(sprintDailySmallTalkMeeting.getLimitUserCount())
                                    .onHoliday(sprintDailySmallTalkMeeting.getOnHoliday())
                                    .days(sprintDailySmallTalkMeeting.getDays())
                                    .build();


                            return meeting;


                        }
                ).collect(Collectors.toList());


        sprint.setUsers(sprintUsers);
        sprint.setScrumMeetingPlans(meetings);
        sprint.setSprintDailySmallTalkMeetings(smallTalkMeetings);

        return sprint;
    }

    @Data
    public static class User {
        private Long id;
        private Long userId;
        private RoleCode role;
    }

    @Data
    @Builder
    public static class SprintDailyMeeting {
        private Long id;
        private String CRUD;
        private String name;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Boolean useQuestion;
        private Boolean onHoliday;
        private String days;
        private List<SprintRequest.SprintDailyMeetingQuestion> scrumMeetingPlanQuestions;
    }

    @Data
    @Builder
    public static class SprintDailySmallTalkMeeting {
        private Long id;
        private String CRUD;
        private String name;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
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
