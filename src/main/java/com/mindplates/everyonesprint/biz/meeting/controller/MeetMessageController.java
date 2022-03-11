package com.mindplates.everyonesprint.biz.meeting.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.service.DailyScrumService;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.vo.response.DailyScrumStatusResponse;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@SuppressWarnings({"unchecked", "unused"})
@Log
@RestController
@MessageMapping("/api/message/meets/{code}")
public class MeetMessageController {

    final private UserService userService;
    final private MeetingService meetingService;
    final private ObjectMapper mapper;
    final private MessageSendService messageSendService;
    final private DailyScrumService dailyScrumService;

    public MeetMessageController(UserService userService, MeetingService meetingService, ObjectMapper mapper, MessageSendService messageSendService, DailyScrumService dailyScrumService) {
        this.userService = userService;
        this.meetingService = meetingService;
        this.mapper = mapper;
        this.messageSendService = messageSendService;
        this.dailyScrumService = dailyScrumService;
    }

    @MessageMapping("/rooms/{roomCode}/send")
    public void sendToRoom(@DestinationVariable(value = "code") String code, @DestinationVariable(value = "roomCode") String roomCode, String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {

        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);
        Map<String, Object> value = mapper.readValue(message, Map.class);

        String type = (String) value.get("type");
        Map<String, Object> receiveData = (Map<String, Object>) value.get("data");
        Map<String, Object> sendData = null;

        if (userSession != null && "JOIN".equals(type)) {
            // JOIN 정보
            Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
            User user = userService.selectUser(userSession.getId());

            sendData = new HashMap<>();
            sendData.put("type", type);
            Participant currentParticipant = meetingService.updateUserJoinInfo(code, roomCode, user, SessionUtil.getUserIP(headerAccessor), headerAccessor.getSessionId(), (Boolean) receiveData.get("audio"), (Boolean) receiveData.get("video"), meeting);
            sendData.put("participant", currentParticipant);
        }

        MessageData data = MessageData.builder().type(type).data(Optional.ofNullable(sendData).orElse(receiveData)).build();
        messageSendService.sendTo("meets/" + code + "/rooms/" + roomCode, data, userSession);


    }

    @MessageMapping("/send")
    public void sendToConference(@DestinationVariable(value = "code") String code, String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {

        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);
        Map<String, Object> value = mapper.readValue(message, Map.class);

        String type = (String) value.get("type");
        Map<String, Object> receiveData = (Map<String, Object>) value.get("data");
        Map<String, Object> sendData = null;

        if (userSession != null && "JOIN".equals(type)) {
            // JOIN 정보
            Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
            User user = userService.selectUser(userSession.getId());

            sendData = new HashMap<>();
            sendData.put("type", type);
            Participant currentParticipant = meetingService.updateUserJoinInfo(code, user, SessionUtil.getUserIP(headerAccessor), headerAccessor.getSessionId(), (Boolean) receiveData.get("audio"), (Boolean) receiveData.get("video"), meeting);
            sendData.put("participant", currentParticipant);

            List<Participant> participantList = dailyScrumService.updateAddUserDailyScrumInfo(meeting, userSession);
            List<DailyScrumStatusResponse> scrumUserOrders = participantList.stream().map(DailyScrumStatusResponse::new).collect(Collectors.toList());

            sendData.put("started", meeting.getDailyScrumStarted());
            sendData.put("scrumUserOrders", scrumUserOrders);

            Map<String, Object> notifyData = new HashMap<>();
            notifyData.put("meetingId", meeting.getId());
            messageSendService.sendTo("meets/notify", MessageData.builder().type("JOIN").data(notifyData).build(), null);
        }

        MessageData data = MessageData.builder().type(type).data(Optional.ofNullable(sendData).orElse(receiveData)).build();
        messageSendService.sendTo("meets/" + code, data, userSession);


    }

    @MessageMapping("/{userId}/send")
    public void sendToUser(@DestinationVariable(value = "code") String code, @DestinationVariable(value = "userId") Long userId, String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {

        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);
        Map<String, Object> value = mapper.readValue(message, Map.class);

        String type = (String) value.get("type");
        Map<String, Object> receiveData = (Map<String, Object>) value.get("data");

        MessageData data = MessageData.builder().type(type).data(receiveData).build();
        messageSendService.sendTo("meets/" + code + "/" + userId, data, userSession);
    }

    @MessageMapping("/rooms/{roomCode}/{userId}/send")
    public void sendToUser(@DestinationVariable(value = "code") String code, @DestinationVariable(value = "roomCode") String roomCode, @DestinationVariable(value = "userId") Long userId, String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {

        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);
        Map<String, Object> value = mapper.readValue(message, Map.class);

        String type = (String) value.get("type");
        Map<String, Object> receiveData = (Map<String, Object>) value.get("data");

        MessageData data = MessageData.builder().type(type).data(receiveData).build();
        messageSendService.sendTo("meets/" + code + "/rooms/" + roomCode + "/" + userId, data, userSession);
    }

}



































