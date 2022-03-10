package com.mindplates.everyonesprint.biz.sprint.repository;


import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SprintDailyMeetingAnswerRepository extends JpaRepository<ScrumMeetingAnswer, Long> {
    List<ScrumMeetingAnswer> findAllBySprintIdAndDateEquals(Long sprintId, LocalDate date);

    ScrumMeetingAnswer findTop1BySprintIdAndScrumMeetingQuestionScrumMeetingPlanIdAndUserIdAndDateLessThanOrderByDateDesc(Long sprintId, Long meetingId, Long userId, LocalDate date);

    List<ScrumMeetingAnswer> findAllBySprintIdAndScrumMeetingQuestionScrumMeetingPlanIdAndUserIdAndDateEquals(Long sprintId, Long meetingId, Long userId, LocalDate date);

    void deleteAllBySprintId(Long sprintId);

    List<ScrumMeetingAnswer> findAllBySprintIdAndScrumMeetingQuestionScrumMeetingPlanIdAndDateEquals(Long sprintId, Long meetingId, LocalDate date);

    Long countBySprintIdAndDateEqualsAndUserId(Long sprintId, LocalDate date, Long userId);

}

