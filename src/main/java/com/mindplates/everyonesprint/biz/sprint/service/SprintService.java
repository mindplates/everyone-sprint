package com.mindplates.everyonesprint.biz.sprint.service;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.repository.MeetingRepository;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.sprint.entity.*;
import com.mindplates.everyonesprint.biz.sprint.repository.ScrumMeetingAnswerRepository;
import com.mindplates.everyonesprint.biz.sprint.repository.SprintRepository;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.MeetingTypeCode;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.config.CacheConfig;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class SprintService {

    final private SprintRepository sprintRepository;
    final private MeetingRepository meetingRepository;
    final private ScrumMeetingAnswerRepository scrumMeetingPlanAnswerRepository;

    @Cacheable(key = "#id", value = CacheConfig.SPRINT)
    public Optional<Sprint> selectSprintInfo(Long id) {
        return sprintRepository.findById(id);
    }

    @CacheEvict(key = "#sprint.id", value = CacheConfig.SPRINT)
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

        for (ScrumMeetingPlan scrumMeetingPlan : sprint.getScrumMeetingPlans()) {
            meetings.addAll(makeMeetings(scrumMeetingPlan, startDate, endDate, userSession));
        }

        for (SmallTalkMeetingPlan smallTalkMeetingPlan : sprint.getSmallTalkMeetingPlans()) {
            meetings.addAll(makeMeetings(smallTalkMeetingPlan, startDate, endDate, userSession));
        }

        if (meetings.size() > 0) {
            meetingRepository.saveAll(meetings);
        }

        return sprint;
    }

    @CacheEvict(key = "#sprint.id", value = CacheConfig.SPRINT)
    public Sprint updateSprintInfo(Sprint sprint, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        sprint.setLastUpdateDate(now);
        sprint.setLastUpdatedBy(userSession.getId());

        LocalDateTime startDate = sprint.getStartDate();
        LocalDateTime endDate = sprint.getEndDate();

        List<Meeting> updateMeetings = new ArrayList<>();
        List<Meeting> deleteMeetings = new ArrayList<>();

        // 스프린트 스크럼 미팅
        List<ScrumMeetingPlan> deleteSprintDailyMeetings = new ArrayList<>();
        sprint.getScrumMeetingPlans().stream().filter((scrumMeetingPlan -> "D".equals(scrumMeetingPlan.getCRUD()))).forEach((scrumMeetingPlan -> {
            deleteSprintDailyMeetings.add(scrumMeetingPlan);
            meetingRepository.deleteAllByScrumMeetingPlanId(scrumMeetingPlan.getId());
        }));

        deleteSprintDailyMeetings.forEach(scrumMeetingPlan -> sprint.getScrumMeetingPlans().remove(scrumMeetingPlan));

        sprint.getScrumMeetingPlans().stream().filter((scrumMeetingPlan -> "C".equals(scrumMeetingPlan.getCRUD()))).forEach(scrumMeetingPlan -> updateMeetings.addAll(makeMeetings(scrumMeetingPlan, startDate, endDate, userSession)));

        sprint.getScrumMeetingPlans().stream().filter((scrumMeetingPlan -> "U".equals(scrumMeetingPlan.getCRUD()))).forEach((scrumMeetingPlan -> {
            List<Meeting> meetings = meetingRepository.findAllBySprintIdAndScrumMeetingPlanId(sprint.getId(), scrumMeetingPlan.getId());
            fillMeetings(sprint, userSession, now, startDate, endDate, updateMeetings, deleteMeetings, scrumMeetingPlan, meetings);
        }));

        // 스몰톡 미팅
        List<SmallTalkMeetingPlan> deleteSprintDailySmallTalkMeetings = new ArrayList<>();
        sprint.getSmallTalkMeetingPlans()
                .stream()
                .filter((smallTalkMeetingPlan -> "D".equals(smallTalkMeetingPlan.getCRUD())))
                .forEach((smallTalkMeetingPlan -> {
                    deleteSprintDailySmallTalkMeetings.add(smallTalkMeetingPlan);
                    meetingRepository.deleteAllBySmallTalkMeetingPlanId(smallTalkMeetingPlan.getId());
                }));

        deleteSprintDailySmallTalkMeetings.forEach(smallTalkMeetingPlan -> sprint.getSmallTalkMeetingPlans().remove(smallTalkMeetingPlan));

        // 새 스몰톡 미팅 생성
        sprint.getSmallTalkMeetingPlans()
                .stream()
                .filter((smallTalkMeetingPlan -> "C".equals(smallTalkMeetingPlan.getCRUD())))
                .forEach(smallTalkMeetingPlan -> updateMeetings.addAll(makeMeetings(smallTalkMeetingPlan, startDate, endDate, userSession)));

        sprint.getSmallTalkMeetingPlans()
                .stream()
                .filter((smallTalkMeetingPlan -> "U".equals(smallTalkMeetingPlan.getCRUD())))
                .forEach((smallTalkMeetingPlan -> {
                    List<Meeting> meetings = meetingRepository.findAllBySprintIdAndSmallTalkMeetingPlanId(sprint.getId(), smallTalkMeetingPlan.getId());
                    fillMeetings(sprint, userSession, now, startDate, endDate, updateMeetings, deleteMeetings, smallTalkMeetingPlan, meetings);
                }));


        meetingRepository.deleteAll(deleteMeetings);
        meetingRepository.saveAll(updateMeetings);
        sprintRepository.save(sprint);

        return sprint;
    }

    @CacheEvict(key = "#sprintId", value = CacheConfig.SPRINT)
    public void deleteSprintInfo(long sprintId) {
        List<Meeting> sprintMeetings = meetingRepository.findAllBySprintId(sprintId);
        scrumMeetingPlanAnswerRepository.deleteAllBySprintId(sprintId);
        meetingRepository.deleteAll(sprintMeetings);
        sprintRepository.deleteById(sprintId);
    }

    public boolean selectIsExistProjectSprintName(String spaceCode, Long projectId, Long sprintId, String name) {
        if (sprintId == null) {
            return sprintRepository.countByProjectSpaceCodeAndProjectIdAndName(spaceCode, projectId, name) > 0L;
        }

        return sprintRepository.countByProjectSpaceCodeAndProjectIdAndIdNotAndName(spaceCode, projectId, sprintId, name) > 0L;
    }

    private void fillMeetings(Sprint sprint, UserSession userSession, LocalDateTime now, LocalDateTime startDate, LocalDateTime endDate, List<Meeting> updateMeetings, List<Meeting> deleteMeetings, AbstractMeetingPlan abstractDailyMeeting, List<Meeting> meetings) {
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

    private List<Meeting> makeMeetings(AbstractMeetingPlan abstractDailyMeeting, LocalDateTime startDate, LocalDateTime endDate, UserSession userSession) {

        ArrayList<Meeting> meetings = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime date = startDate;
        while (date.isBefore(endDate)) {
            final LocalDateTime currentDate = date;
            LocalDateTime meetingStartDate = startDate.withHour(abstractDailyMeeting.getStartTime().getHour()).withMinute(abstractDailyMeeting.getStartTime().getMinute()).withSecond(0).withNano(0);
            int dayOfWeekIndex = currentDate.getDayOfWeek().getValue() - 1;
            if (meetingStartDate.isAfter(startDate) && abstractDailyMeeting.getDays().charAt(dayOfWeekIndex) == '1') {
                Meeting meeting = getMeeting(abstractDailyMeeting.getSprint(), userSession, now, currentDate, abstractDailyMeeting, null);
                meeting.setStarted(false);
                if (abstractDailyMeeting instanceof SmallTalkMeetingPlan) {
                    meeting.setType(MeetingTypeCode.SMALLTALK);
                    meeting.setLimitUserCount(((SmallTalkMeetingPlan) abstractDailyMeeting).getLimitUserCount());
                }

                if (abstractDailyMeeting instanceof ScrumMeetingPlan) {
                    meeting.setType(MeetingTypeCode.SCRUM);
                }
                meetings.add(meeting);
            }

            date = date.plusDays(1);
        }

        return meetings;
    }

    private Meeting getMeeting(Sprint sprint, UserSession userSession, LocalDateTime now, LocalDateTime currentDate, AbstractMeetingPlan abstractDailyMeeting, Meeting pMeeting) {
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
        meeting.setStarted(false);
        meeting.setType(MeetingTypeCode.MEETING);

        if (abstractDailyMeeting instanceof ScrumMeetingPlan) {
            meeting.setScrumMeetingPlan((ScrumMeetingPlan) abstractDailyMeeting);
            meeting.setType(MeetingTypeCode.SCRUM);

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

        } else if (abstractDailyMeeting instanceof SmallTalkMeetingPlan) {
            meeting.setLimitUserCount(((SmallTalkMeetingPlan) abstractDailyMeeting).getLimitUserCount());
            meeting.setType(MeetingTypeCode.SMALLTALK);
            meeting.setSmallTalkMeetingPlan((SmallTalkMeetingPlan) abstractDailyMeeting);
        }

        meeting.setLastUpdateDate(now);
        meeting.setLastUpdatedBy(userSession.getId());
        if (pMeeting != null) {
            meeting.setCreationDate(now);
            meeting.setCreatedBy(userSession.getId());
        }

        return meeting;
    }

    public List<Sprint> selectUserSprintList(String spaceCode, UserSession userSession, Boolean closed) {
        // return sprintRepository.findAllByProjectSpaceCodeAndUsersUserIdAndClosed(spaceCode, userSession.getId(), closed);
        return sprintRepository.findUserSprintList(spaceCode, userSession.getId(), closed);
    }

    public List<ScrumMeetingAnswer> createSprintDailyMeetingAnswers(List<ScrumMeetingAnswer> scrumMeetingAnswers, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();

        scrumMeetingAnswers.forEach((scrumMeetingPlanAnswer -> {
            if (scrumMeetingPlanAnswer.getId() == null) {
                scrumMeetingPlanAnswer.setCreationDate(now);
                scrumMeetingPlanAnswer.setCreatedBy(userSession.getId());
            }

            scrumMeetingPlanAnswer.setLastUpdateDate(now);
            scrumMeetingPlanAnswer.setLastUpdatedBy(userSession.getId());
        }));

        return scrumMeetingPlanAnswerRepository.saveAll(scrumMeetingAnswers);
    }

    public List<ScrumMeetingAnswer> selectSprintDailyMeetingAnswerList(Long sprintId, LocalDate date) {
        return scrumMeetingPlanAnswerRepository.findAllBySprintIdAndDateEquals(sprintId, date);
    }

    public boolean selectIsSprintUserScrumInfoRegistered(Long sprintId, LocalDate date, Long userId) {
        return scrumMeetingPlanAnswerRepository.countBySprintIdAndDateEqualsAndUserId(sprintId, date, userId) > 0L;
    }

    public List<ScrumMeetingAnswer> selectLastUserSprintDailyMeetingAnswerList(Long sprintId, Long meetingId, Long userId, LocalDate date) {
        ScrumMeetingAnswer lastAnswer = scrumMeetingPlanAnswerRepository.findTop1BySprintIdAndScrumMeetingQuestionScrumMeetingPlanIdAndUserIdAndDateLessThanOrderByDateDesc(sprintId, meetingId, userId, date);
        if (lastAnswer != null) {
            return scrumMeetingPlanAnswerRepository.findAllBySprintIdAndScrumMeetingQuestionScrumMeetingPlanIdAndUserIdAndDateEquals(sprintId, meetingId, userId, lastAnswer.getDate());
        }

        return new ArrayList<>();

    }

    public List<ScrumMeetingAnswer> selectSprintDailyMeetingAnswerList(Long sprintId, Long meetingId, LocalDate date) {
        return scrumMeetingPlanAnswerRepository.findAllBySprintIdAndScrumMeetingQuestionScrumMeetingPlanIdAndDateEquals(sprintId, meetingId, date);
    }

    public Long selectAllSprintCount() {
        return sprintRepository.countBy();
    }

    public Long selectAllSprintCount(String sprintCode) {
        return sprintRepository.countByProjectSpaceCode(sprintCode);
    }

    public List<Map<String, Object>> selectUserScrumMeetingAnswerCount(Long sprintId) {
        return scrumMeetingPlanAnswerRepository.selectSprintScrumAnswerStatList(sprintId);
    }

}
