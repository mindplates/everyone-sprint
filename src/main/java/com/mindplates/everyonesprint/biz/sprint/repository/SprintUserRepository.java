package com.mindplates.everyonesprint.biz.sprint.repository;


import com.mindplates.everyonesprint.biz.sprint.entity.SprintUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SprintUserRepository extends JpaRepository<SprintUser, Long> {

    @Modifying
    @Query(" DELETE FROM SprintUser su WHERE su.sprint.id in " +
            "       (SELECT sp.id FROM Sprint sp WHERE sp.project.id in " +
            "           (SELECT p.id FROM Project p WHERE p.space.id = (SELECT s.id FROM Space s WHERE s.code = :spaceCode))) " +
            "  AND su.user.id = :userId")
    void deleteBySpaceCodeAndUserId(@Param("spaceCode") String spaceCode, @Param("userId") Long userId);

    @Modifying
    @Query(" DELETE FROM SprintUser su WHERE su.sprint.id in " +
            "       (SELECT sp.id FROM Sprint sp WHERE sp.project.id = :projectId) " +
            "  AND su.user.id = :userId")
    void deleteByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);

}

