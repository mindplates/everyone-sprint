package com.mindplates.everyonesprint.biz.sprint.repository;


import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ScrumMeetingAnswerRepository extends JpaRepository<ScrumMeetingAnswer, Long> {
    List<ScrumMeetingAnswer> findAllBySprintIdAndDateEquals(Long sprintId, LocalDate date);

    ScrumMeetingAnswer findTop1BySprintIdAndScrumMeetingQuestionScrumMeetingPlanIdAndUserIdAndDateLessThanOrderByDateDesc(Long sprintId, Long meetingId, Long userId, LocalDate date);

    List<ScrumMeetingAnswer> findAllBySprintIdAndScrumMeetingQuestionScrumMeetingPlanIdAndUserIdAndDateEquals(Long sprintId, Long meetingId, Long userId, LocalDate date);

    void deleteAllBySprintId(Long sprintId);

    List<ScrumMeetingAnswer> findAllBySprintIdAndScrumMeetingQuestionScrumMeetingPlanIdAndDateEquals(Long sprintId, Long meetingId, LocalDate date);

    Long countBySprintIdAndDateEqualsAndUserId(Long sprintId, LocalDate date, Long userId);

    @Query("SELECT new Map(sma.user.id as userId, sma.date as date) from ScrumMeetingAnswer sma where sma.sprint.id = :sprintId GROUP BY sma.user.id, sma.date")
    List<Map<String, Object>> selectSprintScrumAnswerStatList(@Param("sprintId") Long sprintId);

}

