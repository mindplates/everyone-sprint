package com.mindplates.everyonesprint.framework.websocket;

import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.park.service.WalkerService;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.HashMap;

@Component
@Slf4j
public class WebSocketEventListener {

    @Autowired
    private MessageSendService messageSendService;

    @Autowired
    WalkerService walkerService;

    @Autowired
    ParticipantService participantService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        UserSession userSession = (UserSession) headerAccessor.getSessionAttributes().get("USER_INFO");
        if (userSession != null) {
            MessageData data = MessageData.builder().type("PUBLIC-PARK-EXIT").build();
            messageSendService.sendTo("public-park", data, userSession);
            walkerService.deleteById(userSession.getId().toString());

            Participant condition = Participant.builder().socketId(headerAccessor.getSessionId()).build();
            Iterable<Participant> participants = participantService.findAll(condition);
            participants.forEach((participant -> {
                participant.setLeaveTime(LocalDateTime.now());
                participant.setConnected(false);
                HashMap<String, Object> sendData = new HashMap<>();
                sendData.put("participant", participant);
                MessageData message = MessageData.builder().type("LEAVE").data(sendData).build();
                messageSendService.sendTo("conferences/" + participant.getCode(), message, userSession);
                participant.setConnected(null);
                participantService.save(participant);
            }));
        }

    }
}
