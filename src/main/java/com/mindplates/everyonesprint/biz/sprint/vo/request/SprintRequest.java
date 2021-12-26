package com.mindplates.everyonesprint.biz.sprint.vo.request;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintUser;
import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.Builder;
import lombok.Data;

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
    private List<SprintRequest.User> users;
    private List<SprintRequest.SprintDailyMeeting> sprintDailyMeetings;

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
                .build();

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
                                    .sprint(sprint)
                                    .name(sprintDailyMeeting.getName())
                                    .startTime(LocalTime.parse(sprintDailyMeeting.getStartTime()))
                                    .endTime(LocalTime.parse(sprintDailyMeeting.getEndTime()))
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


        sprint.setUsers(sprintUsers);
        sprint.setSprintDailyMeetings(meetings);

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
        private String name;
        private String startTime;
        private String endTime;
        private Boolean useQuestion;
        private Boolean onHoliday;
        private String days;
        private List<SprintRequest.SprintDailyMeetingQuestion> sprintDailyMeetingQuestions;

    }

    @Data
    @Builder
    public static class SprintDailyMeetingQuestion {
        private Long id;
        private String question;
        private Integer sortOrder;
    }


}
