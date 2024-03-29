package com.mindplates.everyonesprint.biz.sprint.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingSummaryResponse;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingAnswer;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingPlan;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.sprint.vo.request.ScrumMeetingAnswerRequest;
import com.mindplates.everyonesprint.biz.sprint.vo.request.SprintRequest;
import com.mindplates.everyonesprint.biz.sprint.vo.response.*;
import com.mindplates.everyonesprint.common.code.MeetingTypeCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.annotation.CheckSprintAdminAuth;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/{spaceCode}/sprints")
@AllArgsConstructor
public class SprintController {

    final private SprintService sprintService;
    final private MeetingService meetingService;

    @Operation(description = "사용자의 스프린트 목록 조회")
    @GetMapping("")
    public List<SprintListResponse> selectUserSprintList(@PathVariable String spaceCode, @RequestParam(value = "date", required = false) LocalDate date, @RequestParam(value = "startDate", required = false) LocalDateTime startDate, @ApiIgnore UserSession userSession) {
        List<Sprint> sprints = sprintService.selectUserSprintList(spaceCode, userSession, false);
        return sprints.stream().map((sprint -> {
            SprintListResponse item = new SprintListResponse(sprint);
            if (startDate != null && date != null) {
                LocalDateTime endDate = startDate.plusDays(1).minusSeconds(1);
                if (meetingService.selectHasSprintMeeting(item.getId(), startDate, endDate)) {
                    item.setHasScrumMeeting(true);
                    item.setIsUserScrumInfoRegistered(sprintService.selectIsSprintUserScrumInfoRegistered(sprint.getId(), date, userSession.getId()));
                }
            }
            return item;
        })).collect(Collectors.toList());
    }

    @Operation(description = "스프린트 생성")
    @PostMapping("")
    public SprintResponse createSprintInfo(@PathVariable String spaceCode, @Valid @RequestBody SprintRequest sprintRequest, @ApiIgnore UserSession userSession) {

        if (sprintService.selectIsExistProjectSprintName(spaceCode, sprintRequest.getProjectId(), sprintRequest.getId(), sprintRequest.getName())) {
            throw new ServiceException("sprint.duplicated");
        }

        Sprint sprint = sprintRequest.buildEntity();
        sprint.setClosed(false);
        return new SprintResponse(sprintService.createSprintInfo(spaceCode, sprintRequest.getProjectId(), sprint, userSession));
    }

    @Operation(description = "스프린트 닫기")
    @PutMapping("/{sprintId}/close")
    public SprintResponse updateSprintClosed(@PathVariable String spaceCode, @PathVariable Long sprintId, @ApiIgnore UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(sprintId).get();
        sprint.setClosed(true);
        return new SprintResponse(sprintService.updateSprintInfo(spaceCode, sprint, userSession));
    }

    @Operation(description = "스프린트 열기")
    @PutMapping("/{sprintId}/open")
    public SprintResponse updateSprintOpened(@PathVariable String spaceCode, @PathVariable Long sprintId, @ApiIgnore UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(sprintId).get();
        sprint.setClosed(false);
        return new SprintResponse(sprintService.updateSprintInfo(spaceCode, sprint, userSession));
    }

