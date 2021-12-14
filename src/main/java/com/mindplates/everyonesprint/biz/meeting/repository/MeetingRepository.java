package com.mindplates.everyonesprint.biz.meeting.repository;


import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    Long countByCode(String code);

    List<Meeting> findAllByStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserId(LocalDateTime date, LocalDateTime nextDay, Long userId);

    List<Meeting> findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserId(Long sprintId, LocalDateTime date, LocalDateTime nextDay, Long userId);


}

