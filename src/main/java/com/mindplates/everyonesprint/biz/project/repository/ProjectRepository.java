package com.mindplates.everyonesprint.biz.project.repository;


import com.mindplates.everyonesprint.biz.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByName(String name);

    List<Project> findAllByUsersUserId(Long userId);

    List<Project> findAllBySpaceId(Long spaceId);

    Long countBy();

}

