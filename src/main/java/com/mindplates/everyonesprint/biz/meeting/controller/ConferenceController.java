package com.mindplates.everyonesprint.biz.meeting.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/conferences")
public class ConferenceController {
    @Autowired
    MeetingService meetingService;

    @Autowired
    SprintService sprintService;

    @Autowired
    ParticipantService participantService;


    @Autowired
    SessionUtil sessionUtil;

    private void checkIsMeetingMember(UserSession userSession, List<MeetingUser> users) {
        if (users.stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException(HttpStatus.FORBIDDEN, "common.no.member");
        }
    }

    @GetMapping("/{code}")
    public MeetingResponse selectMeetingInfo(@PathVariable String code, UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        checkIsMeetingMember(userSession, meeting.getUsers());
        return new MeetingResponse(meeting);
    }


    @GetMapping("/{code}/users")
    public Iterable<Participant> selectMyInfo(@PathVariable String code, UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        checkIsMeetingMember(userSession, meeting.getUsers());
        Participant participant = Participant.builder().code(code).build();
        Iterable<Participant> users = participantService.findAll(participant);
        return users;
    }


}
