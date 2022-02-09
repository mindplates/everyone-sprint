package com.mindplates.everyonesprint.biz.meeting.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.service.DailyScrumService;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.meeting.vo.request.TalkedRequest;
import com.mindplates.everyonesprint.biz.meeting.vo.response.DailyScrumStatusResponse;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@Slf4j
@RestController
@RequestMapping("/api/conferences")
public class ConferenceController {

    final private MeetingService meetingService;
    final private ParticipantService participantService;
    final private MessageSendService messageSendService;
    final private DailyScrumService dailyScrumService;

    public ConferenceController(MeetingService meetingService, ParticipantService participantService, MessageSendService messageSendService, DailyScrumService dailyScrumService) {
        this.meetingService = meetingService;
        this.participantService = participantService;
        this.messageSendService = messageSendService;
        this.dailyScrumService = dailyScrumService;
    }

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
        return participantService.findAll(participant);
    }

    @PutMapping("/{code}/daily")
    public ResponseEntity updateDailyScrumInfo(@RequestParam("operation") String operation, @PathVariable String code, UserSession userSession) {

        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        checkIsMeetingMember(userSession, meeting.getUsers());

        boolean started = false;
        List<DailyScrumStatusResponse> scrumUserOrders = null;

        switch (operation) {
            case "start": {
                List<Participant> list = dailyScrumService.createDailyScrumInfo(meeting, userSession, true);
                started = meeting.getDailyScrumStarted();
                scrumUserOrders = list.stream().map(DailyScrumStatusResponse::new).collect(Collectors.toList());
                break;
            }

            case "stop": {
                dailyScrumService.updateDailyScrumStop(meeting, userSession);
                started = meeting.getDailyScrumStarted();
                break;
            }

            case "next": {
                List<Participant> list = dailyScrumService.updateUserDailyScrumDone(meeting, userSession);
                started = meeting.getDailyScrumStarted();
                if (started) {
                    scrumUserOrders = list.stream().map(DailyScrumStatusResponse::new).collect(Collectors.toList());
                }
                break;
            }
        }

        Map<String, Object> sendData = new HashMap<>();
        sendData.put("started", started);
        sendData.put("scrumUserOrders", scrumUserOrders);
        MessageData data = MessageData.builder().type("DAILY_SCRUM_CHANGED").data(sendData).build();
        messageSendService.sendTo("conferences/" + code, data, userSession);

        return new ResponseEntity(HttpStatus.OK);
    }

    @PutMapping("/{code}/talked")
    public ResponseEntity updateUserTalkedInfo(@PathVariable String code, @RequestBody TalkedRequest talkedRequest, UserSession userSession) {

        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        checkIsMeetingMember(userSession, meeting.getUsers());

        Participant currentParticipant = participantService.findById(code + userSession.getId());

        if (currentParticipant == null) {
            meetingService.updateUserTalkedInfo(meeting, userSession, talkedRequest.getCount(), talkedRequest.getTime());
        } else {
            meetingService.updateUserTalkedInfo(meeting, userSession, Optional.ofNullable(currentParticipant.getTalkedCount()).orElse(0L) + talkedRequest.getCount(), Optional.ofNullable(currentParticipant.getTalkedSeconds()).orElse(0L) + talkedRequest.getTime());
            currentParticipant.setTalkedCount(Optional.ofNullable(currentParticipant.getTalkedCount()).orElse(0L) + talkedRequest.getCount());
            currentParticipant.setTalkedSeconds(Optional.ofNullable(currentParticipant.getTalkedSeconds()).orElse(0L) + talkedRequest.getTime());
            participantService.save(currentParticipant);
        }
        return new ResponseEntity(HttpStatus.OK);
    }
}
