package com.mindplates.everyonesprint.biz.meeting.repository;


import com.mindplates.everyonesprint.biz.meeting.entity.MeetingUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MeetingUserRepository extends JpaRepository<MeetingUser, Long> {

    @Modifying
    @Query(" DELETE FROM MeetingUser mu " +
            "WHERE mu.meeting.id in (SELECT m.id FROM Meeting m WHERE m.sprint.id in " +
            "       (SELECT sp.id FROM Sprint sp WHERE sp.project.id in " +
            "           (SELECT p.id FROM Project p WHERE p.space.id = (SELECT s.id FROM Space s WHERE s.code = :spaceCode)))) " +
            "  AND mu.user.id = :userId")
    void deleteBySpaceCodeAndUserId(@Param("spaceCode") String spaceCode, @Param("userId") Long userId);

    @Modifying
    @Query(" DELETE FROM MeetingUser mu " +
            "WHERE mu.meeting.id in (SELECT m.id FROM Meeting m WHERE m.sprint.id in " +
            "       (SELECT sp.id FROM Sprint sp WHERE sp.project.id = :spaceCode)) " +
            "  AND mu.user.id = :userId")
    void deleteByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);

    @Modifying
    @Query(" DELETE FROM MeetingUser mu " +
            "WHERE mu.meeting.id in (SELECT m.id FROM Meeting m WHERE m.sprint.id = :sprintId) " +
            "  AND mu.user.id = :userId")
    void deleteBySprintIdAndUserId(@Param("sprintId") Long sprintId, @Param("userId") Long userId);


}

