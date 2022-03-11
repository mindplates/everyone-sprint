package com.mindplates.everyonesprint.biz.meeting.service;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.entity.Room;
import com.mindplates.everyonesprint.biz.meeting.entity.RoomUser;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.repository.*;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.MeetingTypeCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.message.service.MessageSendService;
import com.mindplates.everyonesprint.common.message.vo.MessageData;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.data.domain.Example;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.ByteBuffer;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.StreamSupport;

@Service
@Transactional
public class MeetingService {

    final private ParticipantService participantService;
    final private ParticipantRepository participantRepository;
    final private MeetingRepository meetingRepository;
    final private MessageSendService messageSendService;
    final private MeetingUserRepository meetingUserRepository;
    final private RoomUserRepository roomUserRepository;
    final private RoomRepository roomRepository;

    public MeetingService(ParticipantService participantService, ParticipantRepository participantRepository, MeetingRepository meetingRepository, MessageSendService messageSendService, MeetingUserRepository meetingUserRepository, RoomRepository roomRepository, RoomUserRepository roomUserRepository) {
        this.participantService = participantService;
        this.participantRepository = participantRepository;
        this.meetingRepository = meetingRepository;
        this.messageSendService = messageSendService;
        this.meetingUserRepository = meetingUserRepository;
        this.roomUserRepository = roomUserRepository;
        this.roomRepository = roomRepository;
    }

    public static String makeShortUUID() {
        UUID uuid = UUID.randomUUID();
        long l = ByteBuffer.wrap(uuid.toString().getBytes()).getLong();
        return Long.toString(l, Character.MAX_RADIX);
    }

    public Meeting createMeetingInfo(Meeting meeting, UserSession userSession) {

        String code;
        Long count;

        do {
            code = makeShortUUID();
            count = meetingRepository.countByCode(code);
        } while (count > 0L);

        LocalDateTime now = LocalDateTime.now();
        meeting.setCode(code);
        meeting.setCreationDate(now);
        meeting.setLastUpdateDate(now);
        meeting.setCreatedBy(userSession.getId());
        meeting.setLastUpdatedBy(userSession.getId());
        meeting.setType(MeetingTypeCode.MEETING);
        return meetingRepository.save(meeting);
    }

    public Meeting updateMeetingInfo(Meeting meeting, UserSession userSession) {
        return this.updateMeetingInfo(meeting, userSession.getId());
    }

    private Meeting updateMeetingInfo(Meeting meeting, Long userId) {
        LocalDateTime now = LocalDateTime.now();
        meeting.setLastUpdateDate(now);
        meeting.setLastUpdatedBy(userId);
        return meetingRepository.save(meeting);
    }

    private Room updateRoomInfo(Room room, Long userId) {
        LocalDateTime now = LocalDateTime.now();
        room.setLastUpdateDate(now);
        room.setLastUpdatedBy(userId);
        return roomRepository.save(room);
    }

    public void deleteMeetingInfo(Meeting meeting) {
        meetingRepository.delete(meeting);
    }

    public List<Meeting> selectUserMeetingList(Long sprintId, LocalDateTime date, UserSession userSession) {


        LocalDateTime nextDay = date.plusDays(1);

        List<Meeting> smallTalkMeetingPlans = meetingRepository.findAllByStartDateGreaterThanEqualAndStartDateLessThanEqualAndSprintUsersUserIdAndSmallTalkMeetingPlanIsNotNull(date, nextDay, userSession.getId());
        if (sprintId != null) {
            smallTalkMeetingPlans.addAll(meetingRepository.findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserId(sprintId, date, nextDay, userSession.getId()));
            return smallTalkMeetingPlans;
        }

        smallTalkMeetingPlans.addAll(meetingRepository.findAllByStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserId(date, nextDay, userSession.getId()));
        return smallTalkMeetingPlans;
    }

    public Optional<Meeting> selectMeetingInfo(Long id) {
        return meetingRepository.findById(id);
    }

    public Optional<Meeting> selectMeetingInfo(String code) {
        return meetingRepository.findByCode(code);
    }

    public List<Meeting> selectSprintMeetingList(Long sprintId) {
        return meetingRepository.findAllBySprintId(sprintId);
    }

    public List<Meeting> selectSprintUserScrumMeetingList(Long userId, List<Long> springDailyMeetingIds, LocalDateTime startTime, LocalDateTime endTime) {
        return meetingRepository.findAllByUsersUserIdAndScrumMeetingPlanIdInAndStartDateGreaterThanEqualAndStartDateLessThanEqual(userId, springDailyMeetingIds, startTime, endTime);
    }

