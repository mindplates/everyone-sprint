package com.mindplates.everyonesprint.biz.sprint.service;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.repository.MeetingRepository;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.sprint.entity.*;
import com.mindplates.everyonesprint.biz.sprint.repository.SprintDailyMeetingAnswerRepository;
import com.mindplates.everyonesprint.biz.sprint.repository.SprintRepository;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SprintService {

    final private SprintRepository sprintRepository;
    final private MeetingRepository meetingRepository;
    final private SprintDailyMeetingAnswerRepository sprintDailyMeetingAnswerRepository;

    public SprintService(SprintRepository sprintRepository, MeetingRepository meetingRepository, SprintDailyMeetingAnswerRepository sprintDailyMeetingAnswerRepository) {
        this.sprintRepository = sprintRepository;
        this.meetingRepository = meetingRepository;
        this.sprintDailyMeetingAnswerRepository = sprintDailyMeetingAnswerRepository;
    }

    public boolean selectIsExistProjectSprintName(Long projectId, Long sprintId, String name) {
        if (sprintId == null) {
            return sprintRepository.countByProjectIdAndName(projectId, name) > 0L;
        }

        return sprintRepository.countByProjectIdAndIdNotAndName(projectId, sprintId, name) > 0L;
    }

    public Sprint createSprintInfo(Sprint sprint, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        sprint.setCreationDate(now);
        sprint.setLastUpdateDate(now);
        sprint.setCreatedBy(userSession.getId());
        sprint.setLastUpdatedBy(userSession.getId());
        sprint.setClosed(false);
        sprintRepository.save(sprint);

        LocalDateTime startDate = sprint.getStartDate();
        LocalDateTime endDate = sprint.getEndDate();

        ArrayList<Meeting> meetings = new ArrayList<>();

        for (SprintDailyMeeting sprintDailyMeeting : sprint.getSprintDailyMeetings()) {
            meetings.addAll(makeMeetings(sprintDailyMeeting, startDate, endDate, userSession));
        }

        for (SprintDailySmallTalkMeeting sprintDailySmallTalkMeeting : sprint.getSprintDailySmallTalkMeetings()) {
            meetings.addAll(makeMeetings(sprintDailySmallTalkMeeting, startDate, endDate, userSession));
        }

        if (meetings.size() > 0) {
            meetingRepository.saveAll(meetings);
        }

        return sprint;
    }

    public Sprint updateSprintInfo(Sprint sprint, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        sprint.setLastUpdateDate(now);
        sprint.setLastUpdatedBy(userSession.getId());

        LocalDateTime startDate = sprint.getStartDate();
        LocalDateTime endDate = sprint.getEndDate();

        List<Meeting> updateMeetings = new ArrayList<>();
        List<Meeting> deleteMeetings = new ArrayList<>();

        // 스프린트 스크럼 미팅 및 미팅 삭제
        List<SprintDailyMeeting> deleteSprintDailyMeetings = new ArrayList<>();
        sprint.getSprintDailyMeetings().stream().filter((sprintDailyMeeting -> "D".equals(sprintDailyMeeting.getCRUD()))).forEach((sprintDailyMeeting -> {
            deleteSprintDailyMeetings.add(sprintDailyMeeting);
            meetingRepository.deleteAllBySprintDailyMeetingId(sprintDailyMeeting.getId());
        }));
        sprint.getSprintDailyMeetings().removeAll(deleteSprintDailyMeetings);

        // 새 미팅 정보에 따른 미팅 생성
        sprint.getSprintDailyMeetings().stream().filter((sprintDailyMeeting -> "C".equals(sprintDailyMeeting.getCRUD()))).forEach(sprintDailyMeeting -> updateMeetings.addAll(makeMeetings((AbstractDailyMeeting) sprintDailyMeeting, startDate, endDate, userSession)));

        sprint.getSprintDailyMeetings().stream().filter((sprintDailyMeeting -> "U".equals(sprintDailyMeeting.getCRUD()))).forEach((sprintDailyMeeting -> {
            List<Meeting> meetings = meetingRepository.findAllBySprintIdAndSprintDailyMeetingId(sprint.getId(), sprintDailyMeeting.getId());
            fillMeetings(sprint, userSession, now, startDate, endDate, updateMeetings, deleteMeetings, sprintDailyMeeting, meetings);
        }));

        // 스몰톡 미팅 및 미팅 삭제
        List<SprintDailySmallTalkMeeting> deleteSprintDailySmallTalkMeetings = new ArrayList<>();
        sprint.getSprintDailySmallTalkMeetings().stream().filter((sprintDailySmallTalkMeeting -> "D".equals(sprintDailySmallTalkMeeting.getCRUD()))).forEach((sprintDailySmallTalkMeeting -> {
            deleteSprintDailySmallTalkMeetings.add(sprintDailySmallTalkMeeting);
            meetingRepository.deleteAllBySprintDailySmallTalkMeetingId(sprintDailySmallTalkMeeting.getId());
        }));
        sprint.getSprintDailySmallTalkMeetings().removeAll(deleteSprintDailySmallTalkMeetings);

        // 새 스몰톡 미팅 생성
        sprint.getSprintDailySmallTalkMeetings()
                .stream()
                .filter((sprintDailySmallTalkMeeting -> "C".equals(sprintDailySmallTalkMeeting.getCRUD())))
                .forEach(sprintDailySmallTalkMeeting -> updateMeetings.addAll(makeMeetings((AbstractDailyMeeting) sprintDailySmallTalkMeeting, startDate, endDate, userSession)));

        sprint.getSprintDailySmallTalkMeetings()
                .stream()
                .filter((sprintDailySmallTalkMeeting -> "U".equals(sprintDailySmallTalkMeeting.getCRUD())))
                .forEach((sprintDailySmallTalkMeeting -> {
                    List<Meeting> meetings = meetingRepository.findAllBySprintIdAndSprintDailySmallTalkMeetingId(sprint.getId(), sprintDailySmallTalkMeeting.getId());
                    fillMeetings(sprint, userSession, now, startDate, endDate, updateMeetings, deleteMeetings, sprintDailySmallTalkMeeting, meetings);
                }));


        meetingRepository.deleteAll(deleteMeetings);
        meetingRepository.saveAll(updateMeetings);
        sprintRepository.save(sprint);

        return sprint;
    }

    private void fillMeetings(Sprint sprint, UserSession userSession, LocalDateTime now, LocalDateTime startDate, LocalDateTime endDate, List<Meeting> updateMeetings, List<Meeting> deleteMeetings, AbstractDailyMeeting abstractDailyMeeting, List<Meeting> meetings) {
        // 범위에 포함되지 않는 미팅 삭제
        meetings.forEach((meeting -> {
            if (meeting.getStartDate().isBefore(startDate) || meeting.getStartDate().isAfter(endDate)) {
                deleteMeetings.add(meeting);
            }
        }));

        LocalDateTime date = startDate;
        while (date.isBefore(endDate)) {
            final LocalDateTime currentDate = date;
            Meeting currentDateMeeting = meetings.stream().filter((meeting -> meeting.getStartDate().getYear() == currentDate.getYear() && meeting.getStartDate().getDayOfYear() == currentDate.getDayOfYear())).findFirst().orElse(null);

            if (currentDateMeeting == null) {
                LocalDateTime meetingStartDate = currentDate.withHour(abstractDailyMeeting.getStartTime().getHour()).withMinute(abstractDailyMeeting.getStartTime().getMinute()).withSecond(0).withNano(0);
                if (meetingStartDate.isAfter(startDate) && abstractDailyMeeting.getDays().charAt(currentDate.getDayOfWeek().getValue() - 1) == '1') {
                    Meeting meeting = getMeeting(sprint, userSession, now, currentDate, abstractDailyMeeting, null);
                    updateMeetings.add(meeting);
                }
            } else {
                if (abstractDailyMeeting.getDays().charAt(currentDate.getDayOfWeek().getValue() - 1) == '1') {
                    Meeting meeting = getMeeting(sprint, userSession, now, currentDate, abstractDailyMeeting, currentDateMeeting);
                    updateMeetings.add(meeting);
                } else {
                    deleteMeetings.add(currentDateMeeting);
                }
            }

            date = date.plusDays(1);
        }
    }

    private List<Meeting> makeMeetings(AbstractDailyMeeting abstractDailyMeeting, LocalDateTime startDate, LocalDateTime endDate, UserSession userSession) {

        ArrayList<Meeting> meetings = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime date = startDate;
        while (date.isBefore(endDate)) {
            final LocalDateTime currentDate = date;
            LocalDateTime meetingStartDate = startDate.withHour(abstractDailyMeeting.getStartTime().getHour()).withMinute(abstractDailyMeeting.getStartTime().getMinute()).withSecond(0).withNano(0);
            int dayOfWeekIndex = currentDate.getDayOfWeek().getValue() - 1;
            if (meetingStartDate.isAfter(startDate) && abstractDailyMeeting.getDays().charAt(dayOfWeekIndex) == '1') {
                Meeting meeting = getMeeting(abstractDailyMeeting.getSprint(), userSession, now, currentDate, abstractDailyMeeting, null);
                if (abstractDailyMeeting instanceof SprintDailySmallTalkMeeting) {
                    meeting.setLimitUserCount(((SprintDailySmallTalkMeeting) abstractDailyMeeting).getLimitUserCount());
                }
                meetings.add(meeting);
            }

            date = date.plusDays(1);
        }

        return meetings;
    }


    private Meeting getMeeting(Sprint sprint, UserSession userSession, LocalDateTime now, LocalDateTime currentDate, AbstractDailyMeeting abstractDailyMeeting, Meeting pMeeting) {
        String code = pMeeting != null ? pMeeting.getCode() : "";
        Long count;

        if (pMeeting == null) {
            do {
                code = MeetingService.makeShortUUID();
                count = meetingRepository.countByCode(code);
            } while (count > 0L);
        }

        LocalDateTime meetingStartDate = currentDate.withHour(abstractDailyMeeting.getStartTime().getHour()).withMinute(abstractDailyMeeting.getStartTime().getMinute()).withSecond(0).withNano(0);
        LocalDateTime meetingEndDate = currentDate.withHour(abstractDailyMeeting.getEndTime().getHour()).withMinute(abstractDailyMeeting.getEndTime().getMinute()).withSecond(0).withNano(0);

        Meeting meeting = pMeeting == null ? Meeting.builder().build() : pMeeting;

        meeting.setSprint(sprint);
        meeting.setName(abstractDailyMeeting.getName());
        meeting.setStartDate(meetingStartDate);
        meeting.setEndDate(meetingEndDate);
        meeting.setCode(code);

        if (abstractDailyMeeting instanceof SprintDailyMeeting) {
            meeting.setSprintDailyMeeting((SprintDailyMeeting) abstractDailyMeeting);

            List<MeetingUser> meetingUsers = Optional.ofNullable(meeting.getUsers()).orElse(new ArrayList<>());
            meetingUsers.clear();

            sprint.getUsers()
                    .forEach((sprintUser) -> {
                        MeetingUser meetingUser = MeetingUser.builder().build();
                        meetingUser.setUser(User.builder().id(sprintUser.getUser().getId()).build());
                        meetingUser.setMeeting(meeting);
                        meetingUsers.add(meetingUser);
                    });

            meeting.setUsers(meetingUsers);

        } else if (abstractDailyMeeting instanceof SprintDailySmallTalkMeeting) {
            meeting.setLimitUserCount(((SprintDailySmallTalkMeeting) abstractDailyMeeting).getLimitUserCount());
            meeting.setSprintDailySmallTalkMeeting((SprintDailySmallTalkMeeting) abstractDailyMeeting);
        }

        meeting.setLastUpdateDate(now);
        meeting.setLastUpdatedBy(userSession.getId());
        if (pMeeting != null) {
            meeting.setCreationDate(now);
            meeting.setCreatedBy(userSession.getId());
        }

        return meeting;
    }

    public void deleteSprintInfo(Sprint sprint) {
        List<Meeting> sprintMeetings = meetingRepository.findAllBySprintId(sprint.getId());
        sprintDailyMeetingAnswerRepository.deleteAllBySprintId(sprint.getId());
        meetingRepository.deleteAll(sprintMeetings);
        sprintRepository.delete(sprint);
    }

    public List<Sprint> selectUserSprintList(UserSession userSession, Boolean closed) {
        return sprintRepository.findAllByUsersUserIdAndClosed(userSession.getId(), closed);
    }

    public Sprint selectSprintInfo(Long id) {
        return sprintRepository.findById(id).orElse(null);
    }

    public List<SprintDailyMeetingAnswer> createSprintDailyMeetingAnswers(List<SprintDailyMeetingAnswer> sprintDailyMeetingAnswers, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();

        sprintDailyMeetingAnswers.forEach((sprintDailyMeetingAnswer -> {
            if (sprintDailyMeetingAnswer.getId() == null) {
                sprintDailyMeetingAnswer.setCreationDate(now);
                sprintDailyMeetingAnswer.setCreatedBy(userSession.getId());
            }

            sprintDailyMeetingAnswer.setLastUpdateDate(now);
            sprintDailyMeetingAnswer.setLastUpdatedBy(userSession.getId());
        }));

        return sprintDailyMeetingAnswerRepository.saveAll(sprintDailyMeetingAnswers);
    }

    public List<SprintDailyMeetingAnswer> selectSprintDailyMeetingAnswerList(Long sprintId, LocalDate date) {
        return sprintDailyMeetingAnswerRepository.findAllBySprintIdAndDateEquals(sprintId, date);
    }

    public boolean selectIsSprintUserScrumInfoRegistered(Long sprintId, LocalDate date, Long userId) {
        return sprintDailyMeetingAnswerRepository.countBySprintIdAndDateEqualsAndUserId(sprintId, date, userId) > 0L;
    }

    public List<SprintDailyMeetingAnswer> selectLastUserSprintDailyMeetingAnswerList(Long sprintId, Long meetingId, Long userId, LocalDate date) {
        SprintDailyMeetingAnswer lastAnswer = sprintDailyMeetingAnswerRepository.findTop1BySprintIdAndSprintDailyMeetingQuestionSprintDailyMeetingIdAndUserIdAndDateLessThanOrderByDateDesc(sprintId, meetingId, userId, date);
        if (lastAnswer != null) {
            return sprintDailyMeetingAnswerRepository.findAllBySprintIdAndSprintDailyMeetingQuestionSprintDailyMeetingIdAndUserIdAndDateEquals(sprintId, meetingId, userId, lastAnswer.getDate());
        }

        return new ArrayList<>();

    }

    public List<SprintDailyMeetingAnswer> selectSprintDailyMeetingAnswerList(Long sprintId, Long meetingId, LocalDate date) {
        return sprintDailyMeetingAnswerRepository.findAllBySprintIdAndSprintDailyMeetingQuestionSprintDailyMeetingIdAndDateEquals(sprintId, meetingId, date);
    }

    public Long selectAllSprintCount() {
        return sprintRepository.countBy();
    }

    public Long selectProjectActivatedSprintCount(Long projectId) {
        return sprintRepository.countByProjectIdAndActivatedTrue(projectId);
    }


}
