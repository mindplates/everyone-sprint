package com.mindplates.everyonesprint.biz.sprint.repository;


import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    Long countByProjectSpaceCodeAndProjectIdAndIdNotAndName(String spaceCode, Long projectId, Long sprintId, String name);

    Long countByProjectSpaceCodeAndProjectIdAndName(String spaceCode, Long projectId, String name);

    List<Sprint> findAllByProjectSpaceCodeAndUsersUserIdAndClosed(String spaceCode, Long userId, Boolean closed);

    @Query(" SELECT new Sprint(s.id, s.name, s.startDate, s.endDate, s.realEndDate, s.isJiraSprint, s.jiraSprintUrl, s.jiraAuthKey, s.allowAutoJoin, s.activated, s.closed, s.doDailyScrumMeeting, s.doDailySmallTalkMeeting, p.id, p.name, sp.role) " +
            " FROM Sprint s INNER JOIN SprintUser sp ON s.id = sp.sprint.id INNER JOIN Project p ON s.project.id = p.id " +
            " WHERE p.space.id in (SELECT sp.id FROM Space sp WHERE sp.code = :spaceCode) " +
            " AND sp.user.id = :userId " +
            " AND s.closed = :closed ")
    List<Sprint> findUserSprintList(String spaceCode, Long userId, Boolean closed);

    Long countBy();

    Long countByProjectSpaceCode(String spaceCode);

    Long countByProjectIdAndActivatedTrue(Long projectId);

}

