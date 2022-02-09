package com.mindplates.everyonesprint.common.message;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.common.message.vo.MessageInfo;
import com.mindplates.everyonesprint.framework.redis.template.JsonRedisTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class MessageBroker {

    final private JsonRedisTemplate<MessageInfo> jsonRedisTemplate;
    final private ObjectMapper mapper;
    final private SimpMessagingTemplate simpMessagingTemplate;

    public MessageBroker(JsonRedisTemplate<MessageInfo> jsonRedisTemplate, ObjectMapper mapper, SimpMessagingTemplate simpMessagingTemplate) {
        this.jsonRedisTemplate = jsonRedisTemplate;
        this.mapper = mapper;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public void pubMessage(MessageInfo info) {
        jsonRedisTemplate.convertAndSend("sendMessage", info);
    }

    public void sendMessage(String str) throws JsonProcessingException {
        MessageInfo message = mapper.readValue(str, MessageInfo.class);

        if (message.getTargetUserId() == null || "".equals(message.getTargetUserId().toString())) {
            simpMessagingTemplate.convertAndSend(message.targetTopicUrl(), message);
        } else {
            simpMessagingTemplate.convertAndSend(message.targetTopicUrl() + "/users/" + message.getTargetUserId(), message);
        }
    }
}
