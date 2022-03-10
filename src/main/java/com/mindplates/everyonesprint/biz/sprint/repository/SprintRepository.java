package com.mindplates.everyonesprint.biz.sprint.repository;


import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    Long countByProjectIdAndIdNotAndName(Long projectId, Long sprintId, String name);

    Long countByProjectIdAndName(Long projectId, String name);

    List<Sprint> findAllByUsersUserIdAndClosed(Long userId, Boolean closed);

    Long countBy();

    Long countByProjectIdAndActivatedTrue(Long projectId);

}

