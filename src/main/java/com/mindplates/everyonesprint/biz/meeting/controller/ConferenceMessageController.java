package com.mindplates.everyonesprint.biz.meeting.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Log
@RestController
@MessageMapping("/api/message/conferences/{code}")
public class ConferenceMessageController {

    @Autowired
    ParticipantService participantService;

    @Autowired
    UserService userService;

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private MessageSendService messageSendService;

    @MessageMapping("/send")
    @SuppressWarnings("unchecked")
    public void sendToConference(@DestinationVariable(value = "code") String code, String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {

        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);
        Map<String, Object> value = mapper.readValue(message, Map.class);

        String type = (String) value.get("type");
        Map<String, Object> receiveData = (Map<String, Object>) value.get("data");
        Map<String, Object> sendData;
        sendData = null;

        if (userSession != null) {
            if ("JOIN".equals(type)) {
                sendData = new HashMap<>();
                sendData.put("type", type);
                User user = userService.selectUser(userSession.getId());
                Participant participant = new Participant(user, code, SessionUtil.getUserIP(headerAccessor), headerAccessor.getSessionId(), (Boolean) receiveData.get("audio"), (Boolean) receiveData.get("video"));
                participantService.save(participant);
                sendData.put("participant", participant);
            }
        }

        MessageData data = MessageData.builder().type(type).data(sendData != null ? sendData : receiveData).build();
        messageSendService.sendTo("conferences/" + code, data, userSession);
    }

    @MessageMapping("/{userId}/send")
    @SuppressWarnings("unchecked")
    public void sendToUser(@DestinationVariable(value = "code") String code, @DestinationVariable(value = "userId") Long userId, String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {

        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);
        Map<String, Object> value = mapper.readValue(message, Map.class);

        String type = (String) value.get("type");
        Map<String, Object> receiveData = (Map<String, Object>) value.get("data");

        MessageData data = MessageData.builder().type(type).data(receiveData).build();
        messageSendService.sendTo("conferences/" + code + "/" + userId, data, userSession);
    }

}



































