package com.mindplates.everyonesprint.common.message.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.java.Log;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@SuppressWarnings("unused")
@Log
@RestController
@MessageMapping("/api/message")
public class MessageController {

    final private ObjectMapper mapper;
    final private MessageSendService messageSendService;

    public MessageController(ObjectMapper mapper, MessageSendService messageSendService) {
        this.mapper = mapper;
        this.messageSendService = messageSendService;
    }

    @MessageMapping("/send")
    public void send(String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {
        Map<String, Object> value = mapper.readValue(message, Map.class);
        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);

        messageSendService.sendTo("message", MessageData.builder().type((String) value.get("type")).data((Map<String, Object>) value.get("data")).build(), userSession);
    }

}



































