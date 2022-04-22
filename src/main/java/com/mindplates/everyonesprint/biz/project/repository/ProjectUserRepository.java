package com.mindplates.everyonesprint.biz.project.repository;


import com.mindplates.everyonesprint.biz.project.entity.ProjectUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectUserRepository extends JpaRepository<ProjectUser, Long> {


    List<ProjectUser> findAllByUserUseYnTrueAndProjectIdAndUserEmailLikeOrUserUseYnTrueAndProjectIdAndUserAliasLike(Long projectId, String email, Long projectId2, String alias);


}

