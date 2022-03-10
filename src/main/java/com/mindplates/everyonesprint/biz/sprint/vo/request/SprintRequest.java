package com.mindplates.everyonesprint.biz.sprint.vo.request;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.sprint.entity.*;
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
    private List<SprintUserRequest> users;
    private List<ScrumMeetingPlanRequest> scrumMeetingPlans;
    private List<SmallTalkMeetingPlanRequest> smallTalkMeetingPlans;

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


        List<SmallTalkMeetingPlan> smallTalkMeetings = smallTalkMeetingPlans
                .stream()
                .map((smallTalkMeetingPlan) -> {
                            SmallTalkMeetingPlan meeting = SmallTalkMeetingPlan.builder()
                                    .id(smallTalkMeetingPlan.getId())
                                    .CRUD(smallTalkMeetingPlan.getCRUD())
                                    .sprint(sprint)
                                    .name(smallTalkMeetingPlan.getName())
                                    .startTime(smallTalkMeetingPlan.getStartTime().toLocalTime())
                                    .endTime(smallTalkMeetingPlan.getEndTime().toLocalTime())
                                    .limitUserCount(smallTalkMeetingPlan.getLimitUserCount())
                                    .onHoliday(smallTalkMeetingPlan.getOnHoliday())
                                    .days(smallTalkMeetingPlan.getDays())
                                    .build();


                            return meeting;


                        }
                ).collect(Collectors.toList());


        sprint.setUsers(sprintUsers);
        sprint.setScrumMeetingPlans(meetings);
        sprint.setSmallTalkMeetingPlans(smallTalkMeetings);

        return sprint;
    }





}
