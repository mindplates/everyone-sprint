package com.mindplates.everyonesprint.biz.project.repository;


import com.mindplates.everyonesprint.biz.project.entity.ProjectApplicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProjectApplicantRepository extends JpaRepository<ProjectApplicant, Long> {

    Optional<ProjectApplicant> findByProjectIdAndUserId(Long projectId, Long userId);

    @Modifying
    @Query(" DELETE FROM ProjectApplicant pa " +
            "WHERE pa.project.id = :projectId " +
            "  AND pa.user.id = :userId")
    void deleteByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);
}

