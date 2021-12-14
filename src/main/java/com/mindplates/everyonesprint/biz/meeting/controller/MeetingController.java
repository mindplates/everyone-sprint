package com.mindplates.everyonesprint.biz.meeting.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.vo.request.MeetingRequest;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingListResponse;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/meetings")
public class MeetingController {
    @Autowired
    MeetingService meetingService;

    @Autowired
    SprintService sprintService;

    @Autowired
    SessionUtil sessionUtil;

    private void checkIsMember(UserSession userSession, Sprint sprint) {
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @PostMapping("")
    public MeetingResponse createMeetingInfo(@Valid @RequestBody MeetingRequest meetingRequest, UserSession userSession) {
        Meeting meeting = meetingRequest.buildEntity();
        meetingService.createMeetingInfo(meeting, userSession);
        return new MeetingResponse(meeting);
    }

    @PutMapping("/{id}")
    public MeetingResponse updateMeetingInfo(@PathVariable Long id, @Valid @RequestBody MeetingRequest meetingRequest, UserSession userSession) {

        if (!id.equals(meetingRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Sprint sprint = sprintService.selectSprintInfo(meetingRequest.getSprintId());
        checkIsMember(userSession, sprint);
        Meeting meeting = meetingService.selectMeetingInfo(id);

        Meeting meetingInfo = meetingRequest.buildEntity();
        meetingService.updateMeetingInfo(meetingInfo, userSession);
        return new MeetingResponse(meeting);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteMeetingInfo(@PathVariable Long id, UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(id);
        if (!userSession.getId().equals(meeting.getCreatedBy())) {
            throw new ServiceException("common.not.authorized");
        }
        meetingService.deleteMeetingInfo(meeting);
        return new ResponseEntity(HttpStatus.OK);
    }

    @GetMapping("")
    public List<MeetingResponse> selectUserMeetingList(UserSession userSession) {
        List<Meeting> meetings = meetingService.selectUserMeetingList(userSession);
        return meetings.stream().map(MeetingResponse::new).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public MeetingResponse selectMeetingInfo(@PathVariable Long id, UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(id);
        checkIsMember(userSession, meeting.getSprint());
        return new MeetingResponse(meeting);
    }


}
