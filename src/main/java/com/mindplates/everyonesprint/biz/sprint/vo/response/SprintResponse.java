package com.mindplates.everyonesprint.biz.sprint.vo.response;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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
    private List<SprintUserResponse> users;
    private List<ScrumMeetingPlanResponse> scrumMeetingPlans;
    private List<SmallTalkMeetingPlanResponse> smallTalkMeetingPlans;
    private Boolean closed;

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
        this.closed = sprint.getClosed();
        this.users = sprint.getUsers().stream().map(
                (sprintUser) -> SprintUserResponse.builder()
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
                        (scrumMeetingPlan) -> ScrumMeetingPlanResponse.builder()
                                .id(scrumMeetingPlan.getId())
                                .name(scrumMeetingPlan.getName())
                                .startTime(scrumMeetingPlan.getStartTime())
                                .endTime(scrumMeetingPlan.getEndTime())
                                .useQuestion(scrumMeetingPlan.getUseQuestion())
                                .onHoliday(scrumMeetingPlan.getOnHoliday())
                                .days(scrumMeetingPlan.getDays())
                                .scrumMeetingQuestions((scrumMeetingPlan.getScrumMeetingQuestions().stream()
                                        .map((scrumMeetingPlanQuestion -> ScrumMeetingQuestionResponse.builder()
                                                .id(scrumMeetingPlanQuestion.getId())
                                                .question(scrumMeetingPlanQuestion.getQuestion())
                                                .sortOrder(scrumMeetingPlanQuestion.getSortOrder())
                                                .build()))
                                        .collect(Collectors.toList())))
                                .build()
                ).collect(Collectors.toList());

        this.smallTalkMeetingPlans = sprint.getSmallTalkMeetingPlans()
                .stream()
                .map(
                        (smallTalkMeetingPlan) -> SmallTalkMeetingPlanResponse.builder()
                                .id(smallTalkMeetingPlan.getId())
                                .name(smallTalkMeetingPlan.getName())
                                .limitUserCount(smallTalkMeetingPlan.getLimitUserCount())
                                .startTime(smallTalkMeetingPlan.getStartTime())
                                .endTime(smallTalkMeetingPlan.getEndTime())
                                .onHoliday(smallTalkMeetingPlan.getOnHoliday())
                                .days(smallTalkMeetingPlan.getDays())
                                .build()
                ).collect(Collectors.toList());

        if (sprint.getProject() != null) {
            this.projectId = sprint.getProject().getId();
            this.projectName = sprint.getProject().getName();
        }

    }


}
