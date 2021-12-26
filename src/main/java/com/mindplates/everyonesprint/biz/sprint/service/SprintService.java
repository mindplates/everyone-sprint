package com.mindplates.everyonesprint.biz.sprint.service;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import com.mindplates.everyonesprint.biz.meeting.repository.MeetingRepository;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.repository.SprintRepository;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

        LocalDateTime date = startDate;
        while (date.isBefore(endDate)) {

            final LocalDateTime currentDate = date;

            sprint.getSprintDailyMeetings().stream().forEach((sprintDailyMeeting -> {

                String code;
                Long count;

                do {
                    code = MeetingService.makeShortUUID();
                    count = meetingRepository.countByCode(code);
                } while (count > 0L);

                LocalDateTime meetingStartDate = currentDate.withHour(sprintDailyMeeting.getStartTime().getHour()).withMinute(sprintDailyMeeting.getStartTime().getMinute()).withSecond(0).withNano(0);
                LocalDateTime meetingEndDate = currentDate.withHour(sprintDailyMeeting.getEndTime().getHour()).withMinute(sprintDailyMeeting.getEndTime().getMinute()).withSecond(0).withNano(0);



                Meeting meeting = Meeting.builder()
                        .sprintDailyMeetingId(sprint.getId())
                        .sprint(sprint)
                        .name(sprintDailyMeeting.getName())
                        .startDate(meetingStartDate)
                        .endDate(meetingEndDate)
                        .code(code)
                        .build();

                meeting.setUsers(sprint.getUsers()
                        .stream()
                        .map((sprintUser -> MeetingUser.builder()
                                .user(User.builder().id(sprintUser.getUser().getId()).build())
                                .meeting(meeting)
                                .build())).collect(Collectors.toList()));


                meeting.setCreationDate(now);
                meeting.setLastUpdateDate(now);
                meeting.setCreatedBy(userSession.getId());
                meeting.setLastUpdatedBy(userSession.getId());

                meetingList.add(meeting);
            }));

            date = date.plusDays(1);
        }


        if (meetingList.size() > 0) {
            meetingRepository.saveAll(meetingList);
        }


        return sprint;
    }

    public Sprint updateSprintInfo(Sprint sprint, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        sprint.setLastUpdateDate(now);
        sprint.setLastUpdatedBy(userSession.getId());
        return sprintRepository.save(sprint);
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
