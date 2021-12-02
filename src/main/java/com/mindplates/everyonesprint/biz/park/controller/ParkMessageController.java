package com.mindplates.everyonesprint.biz.park.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.biz.park.redis.Walker;
import com.mindplates.everyonesprint.biz.park.service.WalkerService;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Log
@RestController
@MessageMapping("/api/park/message")
public class ParkMessageController {

    @Autowired
    WalkerService walkerService;
    @Autowired
    private ObjectMapper mapper;
    @Autowired
    private MessageSendService messageSendService;

    @MessageMapping("/send")
    @SuppressWarnings("unchecked")
    public void send(String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {
        Map<String, Object> value = mapper.readValue(message, Map.class);
        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);

        String type = (String) value.get("type");
        Map<String, Object> messageData = (Map<String, Object>) value.get("data");

        if (userSession != null) {

            MessageData data = MessageData.builder().type(type).data(messageData).build();
            messageSendService.sendTo("public-park", data, userSession);

            if ("PUBLIC-PARK-ENTER".equals(type) || "PUBLIC-PARK-USER-MOVE".equals(type)) {

                Walker walker = Walker.builder()
                        .id(userSession.getId().toString())
                        .x(Double.parseDouble(String.valueOf(messageData.get("x"))))
                        .y(Double.parseDouble(String.valueOf(messageData.get("y"))))
                        .build();
                walkerService.save(walker);
            }

        }


    }

}



































