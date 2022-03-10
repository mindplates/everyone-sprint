package com.mindplates.everyonesprint.biz.sprint.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingSummaryResponse;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingPlan;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingAnswer;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.sprint.vo.request.ScrumMeetingAnswerRequest;
import com.mindplates.everyonesprint.biz.sprint.vo.request.SprintRequest;
import com.mindplates.everyonesprint.biz.sprint.vo.response.*;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    final private SprintService sprintService;
    final private MeetingService meetingService;

    public SprintController(SprintService sprintService, MeetingService meetingService) {
        this.sprintService = sprintService;
        this.meetingService = meetingService;
    }

    @Operation(description = "사용자의 스프린트 목록 조회")
    @GetMapping("")
    public List<SprintListResponse> selectUserSprintList(@RequestParam(value = "date", required = false) LocalDate date, @RequestParam(value = "startDate", required = false) LocalDateTime startDate, @ApiIgnore UserSession userSession) {
        List<Sprint> sprints = sprintService.selectUserSprintList(userSession, false);
        return sprints.stream().map((sprint -> {
            SprintListResponse item = new SprintListResponse(sprint, userSession);
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
    public SprintResponse createSprintInfo(@Valid @RequestBody SprintRequest sprintRequest, @ApiIgnore UserSession userSession) {

        if (sprintService.selectIsExistProjectSprintName(sprintRequest.getProjectId(), sprintRequest.getId(), sprintRequest.getName())) {
            throw new ServiceException("sprint.duplicated");
        }

        Sprint sprint = sprintRequest.buildEntity();
        sprint.setClosed(false);
        return new SprintResponse(sprintService.createSprintInfo(sprint, userSession));
    }

    @Operation(description = "스프린트 닫기")
    @PutMapping("/{sprintId}/close")
    public SprintResponse updateSprintClosed(@PathVariable Long sprintId, @Valid @RequestBody SprintRequest sprintRequest, @ApiIgnore UserSession userSession) {

        if (!sprintId.equals(sprintRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Sprint sprint = sprintService.selectSprintInfo(sprintId).get();
        sprint.setClosed(true);
        return new SprintResponse(sprintService.updateSprintInfo(sprint, userSession));
    }

    @Operation(description = "스프린트 수정")
    @PutMapping("/{sprintId}")
    public SprintResponse updateSprintInfo(@PathVariable Long sprintId, @Valid @RequestBody SprintRequest sprintRequest, @ApiIgnore UserSession userSession) {

        if (!sprintId.equals(sprintRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        if (sprintService.selectIsExistProjectSprintName(sprintRequest.getProjectId(), sprintRequest.getId(), sprintRequest.getName())) {
            throw new ServiceException("sprint.duplicated");
        }

        Sprint sprintInfo = sprintRequest.buildEntity();
        Sprint sprint = sprintService.selectSprintInfo(sprintId).get();
        sprintInfo.setClosed(sprint.getClosed());
        sprintInfo.setRealEndDate(sprint.getRealEndDate());

        return new SprintResponse(sprintService.updateSprintInfo(sprintInfo, userSession));
    }

    @Operation(description = "스프린트 삭제")
    @DeleteMapping("/{sprintId}")
    public ResponseEntity deleteSprintInfo(@PathVariable Long sprintId) {
        sprintService.deleteSprintInfo(sprintId);
        return new ResponseEntity(HttpStatus.OK);
    }


    @Operation(description = "스프린트 조회")
    @GetMapping("/{sprintId}")
    public SprintResponse selectSprintInfo(@PathVariable Long sprintId) {
        Sprint sprint = sprintService.selectSprintInfo(sprintId).get();
        return new SprintResponse(sprint);
    }

    @Operation(description = "특정일의 스프린트 정보 요약")
    @GetMapping("/{sprintId}/daily")
    public SprintBoardResponse selectSprintBoard(@PathVariable Long sprintId,
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
                .scrumMeetingPlanAnswers(scrumMeetingAnswers.stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList()))
                .build();
    }


    @GetMapping("/{id}/answers")
    public List<ScrumMeetingAnswerResponse> selectSprintDailyMeetingAnswers(@PathVariable Long id,
                                                                            @RequestParam("date") LocalDate date) {
        List<ScrumMeetingAnswer> scrumMeetingAnswers = sprintService.selectSprintDailyMeetingAnswerList(id, date);

        return scrumMeetingAnswers.stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{sprintId}/meetings/{meetingId}/answers/latest")
    public List<ScrumMeetingAnswerResponse> selectLatestSprintDailyMeetingAnswers(@PathVariable Long sprintId,
                                                                                  @PathVariable Long meetingId,
                                                                                  @RequestParam("date") LocalDate date,
                                                                                  @ApiIgnore UserSession userSession) {
        List<ScrumMeetingAnswer> scrumMeetingAnswers = sprintService.selectLastUserSprintDailyMeetingAnswerList(sprintId, meetingId, userSession.getId(), date);
        return scrumMeetingAnswers.stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{sprintId}/meetings/{meetingId}/answers")
    public List<ScrumMeetingAnswerResponse> selectSprintDailyMeetingAnswers(@PathVariable Long sprintId,
                                                                            @PathVariable Long meetingId,
                                                                            @RequestParam("date") LocalDate date) {
        List<ScrumMeetingAnswer> scrumMeetingAnswers = sprintService.selectSprintDailyMeetingAnswerList(sprintId, meetingId, date);

        return scrumMeetingAnswers.stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @PostMapping("/{sprintId}/answers")
    public List<ScrumMeetingAnswerResponse> createSprintDailyMeetingAnswers(@PathVariable Long sprintId,
                                                                            @Valid @RequestBody List<ScrumMeetingAnswerRequest> scrumMeetingPlanAnswerRequests,
                                                                            @ApiIgnore UserSession userSession) {

        List<ScrumMeetingAnswer> scrumMeetingPlanUserAnswers = scrumMeetingPlanAnswerRequests.stream().map((scrumMeetingPlanAnswerRequest -> scrumMeetingPlanAnswerRequest.buildEntity(userSession.getId()))).collect(Collectors.toList());
        return (sprintService.createSprintDailyMeetingAnswers(scrumMeetingPlanUserAnswers, userSession)).stream().map(ScrumMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{sprintId}/summary")
    public SprintSummaryResponse selectSprintSummary(@PathVariable Long sprintId) {
        List<Meeting> meetings = meetingService.selectSprintMeetingList(sprintId);
        SprintSummaryResponse response = new SprintSummaryResponse();
        response.meetings = meetings.stream()
                .map(MeetingSummaryResponse::new)
                .collect(Collectors.toList());

        return response;
    }


    @GetMapping("/{sprintId}/scrums")
    public List<SprintDailyMeetingResponse> selectSprintDailyMeetingList(@PathVariable Long sprintId, @RequestParam("date") LocalDate date, @RequestParam(value = "startDate", required = false) LocalDateTime startDate) {
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
