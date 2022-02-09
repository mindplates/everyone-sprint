package com.mindplates.everyonesprint.common.message.service;

import com.mindplates.everyonesprint.common.message.MessageBroker;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.message.vo.MessageInfo;
import com.mindplates.everyonesprint.common.message.vo.SenderInfo;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Log
@Service
public class MessageSendService {

    final private MessageBroker messageBroker;

    public MessageSendService(MessageBroker messageBroker) {
        this.messageBroker = messageBroker;
    }

    public void sendTo(String topic, MessageData messageData, UserSession userSession) {
        messageBroker.pubMessage(MessageInfo.builder()
                .topicUrl(topic)
                .data(messageData)
                .senderInfo(new SenderInfo(userSession))
                .build());
    }

    public void sendToUser(String topic, Long targetUserId, MessageData messageData, UserSession userSession) {
        messageBroker.pubMessage(MessageInfo.builder()
                .topicUrl(topic)
                .targetUserId(targetUserId)
                .data(messageData)
                .senderInfo(new SenderInfo(userSession))
                .build());
    }


}