    @Operation(description = "스프린트 수정")
    @PutMapping("/{sprintId}")
    @CheckSprintAdminAuth
    public SprintResponse updateSprintInfo(@PathVariable String spaceCode, @PathVariable Long sprintId, @Valid @RequestBody SprintRequest sprintRequest, @ApiIgnore UserSession userSession) {

        if (!sprintId.equals(sprintRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        if (sprintService.selectIsExistProjectSprintName(spaceCode, sprintRequest.getProjectId(), sprintRequest.getId(), sprintRequest.getName())) {
            throw new ServiceException("sprint.duplicated");
        }

        Sprint sprintInfo = sprintRequest.buildEntity();
        Sprint sprint = sprintService.selectSprintInfo(sprintId).get();
        sprintInfo.setClosed(sprint.getClosed());
        sprintInfo.setRealEndDate(sprint.getRealEndDate());

        return new SprintResponse(sprintService.updateSprintInfo(spaceCode, sprintInfo, userSession));
    }

    @Operation(description = "스프린트 삭제")
    @DeleteMapping("/{sprintId}")
    @CheckSprintAdminAuth
    public ResponseEntity<?> deleteSprintInfo(@PathVariable String spaceCode, @PathVariable Long sprintId) {
        Optional<Sprint> sprint = sprintService.selectSprintInfo(sprintId);
        sprintService.deleteSprintInfo(spaceCode, sprint.get().getProject().getId(), sprintId);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @Operation(description = "스프린트 조회")
    @GetMapping("/{sprintId}")
    public SprintResponse selectSprintInfo(@PathVariable String spaceCode, @PathVariable Long sprintId, @ApiIgnore UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(sprintId).get();
        return new SprintResponse(sprint, userSession);
    }

    @Operation(description = "특정일의 스프린트 정보 요약")
    @GetMapping("/{sprintId}/daily")
    public SprintBoardResponse selectSprintBoard(@PathVariable String spaceCode, @PathVariable Long sprintId,
                                                 @RequestParam("start") LocalDateTime start,
                                                 @RequestParam("end") LocalDateTime end,
                                                 @RequestParam("date") LocalDate date,
                                                 @ApiIgnore UserSession userSession) {

        Sprint sprint = sprintService.selectSprintInfo(sprintId).get();
        List<Long> scrumMeetingPlanIds = sprint.getScrumMeetingPlans().stream().map(ScrumMeetingPlan::getId).collect(Collectors.toList());
        List<Meeting> scrumMeetings = meetingService.selectSprintUserScrumMeetingList(userSession.getId(), scrumMeetingPlanIds, start, end);
        List<Meeting> noDailyMeetings = meetingService.selectSprintNotScrumMeetingList(userSession.getId(), start, end);
        List<ScrumMeetingAnswer> scrumMeetingAnswers = sprintService.selectSprintDailyMeetingAnswerList(sprintId, date);

        return SprintBoardResponse.builder()
                .scrumMeetings(scrumMeetings.stream().map(MeetingResponse::new).collect(Collectors.toList()))
                .meetings(noDailyMeetings.stream().map(MeetingResponse::new).collect(Collectors.toList()))
                .scrumMeetingAnswers(scrumMeetingAnswers.stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList()))
                .build();
    }


    @GetMapping("/{id}/answers")
    public List<ScrumMeetingAnswerResponse> selectSprintDailyMeetingAnswers(@PathVariable String spaceCode, @PathVariable Long id,
                                                                            @RequestParam("date") LocalDate date) {
        List<ScrumMeetingAnswer> scrumMeetingAnswers = sprintService.selectSprintDailyMeetingAnswerList(id, date);

        return scrumMeetingAnswers.stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{sprintId}/meetings/{meetingId}/answers/latest")
    public List<ScrumMeetingAnswerResponse> selectLatestSprintDailyMeetingAnswers(@PathVariable String spaceCode, @PathVariable Long sprintId,
                                                                                  @PathVariable Long meetingId,
                                                                                  @RequestParam("date") LocalDate date,
                                                                                  @ApiIgnore UserSession userSession) {
        List<ScrumMeetingAnswer> scrumMeetingAnswers = sprintService.selectLastUserSprintDailyMeetingAnswerList(sprintId, meetingId, userSession.getId(), date);
        return scrumMeetingAnswers.stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{sprintId}/meetings/{meetingId}/answers")
    public List<ScrumMeetingAnswerResponse> selectSprintDailyMeetingAnswers(@PathVariable String spaceCode, @PathVariable Long sprintId,
                                                                            @PathVariable Long meetingId,
                                                                            @RequestParam("date") LocalDate date) {
        List<ScrumMeetingAnswer> scrumMeetingAnswers = sprintService.selectSprintDailyMeetingAnswerList(sprintId, meetingId, date);

        return scrumMeetingAnswers.stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @PostMapping("/{sprintId}/answers")
    public List<ScrumMeetingAnswerResponse> createSprintDailyMeetingAnswers(@PathVariable String spaceCode, @PathVariable Long sprintId,
                                                                            @Valid @RequestBody List<ScrumMeetingAnswerRequest> scrumMeetingPlanAnswerRequests,
                                                                            @ApiIgnore UserSession userSession) {

        List<ScrumMeetingAnswer> scrumMeetingPlanUserAnswers = scrumMeetingPlanAnswerRequests.stream().map((scrumMeetingPlanAnswerRequest -> scrumMeetingPlanAnswerRequest.buildEntity(userSession.getId()))).collect(Collectors.toList());
        return (sprintService.createSprintDailyMeetingAnswers(scrumMeetingPlanUserAnswers, userSession)).stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{sprintId}/summary")
    public SprintSummaryResponse selectSprintSummary(@PathVariable String spaceCode, @PathVariable Long sprintId) {
        List<Meeting> meetings = meetingService.selectSprintMeetingList(sprintId);
        List<Map<String, Object>> userScrumAnswerCount = sprintService.selectUserScrumMeetingAnswerCount(sprintId);

        SprintSummaryResponse response = new SprintSummaryResponse();
        response.meetings = meetings.stream()
                .map(MeetingSummaryResponse::new)
                .map((meetingSummaryResponse -> {

                    if (meetingSummaryResponse.getType().equals(MeetingTypeCode.SCRUM)) {
                        meetingSummaryResponse.getUsers().stream().forEach((user -> {

                            Map<String, Object> userDate = new HashMap<>();
                            userDate.put("userId", user.getUserId());
                            userDate.put("date", meetingSummaryResponse.getStartDate().toLocalDate());
                            if (userScrumAnswerCount.contains(userDate)) {
                                user.setAnswerCount(1L);
                            }
                        }));
                    }

                    return meetingSummaryResponse;

                }))
                .collect(Collectors.toList());

        return response;
    }


    @GetMapping("/{sprintId}/scrums")
    public List<SprintDailyMeetingResponse> selectSprintDailyMeetingList(@PathVariable String spaceCode, @PathVariable Long sprintId, @RequestParam("date") LocalDate date, @RequestParam(value = "startDate", required = false) LocalDateTime startDate) {
        LocalDateTime endDate = startDate.plusDays(1).minusSeconds(1);
        List<Meeting> meetings = meetingService.selectSprintScrumMeetingList(sprintId, startDate, endDate);
        List<ScrumMeetingPlan> scrumMeetingPlans = meetings.stream().map(Meeting::getScrumMeetingPlan).distinct().collect(Collectors.toList());
        List<SprintDailyMeetingResponse> scrumMeetingPlanResponses = new ArrayList<>();
        scrumMeetingPlans.forEach(scrumMeetingPlan ->
                scrumMeetingPlanResponses.add(new SprintDailyMeetingResponse(scrumMeetingPlan, sprintService.selectSprintDailyMeetingAnswerList(sprintId, scrumMeetingPlan.getId(), date)))
        );

        return scrumMeetingPlanResponses;
    }


}
