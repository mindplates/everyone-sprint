package com.mindplates.everyonesprint.biz.sprint.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingSummaryResponse;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeeting;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeetingAnswer;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.sprint.vo.request.SprintDailyMeetingAnswerRequest;
import com.mindplates.everyonesprint.biz.sprint.vo.request.SprintRequest;
import com.mindplates.everyonesprint.biz.sprint.vo.response.*;
import com.mindplates.everyonesprint.common.code.RoleCode;
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

    private void checkIsAdminUser(UserSession userSession, Sprint sprint) {
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()) && sprintUser.getRole().equals(RoleCode.ADMIN))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @Operation(description = "사용자의 스프린트 목록 조회")
    @GetMapping("")
    public List<SprintListResponse> selectUserSprintList(@RequestParam(value = "date", required = false) LocalDate date, @RequestParam(value = "startDate", required = false) LocalDateTime startDate, @ApiIgnore UserSession userSession) {
        List<Sprint> sprints = sprintService.selectUserSprintList(userSession);
        return sprints.stream().map((sprint -> {
            SprintListResponse item = new SprintListResponse(sprint);
            item.setIsMember(sprint.getUsers().stream().anyMatch((sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))));
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

        Sprint alreadySprint = sprintService.selectByName(sprintRequest.getName());
        if (alreadySprint != null) {
            throw new ServiceException("sprint.duplicated");
        }

        Sprint sprint = sprintRequest.buildEntity();
        return new SprintResponse(sprintService.createSprintInfo(sprint, userSession));
    }

    @Operation(description = "스프린트 수정")
    @PutMapping("/{id}")
    public SprintResponse updateSprintInfo(@PathVariable Long id, @Valid @RequestBody SprintRequest sprintRequest, @ApiIgnore UserSession userSession) {

        if (!id.equals(sprintRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Sprint sprint = sprintService.selectSprintInfo(id);
        checkIsAdminUser(userSession, sprint);
        Sprint sprintInfo = sprintRequest.buildEntity();
        return new SprintResponse(sprintService.updateSprintInfo(sprintInfo, userSession));
    }

    @Operation(description = "스프린트 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteSprintInfo(@PathVariable Long id, @ApiIgnore UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(id);
        checkIsAdminUser(userSession, sprint);
        sprintService.deleteSprintInfo(sprint);
        return new ResponseEntity(HttpStatus.OK);
    }


    @Operation(description = "스프린트 조회")
    @GetMapping("/{id}")
    public SprintResponse selectSprintInfo(@PathVariable Long id, @ApiIgnore UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(id);
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
        return new SprintResponse(sprint);
    }

    @Operation(description = "특정일의 스프린트 정보 요약")
    @GetMapping("/{id}/board")
    public SprintBoardResponse selectSprintBoard(@PathVariable Long id,
                                                 @RequestParam("start") LocalDateTime start,
                                                 @RequestParam("end") LocalDateTime end,
                                                 @RequestParam("date") LocalDate date,
                                                 @ApiIgnore UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(id);
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }

        List<Long> sprintDailyMeetingIds = sprint.getSprintDailyMeetings().stream().map(SprintDailyMeeting::getId).collect(Collectors.toList());
        List<Meeting> dailyMeetings = meetingService.selectSprintUserScrumMeetingList(userSession.getId(), sprintDailyMeetingIds, start, end);
        List<Meeting> noDailyMeetings = meetingService.selectSprintNotScrumMeetingList(userSession.getId(), start, end);
        List<SprintDailyMeetingAnswer> sprintDailyMeetingAnswers = sprintService.selectSprintDailyMeetingAnswerList(id, date);

        return SprintBoardResponse.builder()
                .dailyMeetings(dailyMeetings.stream().map(MeetingResponse::new).collect(Collectors.toList()))
                .meetings(noDailyMeetings.stream().map(MeetingResponse::new).collect(Collectors.toList()))
                .sprintDailyMeetingAnswers(sprintDailyMeetingAnswers.stream().map(SprintDailyMeetingAnswerResponse::new).collect(Collectors.toList()))
                .build();
    }


    @GetMapping("/{id}/answers")
    public List<SprintDailyMeetingAnswerResponse> selectSprintDailyMeetingAnswers(@PathVariable Long id,
                                                                                  @RequestParam("date") LocalDate date,
                                                                                  @ApiIgnore UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(id);
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }

        List<SprintDailyMeetingAnswer> sprintDailyMeetingAnswers = sprintService.selectSprintDailyMeetingAnswerList(id, date);

        return sprintDailyMeetingAnswers.stream().map(SprintDailyMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{sprintId}/meetings/{meetingId}/answers/latest")
    public List<SprintDailyMeetingAnswerResponse> selectLatestSprintDailyMeetingAnswers(@PathVariable Long sprintId,
                                                                                        @PathVariable Long meetingId,
                                                                                        @RequestParam("date") LocalDate date,
                                                                                        @ApiIgnore UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(sprintId);
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }

        List<SprintDailyMeetingAnswer> sprintDailyMeetingAnswers = sprintService.selectLastUserSprintDailyMeetingAnswerList(sprintId, meetingId, userSession.getId(), date);

        return sprintDailyMeetingAnswers.stream().map(SprintDailyMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{sprintId}/meetings/{meetingId}/answers")
    public List<SprintDailyMeetingAnswerResponse> selectSprintDailyMeetingAnswers(@PathVariable Long sprintId,
                                                                                  @PathVariable Long meetingId,
                                                                                  @RequestParam("date") LocalDate date,
                                                                                  @ApiIgnore UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(sprintId);
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }

        List<SprintDailyMeetingAnswer> sprintDailyMeetingAnswers = sprintService.selectSprintDailyMeetingAnswerList(sprintId, meetingId, date);

        return sprintDailyMeetingAnswers.stream().map(SprintDailyMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @PostMapping("/{id}/answers")
    public List<SprintDailyMeetingAnswerResponse> createSprintDailyMeetingAnswers(
            @Valid @RequestBody List<SprintDailyMeetingAnswerRequest> sprintDailyMeetingAnswerRequests,
            @RequestParam("date") LocalDate date,
            @PathVariable Long id,
            @ApiIgnore UserSession userSession) {

        Sprint sprint = sprintService.selectSprintInfo(id);
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }

        List<SprintDailyMeetingAnswer> sprintDailyMeetingUserAnswers = sprintDailyMeetingAnswerRequests.stream().map((sprintDailyMeetingAnswerRequest -> sprintDailyMeetingAnswerRequest.buildEntity(userSession.getId()))).collect(Collectors.toList());
        return (sprintService.createSprintDailyMeetingAnswers(sprintDailyMeetingUserAnswers, userSession)).stream().map(SprintDailyMeetingAnswerResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{id}/summary")
    public SprintSummaryResponse selectSprintSummary(@PathVariable Long id, @ApiIgnore UserSession userSession) {

        Sprint sprint = sprintService.selectSprintInfo(id);
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }

        List<Meeting> meetings = meetingService.selectSprintMeetingList(id);

        SprintSummaryResponse response = new SprintSummaryResponse();
        response.meetings = meetings.stream()
                .map(MeetingSummaryResponse::new)
                .collect(Collectors.toList());

        return response;
    }


    @GetMapping("/{id}/scrums")
    public List<SprintDailyMeetingResponse> selectSprintDailyMeetingList(@PathVariable Long id, @RequestParam("date") LocalDate date, @RequestParam(value = "startDate", required = false) LocalDateTime startDate, @ApiIgnore UserSession userSession) {

        Sprint sprint = sprintService.selectSprintInfo(id);
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }

        LocalDateTime endDate = startDate.plusDays(1).minusSeconds(1);
        List<Meeting> meetings = meetingService.selectSprintScrumMeetingList(id, startDate, endDate);
        List<SprintDailyMeeting> sprintDailyMeetings = meetings.stream().map(Meeting::getSprintDailyMeeting).distinct().collect(Collectors.toList());
        List<SprintDailyMeetingResponse> sprintDailyMeetingResponses = new ArrayList<>();
        sprintDailyMeetings.forEach(sprintDailyMeeting ->
                sprintDailyMeetingResponses.add(new SprintDailyMeetingResponse(sprintDailyMeeting, sprintService.selectSprintDailyMeetingAnswerList(id, sprintDailyMeeting.getId(), date)))
        );

        return sprintDailyMeetingResponses;
    }


}
