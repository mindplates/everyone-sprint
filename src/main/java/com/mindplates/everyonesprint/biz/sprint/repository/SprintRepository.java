package com.mindplates.everyonesprint.biz.sprint.repository;


import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    Long countByProjectSpaceCodeAndProjectIdAndIdNotAndName(String spaceCode, Long projectId, Long sprintId, String name);

    Long countByProjectSpaceCodeAndProjectIdAndName(String spaceCode, Long projectId, String name);

    List<Sprint> findAllByProjectSpaceCodeAndUsersUserIdAndClosed(String spaceCode, Long userId, Boolean closed);

    Long countBy();

    Long countByProjectSpaceCode(String spaceCode);

    Long countByProjectIdAndActivatedTrue(Long projectId);

}

