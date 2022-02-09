package com.mindplates.everyonesprint.biz.sprint.repository;


import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeetingAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SprintDailyMeetingAnswerRepository extends JpaRepository<SprintDailyMeetingAnswer, Long> {
    List<SprintDailyMeetingAnswer> findAllBySprintIdAndDateEquals(Long sprintId, LocalDate date);

    SprintDailyMeetingAnswer findTop1BySprintIdAndSprintDailyMeetingQuestionSprintDailyMeetingIdAndUserIdAndDateLessThanOrderByDateDesc(Long sprintId, Long meetingId, Long userId, LocalDate date);

    List<SprintDailyMeetingAnswer> findAllBySprintIdAndSprintDailyMeetingQuestionSprintDailyMeetingIdAndUserIdAndDateEquals(Long sprintId, Long meetingId, Long userId, LocalDate date);

    void deleteAllBySprintId(Long sprintId);

    List<SprintDailyMeetingAnswer> findAllBySprintIdAndSprintDailyMeetingQuestionSprintDailyMeetingIdAndDateEquals(Long sprintId, Long meetingId, LocalDate date);

}

