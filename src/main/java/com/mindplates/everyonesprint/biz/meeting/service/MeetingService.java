package com.mindplates.everyonesprint.biz.meeting.service;

import com.mindplates.everyonesprint.biz.meeting.entity.*;
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
        meeting.setStarted(false);
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

        List<Meeting> meetings = new ArrayList<>();
        if (sprintId != null) {
            meetings.addAll(meetingRepository.findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndSprintUsersUserIdAndTypeEqualsAndSprintClosedFalse(sprintId, date, nextDay, userSession.getId(), MeetingTypeCode.SMALLTALK));
            meetings.addAll(meetingRepository.findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserIdAndSprintClosedFalse(sprintId, date, nextDay, userSession.getId()));
            return meetings;
        } else {
            meetings.addAll(meetingRepository.findAllByStartDateGreaterThanEqualAndStartDateLessThanEqualAndSprintUsersUserIdAndTypeEqualsAndSprintClosedFalse(date, nextDay, userSession.getId(), MeetingTypeCode.SMALLTALK));
            meetings.addAll(meetingRepository.findAllByStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserIdAndSprintClosedFalse(date, nextDay, userSession.getId()));
        }


        return meetings;
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

        // 미팅이 시작되었는지 판단하여 업데이트
        Participant condition = Participant.builder().code(meeting.getCode()).build();
        updateMeetingRealStarted(condition, user, meeting);

        // 사용자 조인 시간 기록
        MeetingUser meetingUserCondition = MeetingUser.builder().meeting(Meeting.builder().id(meeting.getId()).build()).user(User.builder().id(user.getId()).build()).build();
        MeetingUser currentMeetingUser = meetingUserRepository.findOne(Example.of(meetingUserCondition)).get();
        updateMeetingUserJoinInfo(currentMeetingUser);

        return participant;
    }

    private void updateMeetingRealStarted(Participant condition, User user, Meeting meeting) {
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));

        long connectedUserCount = StreamSupport.stream(users.spliterator(), false).filter(p -> Optional.ofNullable(p.getConnected()).orElse(false)).count();
        // 원래 시간보다 나중에 들어왔거나, 이전 시간이라도 2명 이상의 인원이 들어오면 회의를 시작한 것으로 시간 기록
        LocalDateTime now = LocalDateTime.now();

        if (condition.getRoomCode() == null) {
            if (!meeting.getStarted() && (meeting.getStartDate().isBefore(now) || connectedUserCount > 1)) {
                if (meeting.getRealStartDate() == null) {
                    meeting.setRealStartDate(now);
                }
                meeting.setLastRealStartDate(now);
                meeting.setStarted(true);
                updateMeetingInfo(meeting, user.getId());
            }
        } else {
            meeting.getRoom(condition.getRoomCode()).ifPresent(room -> {
                if (!room.getStarted() && (meeting.getStartDate().isBefore(now) || connectedUserCount > 1)) {
                    if (room.getStartDate() == null) {
                        room.setStartDate(now);
                    }
                    room.setLastStartDate(now);
                    room.setStarted(true);
                    updateMeetingInfo(meeting, user.getId());
                }
            });
        }

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

        // 미팅이 시작되었는지 판단하여 업데이트
        Participant condition = Participant.builder().code(meeting.getCode()).roomCode(roomCode).build();
        updateMeetingRealStarted(condition, user, meeting);

        // 사용자 조인 시간 기록
        Room room = meeting.getRoom(roomCode).orElseThrow(() -> new ServiceException(HttpStatus.FORBIDDEN, "common.no.room"));
        RoomUser roomUserCondition = RoomUser.builder().room(Room.builder().id(room.getId()).build()).user(User.builder().id(user.getId()).build()).build();
        RoomUser currentRoomUser = roomUserRepository.findOne(Example.of(roomUserCondition)).get();
        updateMeetingUserJoinInfo(currentRoomUser);

        return participant;
    }

    public void updateMeetingUserJoinInfo(AbstractMeetingUser meetingUser) {
        if (meetingUser != null) {
            LocalDateTime now = LocalDateTime.now();
            if (meetingUser.getFirstJoinDate() == null) {
                meetingUser.setFirstJoinDate(now);
            }
            meetingUser.setLastJoinDate(now);
            if (meetingUser instanceof MeetingUser) {
                meetingUserRepository.save((MeetingUser) meetingUser);
            } else if (meetingUser instanceof RoomUser) {
                roomUserRepository.save((RoomUser) meetingUser);
            }
        }
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

            // 사용자 아웃 및 기타 정보 기록
            this.selectMeetingInfo(participant.getCode()).ifPresent(meeting -> {
                if (meeting.getRoom(participant.getRoomCode()).isPresent()) {
                    RoomUser roomUserCondition = RoomUser.builder().room(meeting.getRoom(participant.getRoomCode()).get()).user(User.builder().id(userSession.getId()).build()).build();
                    roomUserRepository.findOne(Example.of(roomUserCondition)).ifPresent(roomUser -> updateMeetingUserJoinDuration(participant, roomUser));
                } else {
                    MeetingUser meetingUserCondition = MeetingUser.builder().meeting(Meeting.builder().id(meeting.getId()).build()).user(User.builder().id(userSession.getId()).build()).build();
                    meetingUserRepository.findOne(Example.of(meetingUserCondition)).ifPresent(meetingUser -> updateMeetingUserJoinDuration(participant, meetingUser));
                }
            });


            if (participant.getCode() != null) {
                if (participant.getRoomCode() == null) {
                    Participant conferenceCondition = Participant.builder().code(participant.getCode()).build();
                    // 모든 사용자가 접속 종료하였고, 시작시간보다 나중이거나, 시작시간이 기록되어 있다면, 회의 시간을 기록하고 관련 기능을 중지
                    Iterable<Participant> conferenceUsers = participantService.findAll(conferenceCondition);
                    long connectedUserCount = StreamSupport.stream(conferenceUsers.spliterator(), false).filter(p -> Optional.ofNullable(p.getConnected()).orElse(false)).count();
                    if (connectedUserCount < 1) {
                        this.selectMeetingInfo(participant.getCode()).ifPresent(currentMeeting -> {
                            if (currentMeeting.getStartDate().isBefore(now) || currentMeeting.getLastRealStartDate() != null) {
                                currentMeeting.setRealEndDate(now);
                                currentMeeting.setDailyScrumStarted(false);
                                currentMeeting.setDurationSeconds(Optional.ofNullable(currentMeeting.getDurationSeconds()).orElse(0L) + ChronoUnit.SECONDS.between(currentMeeting.getLastRealStartDate(), currentMeeting.getRealEndDate()));
                                currentMeeting.setStarted(false);
                                this.updateMeetingInfo(currentMeeting, userSession);
                            }

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
                        this.selectMeetingInfo(participant.getCode()).ifPresent(currentMeeting -> currentMeeting.getRoom(participant.getRoomCode()).ifPresent(room -> {
                            if (room.getStartDate().isBefore(now) || room.getLastStartDate() != null) {
                                room.setEndDate(now);
                                room.setDurationSeconds(Optional.ofNullable(room.getDurationSeconds()).orElse(0L) + ChronoUnit.SECONDS.between(room.getLastStartDate(), room.getEndDate()));
                                room.setStarted(false);
                                this.updateRoomInfo(room, userSession.getId());
                            }

                            // 모든 레디스 사용자 정보 삭제
                            for (Participant p : conferenceUsers) {
                                participantService.deleteById(p.getKey());
                            }
                        }));
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

            // 미팅의 사용자의 숫자가 줄었음을 전파
            this.selectMeetingInfo(participant.getCode()).ifPresent(meeting -> {
                if (participant.getRoomCode() == null) {
                    Map<String, Object> notifyData = new HashMap<>();
                    notifyData.put("meetingId", meeting.getId());
                    messageSendService.sendTo("meets/notify", MessageData.builder().type("LEAVE").data(notifyData).build(), null);
                }
            });

        });
    }

    private void updateMeetingUserJoinDuration(Participant participant, AbstractMeetingUser meetingUser) {
        meetingUser.setTalkedCount(Optional.ofNullable(meetingUser.getTalkedCount()).orElse(0L) + participant.getTalkedCount());
        meetingUser.setTalkedSeconds(Optional.ofNullable(meetingUser.getTalkedSeconds()).orElse(0L) + participant.getTalkedSeconds());
        meetingUser.setLastOutDate(LocalDateTime.now());
        if (meetingUser.getLastJoinDate() != null) {
            meetingUser.setJoinDurationSeconds(Optional.ofNullable(meetingUser.getJoinDurationSeconds()).orElse(0L) + ChronoUnit.SECONDS.between(meetingUser.getLastJoinDate(), meetingUser.getLastOutDate()));
        }

        if (meetingUser instanceof MeetingUser) {
            meetingUserRepository.save((MeetingUser) meetingUser);
        } else if (meetingUser instanceof RoomUser) {
            roomUserRepository.save((RoomUser) meetingUser);
        }

    }

    public Long selectAllMeetingCount() {
        return meetingRepository.countBy();
    }

    public Long selectAllMeetingCount(String spaceCode) {
        return meetingRepository.countBySprintProjectSpaceCode(spaceCode);
    }

    public Long selectRoomCount(Long meetingId, String code) {
        return roomRepository.countByMeetingIdAndCode(meetingId, code);
    }

    public Room saveRoom(Room room) {
        return roomRepository.save(room);
    }


}
