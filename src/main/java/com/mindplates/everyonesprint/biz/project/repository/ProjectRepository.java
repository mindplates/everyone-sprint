package com.mindplates.everyonesprint.biz.project.repository;


import com.mindplates.everyonesprint.biz.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findBySpaceCodeAndName(String spaceCode, String name);

    List<Project> findAllBySpaceCodeAndUsersUserId(String spaceCode, Long userId);

    List<Project> findAllBySpaceId(Long spaceId);

    Optional<Project> findBySpaceCodeAndId(String spaceCode, Long spaceId);

    Long countBy();

    Long countBySpaceCode(String spaceCode);

    List<Project> findAllBySpaceCodeAndNameLikeAndAllowSearchTrueAndActivatedTrue(String spaceCode, String text);

}

