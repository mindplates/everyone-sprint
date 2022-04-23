package com.mindplates.everyonesprint.biz.meeting.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.meeting.vo.request.MeetingRequest;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.annotation.CheckSprintAuth;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/{spaceCode}/meetings")
public class MeetingController {

    final private MeetingService meetingService;

    final private ParticipantService participantService;

    public MeetingController(MeetingService meetingService, ParticipantService participantService) {
        this.meetingService = meetingService;
        this.participantService = participantService;
    }


    @Operation(description = "사용자가 참석 가능한 미팅 목록 조회")
    @GetMapping("")
    @CheckSprintAuth
    public List<MeetingResponse> selectUserMeetingList(@PathVariable String spaceCode, @RequestParam(value = "sprintId", required = false) Long sprintId, @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date, @ApiIgnore UserSession userSession) {
        List<Meeting> meetings = meetingService.selectUserMeetingList(spaceCode, sprintId, date, userSession);
        return meetings.stream().map(MeetingResponse::new).collect(Collectors.toList());
    }

    @Operation(description = "미팅 생성")
    @PostMapping("")
    @CheckSprintAuth
    public MeetingResponse createMeetingInfo(@PathVariable String spaceCode, @Valid @RequestBody MeetingRequest meetingRequest, UserSession userSession) {
        Meeting meeting = meetingRequest.buildEntity();
        return new MeetingResponse(meetingService.createMeetingInfo(meeting, userSession));
    }

    @Operation(description = "특정일자의 미팅 목록 조회")
    @GetMapping("/day")
    @CheckSprintAuth
    public List<MeetingResponse> selectUserMeetingListWithConnectionCount(@PathVariable String spaceCode, @RequestParam(value = "sprintId", required = false) Long sprintId, @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date, @ApiIgnore UserSession userSession) {

        List<Meeting> meetings = meetingService.selectUserMeetingList(spaceCode, sprintId, date, userSession);
        return meetings.stream().map(MeetingResponse::new).peek((meetingResponse -> {
            meetingResponse.setConnectedUserCount(participantService.countByCodeAndConnectedTrue(meetingResponse.getCode()));
        })).collect(Collectors.toList());
    }

    @Operation(description = "미팅 정보 변경")
    @PutMapping("/{id}")
    public MeetingResponse updateMeetingInfo(@PathVariable String spaceCode, @PathVariable Long id, @Valid @RequestBody MeetingRequest meetingRequest, @ApiIgnore UserSession userSession) {

        if (!id.equals(meetingRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Meeting meeting = meetingService.selectMeetingInfo(id).get();
        meeting.setSprint(Sprint.builder().id(meetingRequest.getSprintId()).build());
        meeting.setName(meetingRequest.getName());
        meeting.setType(meetingRequest.getType());
        meeting.setLimitUserCount(meetingRequest.getLimitUserCount());
        meeting.setStartDate(meetingRequest.getStartDate());
        meeting.setEndDate(meetingRequest.getEndDate());
        meeting.getUsers().clear();
        meeting.getUsers().addAll(meetingRequest.getUsers().stream().map(
                (user) -> MeetingUser.builder()
                        .id(user.getId())
                        .user(com.mindplates.everyonesprint.biz.user.entity.User.builder()
                                .id(user.getUserId()).build())
                        .meeting(meeting).build()).collect(Collectors.toList()));


        return new MeetingResponse(meetingService.updateMeetingInfo(meeting, userSession));
    }

    @Operation(description = "미팅 정보 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMeetingInfo(@PathVariable String spaceCode, @PathVariable Long id, @ApiIgnore UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (!userSession.getId().equals(meeting.getCreatedBy())) {
            throw new ServiceException("common.not.authorized");
        }
        meetingService.deleteMeetingInfo(meeting);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "미팅 정보 조회")
    @GetMapping("/{id}")
    public MeetingResponse selectMeetingInfo(@PathVariable String spaceCode, @PathVariable Long id) {
        return new MeetingResponse(meetingService.selectMeetingInfo(id).get());
    }
}
