package com.mindplates.everyonesprint.biz.meeting.service;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.repository.MeetingRepository;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.ByteBuffer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

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
        return meetingRepository.save(meeting);
    }

    public Meeting updateMeetingInfo(Meeting meeting, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        meeting.setLastUpdateDate(now);
        meeting.setLastUpdatedBy(userSession.getId());
        return meetingRepository.save(meeting);
    }

    public void deleteMeetingInfo(Meeting meeting) {
        meetingRepository.delete(meeting);
    }

    public List<Meeting> selectUserMeetingList(Long sprintId, LocalDateTime date, UserSession userSession) {

        LocalDateTime nextDay = date.plusDays(1);
        if (sprintId != null) {
            return meetingRepository.findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserId(sprintId, date, nextDay, userSession.getId());
        }

        return meetingRepository.findAllByStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserId(date, nextDay, userSession.getId());
    }

    public Optional<Meeting> selectMeetingInfo(Long id) {
        return meetingRepository.findById(id);
    }

    public Optional<Meeting> selectMeetingInfo(String code) {
        return meetingRepository.findByCode(code);
    }


}
