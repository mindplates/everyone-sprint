package com.mindplates.everyonesprint.common.message;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.common.message.vo.MessageInfo;
import com.mindplates.everyonesprint.framework.redis.template.JsonRedisTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class MessageBroker {

    @Autowired
    private JsonRedisTemplate<MessageInfo> jsonRedisTemplate;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private ObjectMapper mapper;

    public void pubMessage(MessageInfo info) {
        jsonRedisTemplate.convertAndSend("sendMessage", info);
    }

    public void sendMessage(String str) throws JsonProcessingException {
        MessageInfo message = mapper.readValue(str, MessageInfo.class);

        if (message.getTargetUserId() == null || "".equals(message.getTargetUserId())) {
            simpMessagingTemplate.convertAndSend(message.targetTopicUrl(), message);
        } else {
            simpMessagingTemplate.convertAndSend(message.targetTopicUrl() + "/users/" + message.getTargetUserId(), message);
        }
    }
}
