package com.mindplates.everyonesprint.biz.meeting.repository;


import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    Long countByCode(String code);

    Optional<Meeting> findByCode(String code);

    List<Meeting> findAllBySprintId(Long sprintId);

    List<Meeting> findAllByStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserId(LocalDateTime date, LocalDateTime nextDay, Long userId);

    List<Meeting> findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserId(Long sprintId, LocalDateTime date, LocalDateTime nextDay, Long userId);

    List<Meeting> findAllBySprintIdAndSprintDailyMeetingId(Long sprintId, Long sprintDailyMeetingId);

    void deleteAllBySprintDailyMeetingId (Long sprintDailyMeetingId);


}

