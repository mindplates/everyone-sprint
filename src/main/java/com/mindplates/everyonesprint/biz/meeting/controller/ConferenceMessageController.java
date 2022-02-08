package com.mindplates.everyonesprint.biz.meeting.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.service.DailyScrumService;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.meeting.vo.response.DailyScrumStatusResponse;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.stream.StreamSupport;

@Log
@RestController
@MessageMapping("/api/message/conferences/{code}")
public class ConferenceMessageController {

    @Autowired
    ParticipantService participantService;

    @Autowired
    UserService userService;
    @Autowired
    MeetingService meetingService;
    @Autowired
    private ObjectMapper mapper;
    @Autowired
    private MessageSendService messageSendService;
    @Autowired
    private DailyScrumService dailyScrumService;

    @MessageMapping("/send")
    @SuppressWarnings("unchecked")
    public void sendToConference(@DestinationVariable(value = "code") String code, String message, SimpMessageHeaderAccessor headerAccessor) throws JsonProcessingException {

        UserSession userSession = SessionUtil.getUserInfo(headerAccessor);
        Map<String, Object> value = mapper.readValue(message, Map.class);

        String type = (String) value.get("type");
        Map<String, Object> receiveData = (Map<String, Object>) value.get("data");
        Map<String, Object> sendData = null;

        if (userSession != null) {
            if ("JOIN".equals(type)) {
                // JOIN 정보
                Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
                User user = userService.selectUser(userSession.getId());

                sendData = new HashMap<>();
                sendData.put("type", type);
                Participant currentParticipant = meetingService.updateUserJoinInfo(code, user, SessionUtil.getUserIP(headerAccessor), headerAccessor.getSessionId(), (Boolean) receiveData.get("audio"), (Boolean) receiveData.get("video"), meeting);
                sendData.put("participant", currentParticipant);

                List<Participant> participantList = dailyScrumService.addDailyScrumUser(meeting, userSession);
                List<DailyScrumStatusResponse> scrumUserOrders = StreamSupport.stream(participantList.spliterator(), false).map(DailyScrumStatusResponse::new).collect(Collectors.toList());

                sendData.put("started", meeting.getDailyScrumStarted());
                sendData.put("scrumUserOrders", scrumUserOrders);
            }
        }

        MessageData data = MessageData.builder().type(type).data(Optional.ofNullable(sendData).orElse(receiveData)).build();
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



