    public List<Meeting> selectSprintScrumMeetingList(Long sprintId, LocalDateTime startTime, LocalDateTime endTime) {
        return meetingRepository.findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndScrumMeetingPlanIsNotNull(sprintId, startTime, endTime);
    }

    public boolean selectHasSprintMeeting(Long sprintId, LocalDateTime startTime, LocalDateTime endTime) {
        return meetingRepository.countBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndScrumMeetingPlanIsNotNull(sprintId, startTime, endTime) > 0L;
    }

    public List<Meeting> selectSprintNotScrumMeetingList(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        return meetingRepository.findAllByUsersUserIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndScrumMeetingPlanIsNull(userId, startTime, endTime);
    }

    public Participant updateUserJoinInfo(String code, User user, String ipAddress, String socketId, Boolean audio, Boolean video, Meeting meeting) {
        Participant currentParticipant = participantService.findById(code + user.getId());
        Participant participant;
        if (currentParticipant == null) {
            participant = new Participant(user, code, ipAddress, socketId, audio, video);
        } else {
            participant = currentParticipant;
            participant.setId(Long.toString(user.getId()));
            participant.setIp(ipAddress);
            participant.setSocketId(socketId);
            participant.setAudio(audio);
            participant.setVideo(video);
            participant.setConnected(true);
        }

        participantService.save(participant);

        // 사용자 조인 시간 기록
        MeetingUser meetingUserCondition = MeetingUser.builder().meeting(Meeting.builder().id(meeting.getId()).build()).user(User.builder().id(user.getId()).build()).build();
        meetingUserRepository.findOne(Example.of(meetingUserCondition)).ifPresent(meetingUser -> {
            if (meetingUser.getFirstJoinDate() == null) {
                meetingUser.setFirstJoinDate(LocalDateTime.now());
                meetingUserRepository.save(meetingUser);
            }
        });

        Participant condition = Participant.builder().code(meeting.getCode()).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));
        long connectedUserCount = StreamSupport.stream(users.spliterator(), false).filter(p -> Optional.ofNullable(p.getConnected()).orElse(false)).count();

        // 원래 시간보다 나중에 들어왔거나, 이전 시간이라도 1/4 이상의 인원이 들어오면 회의를 시작한 것으로 시간 기록
        LocalDateTime now = LocalDateTime.now();
        // if (meeting.getRealStartDate() == null && (meeting.getStartDate().isAfter(now) || connectedUserCount > (meeting.getUsers().size() / 4))) {
        if (meeting.getRealStartDate() == null && (meeting.getStartDate().isAfter(now) || connectedUserCount > 0)) {
            meeting.setRealStartDate(now);
            updateMeetingInfo(meeting, user.getId());
        }

        return participant;
    }

    public Participant updateUserJoinInfo(String code, String roomCode, User user, String ipAddress, String socketId, Boolean audio, Boolean video, Meeting meeting) {
        Participant currentParticipant = participantService.findById(code + roomCode + user.getId());
        Participant participant;
        if (currentParticipant == null) {
            participant = new Participant(user, code, roomCode, ipAddress, socketId, audio, video);
        } else {
            participant = currentParticipant;
            participant.setId(Long.toString(user.getId()));
            participant.setIp(ipAddress);
            participant.setSocketId(socketId);
            participant.setAudio(audio);
            participant.setVideo(video);
            participant.setConnected(true);
        }

        participantService.save(participant);

        // 사용자 조인 시간 기록
        Room room = meeting.getRoom(roomCode).orElseThrow(() -> new ServiceException(HttpStatus.FORBIDDEN, "common.no.room"));

        RoomUser roomUserCondition = RoomUser.builder().room(Room.builder().id(room.getId()).build()).user(User.builder().id(user.getId()).build()).build();
        roomUserRepository.findOne(Example.of(roomUserCondition)).ifPresent(roomUser -> {
            if (roomUser.getFirstJoinDate() == null) {
                roomUser.setFirstJoinDate(LocalDateTime.now());
                roomUserRepository.save(roomUser);
            }
        });

        Participant condition = Participant.builder().code(meeting.getCode()).roomCode(roomCode).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));
        long connectedUserCount = StreamSupport.stream(users.spliterator(), false).filter(p -> Optional.ofNullable(p.getConnected()).orElse(false)).count();

        // 원래 시간보다 나중에 들어왔거나, 이전 시간이라도 1/4 이상의 인원이 들어오면 회의를 시작한 것으로 시간 기록
        LocalDateTime now = LocalDateTime.now();
        // if (meeting.getRealStartDate() == null && (meeting.getStartDate().isAfter(now) || connectedUserCount > (meeting.getUsers().size() / 4))) {
        if (meeting.getRealStartDate() == null && (meeting.getStartDate().isAfter(now) || connectedUserCount > 0)) {
            meeting.setRealStartDate(now);
            updateMeetingInfo(meeting, user.getId());
        }

        return participant;
    }

    public void updateUserTalkedInfo(Meeting meeting, UserSession userSession, Long count, Long time) {
        MeetingUser meetingUserCondition = MeetingUser.builder().meeting(Meeting.builder().id(meeting.getId()).build()).user(User.builder().id(userSession.getId()).build()).build();
        meetingUserRepository.findOne(Example.of(meetingUserCondition)).ifPresent(meetingUser -> {
            meetingUser.setTalkedCount(Optional.ofNullable(meetingUser.getTalkedCount()).orElse(0L) + count);
            meetingUser.setTalkedSeconds(Optional.ofNullable(meetingUser.getTalkedSeconds()).orElse(0L) + time);
            meetingUserRepository.save(meetingUser);
        });
    }

    public void updateRoomUserTalkedInfo(Room room, UserSession userSession, Long count, Long time) {
        RoomUser roomUserCondition = RoomUser.builder().room(Room.builder().id(room.getId()).build()).user(User.builder().id(userSession.getId()).build()).build();
        roomUserRepository.findOne(Example.of(roomUserCondition)).ifPresent(roomUser -> {
            roomUser.setTalkedCount(Optional.ofNullable(roomUser.getTalkedCount()).orElse(0L) + count);
            roomUser.setTalkedSeconds(Optional.ofNullable(roomUser.getTalkedSeconds()).orElse(0L) + time);
            roomUserRepository.save(roomUser);
        });
    }

    public void updateUserLeaveInfo(String socketSessionId, UserSession userSession) {
        Participant condition = Participant.builder().socketId(socketSessionId).build();
        LocalDateTime now = LocalDateTime.now();

        participantService.findOne(condition).ifPresent(participant -> {
            participant.setLeaveTime(now);
            participant.setConnected(false);
            participant.setSocketId(null);
            participantService.save(participant);

            if (participant.getRoomCode() == null) {
                this.selectMeetingInfo(participant.getCode()).ifPresent(meeting -> {
                    // 사용자 아웃 및 기타 정보 기록
                    MeetingUser meetingUserCondition = MeetingUser.builder().meeting(Meeting.builder().id(meeting.getId()).build()).user(User.builder().id(userSession.getId()).build()).build();
                    meetingUserRepository.findOne(Example.of(meetingUserCondition)).ifPresent(meetingUser -> {

                        meetingUser.setTalkedCount(Optional.ofNullable(meetingUser.getTalkedCount()).orElse(0L) + participant.getTalkedCount());
                        meetingUser.setTalkedSeconds(Optional.ofNullable(meetingUser.getTalkedSeconds()).orElse(0L) + participant.getTalkedSeconds());
                        meetingUser.setLastOutDate(LocalDateTime.now());
                        if (meetingUser.getFirstJoinDate() != null) {
                            meetingUser.setJoinDurationSeconds(ChronoUnit.SECONDS.between(meetingUser.getFirstJoinDate(), meetingUser.getLastOutDate()));
                        }

                        meetingUserRepository.save(meetingUser);
                    });
                });
            } else {
                this.selectMeetingInfo(participant.getCode()).ifPresent(meeting -> {
                    // 사용자 아웃 및 기타 정보 기록
                    if (meeting.getRoom(participant.getRoomCode()).isPresent()) {
                        RoomUser roomUserCondition = RoomUser.builder().room(meeting.getRoom(participant.getRoomCode()).get()).user(User.builder().id(userSession.getId()).build()).build();
                        roomUserRepository.findOne(Example.of(roomUserCondition)).ifPresent(roomUser -> {
                            roomUser.setTalkedCount(Optional.ofNullable(roomUser.getTalkedCount()).orElse(0L) + participant.getTalkedCount());
                            roomUser.setTalkedSeconds(Optional.ofNullable(roomUser.getTalkedSeconds()).orElse(0L) + participant.getTalkedSeconds());
                            roomUser.setLastOutDate(LocalDateTime.now());
                            if (roomUser.getFirstJoinDate() != null) {
                                roomUser.setJoinDurationSeconds(ChronoUnit.SECONDS.between(roomUser.getFirstJoinDate(), roomUser.getLastOutDate()));
                            }

                            roomUserRepository.save(roomUser);
                        });
                    }

                });
            }


            Meeting currentMeeting = null;
            if (participant.getCode() != null) {
                if (participant.getRoomCode() == null) {
                    Participant conferenceCondition = Participant.builder().code(participant.getCode()).build();
                    // 모든 사용자가 접속 종료하였고, 시작시간보다 나중이거나, 시작시간이 기록되어 있다면, 회의 시간을 기록하고 관련 기능을 중지
                    Iterable<Participant> conferenceUsers = participantService.findAll(conferenceCondition);
                    long connectedUserCount = StreamSupport.stream(conferenceUsers.spliterator(), false).filter(p -> Optional.ofNullable(p.getConnected()).orElse(false)).count();
                    if (connectedUserCount < 1) {
                        currentMeeting = this.selectMeetingInfo(participant.getCode()).orElse(null);
                        Optional.ofNullable(currentMeeting).ifPresent(meeting -> {
                            if (meeting.getStartDate().isAfter(now) || meeting.getRealStartDate() != null) {
                                meeting.setRealEndDate(now);
                                meeting.setDailyScrumStarted(false);
                                Optional.ofNullable(meeting.getRealStartDate())
                                        .ifPresent(realStartTime -> meeting.setDurationSeconds(ChronoUnit.SECONDS.between(realStartTime, meeting.getRealEndDate())));
                            }
                            this.updateMeetingInfo(meeting, userSession);

                            // 모든 레디스 사용자 정보 삭제
                            for (Participant p : conferenceUsers) {
                                participantService.deleteById(p.getKey());
                            }

                        });
                    }
                } else {
                    Participant conferenceCondition = Participant.builder().code(participant.getCode()).roomCode(participant.getRoomCode()).build();
                    // 모든 사용자가 접속 종료하였고, 시작시간보다 나중이거나, 시작시간이 기록되어 있다면, 회의 시간을 기록하고 관련 기능을 중지
                    Iterable<Participant> conferenceUsers = participantService.findAll(conferenceCondition);
                    long connectedRoomUserCount = StreamSupport.stream(conferenceUsers.spliterator(), false).filter(p -> Optional.ofNullable(p.getConnected()).orElse(false)).count();
                    if (connectedRoomUserCount < 1) {
                        currentMeeting = this.selectMeetingInfo(participant.getCode()).orElse(null);
                        if (currentMeeting != null) {
                            Room room = currentMeeting.getRoom(participant.getRoomCode()).orElse(null);
                            if (room != null) {
                                if (room.getStartDate().isAfter(now)) {
                                    room.setEndDate(now);

                                    Optional.ofNullable(room.getStartDate())
                                            .ifPresent(startTime -> room.setDurationSeconds(ChronoUnit.SECONDS.between(startTime, room.getEndDate())));
                                }
                                this.updateRoomInfo(room, userSession.getId());

                                // 모든 레디스 사용자 정보 삭제
                                for (Participant p : conferenceUsers) {
                                    participantService.deleteById(p.getKey());
                                }
                            }
                        }


                    }
                }

            }

            HashMap<String, Object> data = new HashMap<>();
            data.put("participant", participant);
            MessageData message = MessageData.builder().type("LEAVE").data(data).build();
            if (participant.getRoomCode() == null) {
                messageSendService.sendTo("meets/" + participant.getCode(), message, userSession);
            } else {
                messageSendService.sendTo("meets/" + participant.getCode() + "/rooms/" + participant.getRoomCode(), message, userSession);
            }


            if (currentMeeting != null && participant.getRoomCode() == null) {
                Map<String, Object> notifyData = new HashMap<>();
                notifyData.put("meetingId", currentMeeting.getId());
                messageSendService.sendTo("meets/notify", MessageData.builder().type("LEAVE").data(notifyData).build(), null);
            }

        });
    }

    public Long selectAllMeetingCount() {
        return meetingRepository.countBy();
    }

    public Long selectRoomCount(Long meetingId, String code) {
        return roomRepository.countByMeetingIdAndCode(meetingId, code);
    }

    public Room saveRoom(Room room) {
        return roomRepository.save(room);
    }


}
