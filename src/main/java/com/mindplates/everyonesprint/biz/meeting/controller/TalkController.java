package com.mindplates.everyonesprint.biz.meeting.controller;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.Room;
import com.mindplates.everyonesprint.biz.meeting.entity.RoomUser;
import com.mindplates.everyonesprint.biz.meeting.service.DailyScrumService;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.service.ParticipantService;
import com.mindplates.everyonesprint.biz.meeting.vo.response.RoomResponse;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Slf4j
@RestController
@RequestMapping("/api/talks")
public class TalkController {

    final private MeetingService meetingService;
    final private ParticipantService participantService;
    final private MessageSendService messageSendService;
    final private DailyScrumService dailyScrumService;
    final private UserService userService;

    public TalkController(MeetingService meetingService, ParticipantService participantService, MessageSendService messageSendService, DailyScrumService dailyScrumService, UserService userService) {
        this.meetingService = meetingService;
        this.participantService = participantService;
        this.messageSendService = messageSendService;
        this.dailyScrumService = dailyScrumService;
        this.userService = userService;
    }

    private void checkIsSprintMember(UserSession userSession, Sprint sprint) {
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException(HttpStatus.FORBIDDEN, "common.no.member");
        }
    }

    @GetMapping("/{code}")
    public RoomResponse selectMeetingInfo(@PathVariable String code, UserSession userSession) {
        Meeting meeting = meetingService.selectMeetingInfo(code).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        checkIsSprintMember(userSession, meeting.getSprint());

        Optional<Room> joinedRoom = meeting.getRooms().stream().filter((room -> room.getUsers().stream().anyMatch((roomUser -> roomUser.getUser().getId().equals(userSession.getId()))))).findFirst();
        // 사용자가 이미 속한 방이 있는 경우, 해당 방 정보 리턴
        if (joinedRoom.isPresent()) {
            return new RoomResponse(joinedRoom.get());
        }

        // 빈 방이 있는 경우, 사용자 정보 추가
        Optional<Room> spaceRoom = meeting.getRooms().stream().filter((room -> room.getUsers().size() < room.getLimitUserCount())).findFirst();
        if (spaceRoom.isPresent()) {
            spaceRoom.get().getUsers().add(RoomUser.builder().room(spaceRoom.get()).user(User.builder().id(userSession.getId()).build()).build());
            meetingService.saveRoom(spaceRoom.get());
            return new RoomResponse(spaceRoom.get());
        }

        // 빈 방이 없는 경우, 방을 만들고 사용자 정보 추가
        String roomCode;
        Long count;
        do {
            roomCode = MeetingService.makeShortUUID();
            count = meetingService.selectRoomCount(meeting.getId(), roomCode);
        } while (count > 0L);

        Room newRoom = Room.builder().code(roomCode).meeting(meeting).limitUserCount(meeting.getLimitUserCount()).build();
        List<RoomUser> users = new ArrayList<>();
        User currentUser = userService.selectUser(userSession.getId());
        users.add(RoomUser.builder().room(newRoom).user(currentUser).build());
        newRoom.setUsers(users);
        meetingService.saveRoom(newRoom);

        return new RoomResponse(newRoom);
    }


}
