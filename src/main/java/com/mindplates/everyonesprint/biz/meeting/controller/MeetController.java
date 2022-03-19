package com.mindplates.everyonesprint.biz.meeting.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.entity.Room;
import com.mindplates.everyonesprint.biz.meeting.entity.RoomUser;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.service.DailyScrumService;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.meeting.vo.request.JoinResponseRequest;
import com.mindplates.everyonesprint.biz.meeting.vo.request.TalkedRequest;
import com.mindplates.everyonesprint.biz.meeting.vo.response.DailyScrumStatusResponse;
import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.common.code.MeetingTypeCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.annotation.DisableMeetingAuth;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


@Slf4j
@RestController
@RequestMapping("/api/meets")
public class MeetController {

    final private MeetingService meetingService;
    final private ParticipantService participantService;
    final private MessageSendService messageSendService;
    final private DailyScrumService dailyScrumService;
    final private UserService userService;

    public MeetController(MeetingService meetingService, ParticipantService participantService, MessageSendService messageSendService, DailyScrumService dailyScrumService, UserService userService) {
        this.meetingService = meetingService;
        this.participantService = participantService;
        this.messageSendService = messageSendService;
        this.dailyScrumService = dailyScrumService;
        this.userService = userService;
    }

    @Operation(description = "회의 정보 조회")
    @GetMapping("/{code}")
    public MeetingResponse selectMeetingInfo(@PathVariable String code, UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(code).get();
        if (meeting.getType().equals(MeetingTypeCode.SMALLTALK)) {

            Optional<Room> joinedRoom = meeting.getRooms().stream().filter((room -> room.getUsers().stream().anyMatch((roomUser -> roomUser.getUser().getId().equals(userSession.getId()))))).findFirst();
            // 사용자가 이미 속한 방이 있는 경우, 해당 방 정보 리턴
            if (joinedRoom.isPresent()) {
                return new MeetingResponse(meeting, joinedRoom.get());
            }

            // 빈 방이 있는 경우, 사용자 정보 추가
            Optional<Room> spaceRoom = meeting.getRooms().stream().filter((room -> room.getUsers().size() < room.getLimitUserCount())).findFirst();
            if (spaceRoom.isPresent()) {
                spaceRoom.get().getUsers().add(RoomUser.builder().room(spaceRoom.get()).user(User.builder().id(userSession.getId()).build()).build());
                meetingService.saveRoom(spaceRoom.get());
                return new MeetingResponse(meeting, spaceRoom.get());
            }

            // 빈 방이 없는 경우, 방을 만들고 사용자 정보 추가
            String roomCode;
            Long count;
            do {
                roomCode = MeetingService.makeShortUUID();
                count = meetingService.selectRoomCount(meeting.getId(), roomCode);
            } while (count > 0L);

            Room newRoom = Room.builder().code(roomCode).meeting(meeting).limitUserCount(meeting.getLimitUserCount()).started(false).build();
            List<RoomUser> users = new ArrayList<>();
            User currentUser = userService.selectUser(userSession.getId());
            users.add(RoomUser.builder().room(newRoom).user(currentUser).build());
            newRoom.setUsers(users);
            meetingService.saveRoom(newRoom);

            return new MeetingResponse(meeting, newRoom);

        }

        return new MeetingResponse(meeting);
    }


    @Operation(description = "회의 참석자 목록 조회")
    @GetMapping("/{code}/users")
    public Iterable<Participant> selectMeetingUserList(@PathVariable String code, UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(code).get();
        Participant participant = Participant.builder().code(code).build();
        if (meeting.getType().equals(MeetingTypeCode.SMALLTALK)) {
            Room userRoom = meeting.getRooms().stream().filter((room -> room.getUsers().stream().anyMatch((roomUser -> roomUser.getUser().getId().equals(userSession.getId()))))).findFirst().orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
            participant.setRoomCode(userRoom.getCode());
        }

        return participantService.findAll(participant);
    }

    @Operation(description = "스크럼 공유 상태 변경")
    @PutMapping("/{code}/scrum")
    public ResponseEntity updateScrumInfo(@PathVariable String code, @RequestParam("operation") String operation, UserSession userSession) {

        Meeting meeting = meetingService.selectMeetingInfo(code).get();
        boolean started = false;
        List<DailyScrumStatusResponse> scrumUserOrders = null;

        switch (operation) {
            case "start": {
                List<Participant> list = dailyScrumService.createDailyScrumInfo(meeting, userSession, true);
                started = meeting.getDailyScrumStarted();
                scrumUserOrders = list.stream().map(DailyScrumStatusResponse::new).collect(Collectors.toList());
                break;
            }

            case "stop": {
                dailyScrumService.updateDailyScrumStop(meeting, userSession);
                started = meeting.getDailyScrumStarted();
                break;
            }

            case "next": {
                List<Participant> list = dailyScrumService.updateUserDailyScrumDone(meeting, userSession);
                started = meeting.getDailyScrumStarted();
                if (started) {
                    scrumUserOrders = list.stream().map(DailyScrumStatusResponse::new).collect(Collectors.toList());
                }
                break;
            }
        }

        Map<String, Object> sendData = new HashMap<>();
        sendData.put("started", started);
        sendData.put("scrumUserOrders", scrumUserOrders);
        MessageData data = MessageData.builder().type("DAILY_SCRUM_CHANGED").data(sendData).build();
        messageSendService.sendTo("meets/" + code, data, userSession);

        return new ResponseEntity(HttpStatus.OK);
    }

