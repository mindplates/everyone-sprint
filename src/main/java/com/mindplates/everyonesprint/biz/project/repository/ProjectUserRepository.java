package com.mindplates.everyonesprint.biz.project.repository;


import com.mindplates.everyonesprint.biz.project.entity.ProjectUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectUserRepository extends JpaRepository<ProjectUser, Long> {


    List<ProjectUser> findAllByUserUseYnTrueAndProjectIdAndUserEmailLikeOrUserUseYnTrueAndProjectIdAndUserAliasLike(Long projectId, String email, Long projectId2, String alias);

    @Modifying
    @Query(" DELETE FROM ProjectUser pu " +
            "WHERE pu.project.id in (SELECT p.id FROM Project p WHERE p.space.id = (SELECT s.id FROM Space s WHERE s.code = :spaceCode)) " +
            "  AND pu.user.id = :userId")
    void deleteBySpaceCodeAndUserId(@Param("spaceCode") String spaceCode, @Param("userId") Long userId);

    @Modifying
    @Query(" DELETE FROM ProjectUser pu " +
            "WHERE pu.project.id = :projectId " +
            "  AND pu.user.id = :userId")
    void deleteByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);
}

