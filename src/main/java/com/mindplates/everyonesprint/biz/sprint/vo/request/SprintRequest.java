package com.mindplates.everyonesprint.biz.sprint.vo.request;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintUser;
import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Builder;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private Boolean doDailyScrumMeeting;
    private Boolean doDailySmallTalkMeeting;
    private List<SprintRequest.User> users;
    private List<SprintRequest.SprintDailyMeeting> sprintDailyMeetings;
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
                .allowSearch(allowSearch)
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

        List<com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeeting> meetings = sprintDailyMeetings
                .stream()
                .map((sprintDailyMeeting) -> {
                            com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeeting meeting = com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeeting.builder()
                                    .id(sprintDailyMeeting.getId())
                                    .CRUD(sprintDailyMeeting.getCRUD())
                                    .sprint(sprint)
                                    .name(sprintDailyMeeting.getName())
                                    .startTime(sprintDailyMeeting.getStartTime().toLocalTime())
                                    .endTime(sprintDailyMeeting.getEndTime().toLocalTime())
                                    .useQuestion(sprintDailyMeeting.getUseQuestion())
                                    .onHoliday(sprintDailyMeeting.getOnHoliday())
                                    .days(sprintDailyMeeting.getDays())
                                    .build();

                            meeting.setSprintDailyMeetingQuestions(sprintDailyMeeting.getSprintDailyMeetingQuestions()
                                    .stream()
                                    .map((sprintDailyMeetingQuestion -> com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeetingQuestion
                                            .builder()
                                            .sprintDailyMeeting(meeting)
                                            .id(sprintDailyMeetingQuestion.getId())
                                            .question(sprintDailyMeetingQuestion.getQuestion())
                                            .sortOrder(sprintDailyMeetingQuestion.getSortOrder())
                                            .build())).collect(Collectors.toList()));

                            return meeting;


                        }
                ).collect(Collectors.toList());


        List<com.mindplates.everyonesprint.biz.sprint.entity.SprintDailySmallTalkMeeting> smallTalkMeetings = sprintDailySmallTalkMeetings
                .stream()
                .map((sprintDailySmallTalkMeeting) -> {
                            com.mindplates.everyonesprint.biz.sprint.entity.SprintDailySmallTalkMeeting meeting = com.mindplates.everyonesprint.biz.sprint.entity.SprintDailySmallTalkMeeting.builder()
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
        sprint.setSprintDailyMeetings(meetings);
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
        private List<SprintRequest.SprintDailyMeetingQuestion> sprintDailyMeetingQuestions;
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
