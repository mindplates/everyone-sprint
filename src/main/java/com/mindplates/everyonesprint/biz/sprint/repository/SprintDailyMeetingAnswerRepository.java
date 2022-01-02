package com.mindplates.everyonesprint.biz.sprint.repository;


import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeetingAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SprintDailyMeetingAnswerRepository extends JpaRepository<SprintDailyMeetingAnswer, Long> {
    List<SprintDailyMeetingAnswer> findAllBySprintIdAndUserIdAndDateEquals(Long sprintId, Long userId, LocalDate date);

}

