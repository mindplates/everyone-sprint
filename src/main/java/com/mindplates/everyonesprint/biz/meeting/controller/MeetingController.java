package com.mindplates.everyonesprint.biz.meeting.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.meeting.vo.request.MeetingRequest;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    final private MeetingService meetingService;
    final private SprintService sprintService;
    final private ParticipantService participantService;

    public MeetingController(MeetingService meetingService, SprintService sprintService, ParticipantService participantService) {
        this.meetingService = meetingService;
        this.sprintService = sprintService;
        this.participantService = participantService;
    }

    private void checkIsMember(UserSession userSession, Sprint sprint) {
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @PostMapping("")
    public MeetingResponse createMeetingInfo(@Valid @RequestBody MeetingRequest meetingRequest, UserSession userSession) {
        Meeting meeting = meetingRequest.buildEntity();
        return new MeetingResponse(meetingService.createMeetingInfo(meeting, userSession));
    }

    @PutMapping("/{id}")
    public MeetingResponse updateMeetingInfo(@PathVariable Long id, @Valid @RequestBody MeetingRequest meetingRequest, UserSession userSession) {

        if (!id.equals(meetingRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        meetingService.selectMeetingInfo(id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        Sprint sprint = sprintService.selectSprintInfo(meetingRequest.getSprintId());
        checkIsMember(userSession, sprint);

        Meeting meetingInfo = meetingRequest.buildEntity();
        return new MeetingResponse(meetingService.updateMeetingInfo(meetingInfo, userSession));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteMeetingInfo(@PathVariable Long id, UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (!userSession.getId().equals(meeting.getCreatedBy())) {
            throw new ServiceException("common.not.authorized");
        }
        meetingService.deleteMeetingInfo(meeting);
        return new ResponseEntity(HttpStatus.OK);
    }

    @GetMapping("")
    public List<MeetingResponse> selectUserMeetingList(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date, @RequestParam(value = "sprintId", required = false) Long sprintId, UserSession userSession) {
        List<Meeting> meetings = meetingService.selectUserMeetingList(sprintId, date, userSession);
        return meetings.stream().map(MeetingResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/today")
    public List<MeetingResponse> selectUserMeetingListWithConnectionCount(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date, @RequestParam(value = "sprintId", required = false) Long sprintId, UserSession userSession) {
        List<Meeting> meetings = meetingService.selectUserMeetingList(sprintId, date, userSession);
        return meetings.stream().map(MeetingResponse::new).peek((meetingResponse -> {
            meetingResponse.setConnectedUserCount(participantService.countByCodeAndConnectedTrue(meetingResponse.getCode()));
        })).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public MeetingResponse selectMeetingInfo(@PathVariable Long id, UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        checkIsMember(userSession, meeting.getSprint());
        return new MeetingResponse(meeting);
    }
}
