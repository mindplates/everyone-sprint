package com.mindplates.everyonesprint.biz.park.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.biz.park.redis.Walker;
import com.mindplates.everyonesprint.biz.park.service.WalkerService;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.AllArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Log
@RestController
@MessageMapping("/api/park/message")
@AllArgsConstructor
public class ParkMessageController {

    final private WalkerService walkerService;
    final private UserService userService;
    final private ObjectMapper mapper;
    final private MessageSendService messageSendService;

    @SuppressWarnings({"unused", "unchecked"})
    @MessageMapping("/send")
    public void send(String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {
        Map<String, Object> value = mapper.readValue(message, Map.class);
        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);

        String type = (String) value.get("type");
        Map<String, Object> messageData = (Map<String, Object>) value.get("data");

        if (userSession != null) {

            if ("PUBLIC-PARK-ENTER".equals(type)) {
                User user = userService.selectUser(userSession.getId());
                Walker walker = new Walker(user);
                walker.setX(Double.parseDouble(String.valueOf(messageData.get("x"))));
                walker.setY(Double.parseDouble(String.valueOf(messageData.get("y"))));

                messageData.put("email", user.getEmail());
                messageData.put("name", user.getIsNameOpened() ? user.getName() : "");
                messageData.put("alias", user.getAlias());
                messageData.put("imageType", user.getImageType());
                messageData.put("imageData", user.getImageData());

                walkerService.save(walker);
            }

            if ("PUBLIC-PARK-USER-MOVE".equals(type)) {
                Walker walker = walkerService.findById(userSession.getId());
                if (walker == null) {
                    User user = userService.selectUser(userSession.getId());
                    walker = new Walker(user);
                    walker.setX(Double.parseDouble(String.valueOf(messageData.get("x"))));
                    walker.setY(Double.parseDouble(String.valueOf(messageData.get("y"))));
                }

                walker.setX(Double.parseDouble(String.valueOf(messageData.get("x"))));
                walker.setY(Double.parseDouble(String.valueOf(messageData.get("y"))));

                walkerService.save(walker);
            }

            MessageData data = MessageData.builder().type(type).data(messageData).build();
            messageSendService.sendTo("public-park", data, userSession);

        }


    }

}



































