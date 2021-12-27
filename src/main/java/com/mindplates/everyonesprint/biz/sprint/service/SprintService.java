package com.mindplates.everyonesprint.biz.sprint.service;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.repository.MeetingRepository;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeeting;
import com.mindplates.everyonesprint.biz.sprint.repository.SprintRepository;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private MeetingService meetingService;

    public Sprint selectByName(String name) {
        return sprintRepository.findByName(name).orElse(null);
    }

    public Sprint createSprintInfo(Sprint sprint, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        sprint.setCreationDate(now);
        sprint.setLastUpdateDate(now);
        sprint.setCreatedBy(userSession.getId());
        sprint.setLastUpdatedBy(userSession.getId());
        sprintRepository.save(sprint);
        sprintRepository.flush();

        LocalDateTime startDate = sprint.getStartDate();
        LocalDateTime endDate = sprint.getEndDate();
        ArrayList meetingList = new ArrayList();

        sprint.getSprintDailyMeetings().stream().forEach((sprintDailyMeeting -> {
            LocalDateTime date = startDate;
            while (date.isBefore(endDate)) {
                final LocalDateTime currentDate = date;
                Meeting meeting = getMeeting(sprint, userSession, now, currentDate, sprintDailyMeeting, null);
                meetingList.add(meeting);
                date = date.plusDays(1);
            }
        }));

        if (meetingList.size() > 0) {
            meetingRepository.saveAll(meetingList);
        }


        return sprint;
    }

    public Sprint updateSprintInfo(Sprint sprint, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        sprint.setLastUpdateDate(now);
        sprint.setLastUpdatedBy(userSession.getId());

        LocalDateTime startDate = sprint.getStartDate();
        LocalDateTime endDate = sprint.getEndDate();
        ArrayList newMeetingList = new ArrayList();

        sprintRepository.save(sprint);
        sprintRepository.flush();

        // 새로운 미팅 생성
        sprint.getSprintDailyMeetings().stream().filter((sprintDailyMeeting -> sprintDailyMeeting.getId() == null)).forEach((sprintDailyMeeting -> {
            LocalDateTime date = startDate;
            while (date.isBefore(endDate)) {
                final LocalDateTime currentDate = date;
                Meeting meeting = getMeeting(sprint, userSession, now, currentDate, sprintDailyMeeting, null);
                newMeetingList.add(meeting);
                date = date.plusDays(1);
            }
        }));

        // 기존 미팅 정보 수정 및 삭제
        sprint.getSprintDailyMeetings().stream().filter((sprintDailyMeeting -> sprintDailyMeeting.getId() != null)).forEach((sprintDailyMeeting -> {

            List<Meeting> meetings = meetingService.selectSprintMeetingList(sprint.getId(), sprintDailyMeeting.getId());

            meetings.forEach((meeting -> {
                LocalDateTime meetingStartDate = meeting.getStartDate().withHour(sprintDailyMeeting.getStartTime().getHour()).withMinute(sprintDailyMeeting.getStartTime().getMinute()).withSecond(0).withNano(0);
                LocalDateTime meetingEndDate = meeting.getEndDate().withHour(sprintDailyMeeting.getEndTime().getHour()).withMinute(sprintDailyMeeting.getEndTime().getMinute()).withSecond(0).withNano(0);

                if (meetingStartDate.isAfter(sprint.getStartDate()) && meetingEndDate.isBefore(sprint.getEndDate())) {
                    Meeting updatedMeeting = getMeeting(sprint, userSession, now, meeting.getStartDate(), sprintDailyMeeting, meeting);
                    meetingService.updateMeetingInfo(updatedMeeting, userSession);
                } else {
                    meetingService.deleteMeetingInfo(meeting);
                }
            }));

            LocalDateTime date = startDate;
            while (date.isBefore(endDate)) {
                final LocalDateTime currentDate = date;
                if (meetings.stream().noneMatch((meeting -> meeting.getStartDate().getYear() == currentDate.getYear() && meeting.getStartDate().getDayOfYear() == currentDate.getDayOfYear()))) {
                    Meeting meeting = getMeeting(sprint, userSession, now, currentDate, sprintDailyMeeting, null);
                    newMeetingList.add(meeting);
                }
                date = date.plusDays(1);
            }


        }));

        if (newMeetingList.size() > 0) {
            meetingRepository.saveAll(newMeetingList);
        }


        return sprint;
    }

    private Meeting getMeeting(Sprint sprint, UserSession userSession, LocalDateTime now, LocalDateTime currentDate, SprintDailyMeeting sprintDailyMeeting, Meeting pMeeting) {
        String code = pMeeting != null ? pMeeting.getCode() : "";
        Long count;

        if (pMeeting == null) {
            do {
                code = pMeeting == null ? MeetingService.makeShortUUID() : pMeeting.getCode();
                count = meetingRepository.countByCode(code);
            } while (count > 0L);
        }

        LocalDateTime meetingStartDate = currentDate.withHour(sprintDailyMeeting.getStartTime().getHour()).withMinute(sprintDailyMeeting.getStartTime().getMinute()).withSecond(0).withNano(0);
        LocalDateTime meetingEndDate = currentDate.withHour(sprintDailyMeeting.getEndTime().getHour()).withMinute(sprintDailyMeeting.getEndTime().getMinute()).withSecond(0).withNano(0);

        Meeting meeting = pMeeting == null ? Meeting.builder().build() : pMeeting;

        meeting.setSprint(sprint);
        meeting.setName(sprintDailyMeeting.getName());
        meeting.setStartDate(meetingStartDate);
        meeting.setEndDate(meetingEndDate);
        meeting.setSprintDailyMeeting(sprintDailyMeeting);
        meeting.setCode(code);
        List<MeetingUser> meetingUsers = Optional.ofNullable(meeting.getUsers()).orElse(new ArrayList<>());

        sprint.getUsers()
                .stream()
                .filter((sprintUser) -> {
                    return meetingUsers.stream().noneMatch((meetingUser -> meetingUser.getUser().getId().equals(sprintUser.getUser().getId())));
                })
                .forEach((sprintUser) -> {
                    MeetingUser meetingUser = MeetingUser.builder().build();
                    meetingUser.setUser(User.builder().id(sprintUser.getUser().getId()).build());
                    meetingUser.setMeeting(meeting);
                    meetingUsers.add(meetingUser);
                });

        meeting.setUsers(meetingUsers);

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
        meetingRepository.deleteAll(sprintMeetings);
        sprintRepository.delete(sprint);
    }

    public List<Sprint> selectUserSprintList(UserSession userSession) {
        return sprintRepository.findAllByUsersUserId(userSession.getId());
    }

    public Sprint selectSprintInfo(Long id) {
        return sprintRepository.findById(id).orElse(null);
    }


}
