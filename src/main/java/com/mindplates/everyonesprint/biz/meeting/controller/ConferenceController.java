package com.mindplates.everyonesprint.biz.meeting.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.executor.DailyScrumExecutor;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.service.DailyScrumService;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.meeting.vo.response.DailyScrumStatusResponse;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    DailyScrumExecutor dailyScrumExecutor;
    @Autowired
    SessionUtil sessionUtil;
    @Autowired
    private MessageSendService messageSendService;
    @Autowired
    private DailyScrumService dailyScrumService;

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

    @PostMapping("/{code}/scrum/start")
    public ResponseEntity startDailyScrum(@PathVariable String code, UserSession userSession) {

        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        checkIsMeetingMember(userSession, meeting.getUsers());

        List<Participant> list = dailyScrumService.startDailyScrum(meeting, userSession);

        List<DailyScrumStatusResponse> scrumUserOrders = new ArrayList<>();
        for (Participant user : list) {
            scrumUserOrders.add(DailyScrumStatusResponse.builder()
                    .userId(Long.parseLong(user.getId()))
                    .order(user.getDailyScrumOrder())
                    .isCurrentSpeaker(user.getIsCurrentSpeaker())
                    .isDailyScrumDone(user.getIsDailyScrumDone())
                    .build());
        }

        Map<String, Object> sendData = new HashMap<>();
        sendData.put("started", true);
        sendData.put("scrumUserOrders", scrumUserOrders);
        MessageData data = MessageData.builder().type("DAILY_SCRUM_CHANGED").data(sendData).build();
        messageSendService.sendTo("conferences/" + code, data, userSession);

        return new ResponseEntity(HttpStatus.OK);

    }

    @PostMapping("/{code}/scrum/done")
    public ResponseEntity doneUserDailyScrum(@PathVariable String code, UserSession userSession) {

        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        checkIsMeetingMember(userSession, meeting.getUsers());

        List<Participant> list = dailyScrumService.doneDailyScrum(meeting, userSession);


        MessageData data;

        if (list.stream().anyMatch((participant -> participant.getIsCurrentSpeaker()))) {

            List<DailyScrumStatusResponse> scrumUserOrders = new ArrayList<>();
            for (Participant user : list) {
                scrumUserOrders.add(DailyScrumStatusResponse.builder()
                        .userId(Long.parseLong(user.getId()))
                        .order(user.getDailyScrumOrder())
                        .isCurrentSpeaker(user.getIsCurrentSpeaker())
                        .isDailyScrumDone(user.getIsDailyScrumDone())
                        .build());
            }
            Map<String, Object> sendData = new HashMap<>();
            sendData.put("started", true);
            sendData.put("scrumUserOrders", scrumUserOrders);
            data = MessageData.builder().type("DAILY_SCRUM_CHANGED").data(sendData).build();

        } else {
            Map<String, Object> sendData = new HashMap<>();
            sendData.put("started", false);
            data = MessageData.builder().type("DAILY_SCRUM_CHANGED").data(sendData).build();
        }

        messageSendService.sendTo("conferences/" + code, data, userSession);

        return new ResponseEntity(HttpStatus.OK);

    }

    @PostMapping("/{code}/scrum/stop")
    public ResponseEntity stopDailyScrum(@PathVariable String code, UserSession userSession) {

        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        checkIsMeetingMember(userSession, meeting.getUsers());

        dailyScrumService.stopDailyScrum(meeting, userSession);

        Map<String, Object> sendData = new HashMap<>();
        sendData.put("started", false);
        MessageData data = MessageData.builder().type("DAILY_SCRUM_CHANGED").data(sendData).build();
        messageSendService.sendTo("conferences/" + code, data, userSession);

        return new ResponseEntity(HttpStatus.OK);

    }


}