    @Operation(description = "사용자 참석 정보 변경")
    @PutMapping("/{code}/status")
    public ResponseEntity updateUserTalkedInfo(@PathVariable String code, @RequestBody TalkedRequest talkedRequest, UserSession userSession) {

        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (meeting.getType().equals(MeetingTypeCode.SMALLTALK)) {

            Room userRoom = meeting.getRooms().stream().filter((room -> room.getUsers().stream().anyMatch((roomUser -> roomUser.getUser().getId().equals(userSession.getId()))))).findFirst().orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
            Participant currentParticipant = participantService.findById(code + userRoom.getCode() + userSession.getId());

            if (currentParticipant == null) {
                meetingService.updateRoomUserTalkedInfo(userRoom, userSession, talkedRequest.getCount(), talkedRequest.getTime());
            } else {
                meetingService.updateRoomUserTalkedInfo(userRoom, userSession, Optional.ofNullable(currentParticipant.getTalkedCount()).orElse(0L) + talkedRequest.getCount(), Optional.ofNullable(currentParticipant.getTalkedSeconds()).orElse(0L) + talkedRequest.getTime());
                currentParticipant.setTalkedCount(Optional.ofNullable(currentParticipant.getTalkedCount()).orElse(0L) + talkedRequest.getCount());
                currentParticipant.setTalkedSeconds(Optional.ofNullable(currentParticipant.getTalkedSeconds()).orElse(0L) + talkedRequest.getTime());
                participantService.save(currentParticipant);
            }
        } else {
            Participant currentParticipant = participantService.findById(code + userSession.getId());

            if (currentParticipant == null) {
                meetingService.updateUserTalkedInfo(meeting, userSession, talkedRequest.getCount(), talkedRequest.getTime());
            } else {
                meetingService.updateUserTalkedInfo(meeting, userSession, Optional.ofNullable(currentParticipant.getTalkedCount()).orElse(0L) + talkedRequest.getCount(), Optional.ofNullable(currentParticipant.getTalkedSeconds()).orElse(0L) + talkedRequest.getTime());
                currentParticipant.setTalkedCount(Optional.ofNullable(currentParticipant.getTalkedCount()).orElse(0L) + talkedRequest.getCount());
                currentParticipant.setTalkedSeconds(Optional.ofNullable(currentParticipant.getTalkedSeconds()).orElse(0L) + talkedRequest.getTime());
                participantService.save(currentParticipant);
            }
        }


        return new ResponseEntity(HttpStatus.OK);
    }

    @Operation(description = "미팅 참석 요청")
    @PutMapping("/{code}/request/join")
    @DisableMeetingAuth
    public ResponseEntity updateUserRequestJoin(@PathVariable String code, UserSession userSession) {

        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (meeting.getType().equals(MeetingTypeCode.MEETING)) {
            Participant conferenceCondition = Participant.builder().code(code).build();
            Iterable<Participant> conferenceUsers = participantService.findAll(conferenceCondition);
            long connectedUserCount = StreamSupport.stream(conferenceUsers.spliterator(), false).filter(p -> Optional.ofNullable(p.getConnected()).orElse(false)).count();
            if (connectedUserCount < 1) {
                return new ResponseEntity(HttpStatus.NOT_FOUND);
            }
            Map<String, Object> sendData = new HashMap<>();
            sendData.put("user", userService.selectUser(userSession.getId()));
            MessageData data = MessageData.builder().type("JOIN_REQUEST").data(sendData).build();
            messageSendService.sendTo("meets/" + code, data, userSession);
        } else {
            throw new ServiceException(HttpStatus.FORBIDDEN, "common.not.allowed.meetingType");
        }

        return new ResponseEntity(HttpStatus.OK);
    }

    @Operation(description = "미팅 참석 요청 응답")
    @PutMapping("/{code}/request/join/response")
    public ResponseEntity updateUserRequestResponseJoin(@PathVariable String code, @RequestBody JoinResponseRequest joinResponseRequest, UserSession userSession) {

        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (meeting.getType().equals(MeetingTypeCode.MEETING)) {
            if (joinResponseRequest.getAllowed()) {
                meeting.getUsers().add(MeetingUser.builder().meeting(meeting).user(User.builder().id(joinResponseRequest.getUserId()).build()).build());
                meetingService.updateMeetingInfo(meeting, userSession);
            }

            Map<String, Object> sendData = new HashMap<>();
            sendData.put("userId", joinResponseRequest.getUserId());
            sendData.put("allowed", joinResponseRequest.getAllowed());
            MessageData data = MessageData.builder().type("JOIN_REQUEST_RESPONSE").data(sendData).build();
            messageSendService.sendTo("meets/" + code, data, userSession);

            MessageData responseData = MessageData.builder().type("JOIN_REQUEST_RESULT").data(sendData).build();
            messageSendService.sendTo("meets/" + code + "/standby/" + joinResponseRequest.getUserId(), responseData, userSession);
        }

        return new ResponseEntity(HttpStatus.OK);
    }


}
