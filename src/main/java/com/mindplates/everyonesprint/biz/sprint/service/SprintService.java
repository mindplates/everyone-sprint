package com.mindplates.everyonesprint.biz.sprint.service;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.repository.MeetingRepository;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.repository.SprintRepository;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private MeetingRepository meetingRepository;

    public Sprint selectByName(String name) {
        return sprintRepository.findByName(name).orElse(null);
    }

    public Sprint createSprintInfo(Sprint sprint, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        sprint.setCreationDate(now);
        sprint.setLastUpdateDate(now);
        sprint.setCreatedBy(userSession.getId());
        sprint.setLastUpdatedBy(userSession.getId());
        return sprintRepository.save(sprint);
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
