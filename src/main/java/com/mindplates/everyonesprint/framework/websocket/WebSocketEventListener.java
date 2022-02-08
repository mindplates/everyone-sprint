package com.mindplates.everyonesprint.framework.websocket;

import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.park.service.WalkerService;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
public class WebSocketEventListener {

    private final MeetingService meetingService;

    private final WalkerService walkerService;

    private final MessageSendService messageSendService;

    public WebSocketEventListener(MeetingService meetingService, WalkerService walkerService, ParticipantService participantService, MessageSendService messageSendService) {
        this.meetingService = meetingService;
        this.walkerService = walkerService;
        this.messageSendService = messageSendService;
    }

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

            meetingService.updateUserLeaveInfo(headerAccessor.getSessionId(), userSession);
        }

    }
}
