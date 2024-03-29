package com.mindplates.everyonesprint.biz.meeting.repository;


import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.common.code.MeetingTypeCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    Long countByCode(String code);

    Optional<Meeting> findByCode(String code);

    List<Meeting> findAllBySprintId(Long sprintId);

    List<Meeting> findAllBySprintProjectSpaceCodeAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserIdAndSprintClosedFalse(String spaceCode, LocalDateTime date, LocalDateTime nextDay, Long userId);

    List<Meeting> findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndUsersUserIdAndSprintClosedFalse(Long sprintId, LocalDateTime date, LocalDateTime nextDay, Long userId);

    List<Meeting> findAllBySprintIdAndScrumMeetingPlanId(Long sprintId, Long scrumMeetingPlanId);

    void deleteAllByScrumMeetingPlanId(Long scrumMeetingPlanId);

    void deleteAllBySmallTalkMeetingPlanId(Long sprintDailySmallTalkId);

    List<Meeting> findAllBySprintIdAndSmallTalkMeetingPlanId(Long sprintId, Long sprintDailySmallTalkId);

    List<Meeting> findAllByUsersUserIdAndScrumMeetingPlanIdInAndStartDateGreaterThanEqualAndStartDateLessThanEqual(Long userId, List<Long> scrumMeetingPlanIds, LocalDateTime startTime, LocalDateTime endTime);

    long countBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndScrumMeetingPlanIsNotNull(Long sprintId, LocalDateTime startTime, LocalDateTime endTime);

    List<Meeting> findAllByUsersUserIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndScrumMeetingPlanIsNull(Long userId, LocalDateTime date, LocalDateTime nextDay);

    List<Meeting> findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndScrumMeetingPlanIsNotNull(Long userId, LocalDateTime date, LocalDateTime nextDay);

    Long countBy();

    Long countBySprintProjectSpaceCode(String spaceCode);

    List<Meeting> findAllBySprintProjectSpaceCodeAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndSprintUsersUserIdAndTypeEqualsAndSprintClosedFalse(String spaceCode, LocalDateTime date, LocalDateTime nextDay, Long userId, MeetingTypeCode type);

    List<Meeting> findAllBySprintIdAndStartDateGreaterThanEqualAndStartDateLessThanEqualAndSprintUsersUserIdAndTypeEqualsAndSprintClosedFalse(Long sprintId, LocalDateTime date, LocalDateTime nextDay, Long userId, MeetingTypeCode type);

}

