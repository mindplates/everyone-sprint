package com.mindplates.everyonesprint.biz.space.repository;


import com.mindplates.everyonesprint.biz.space.entity.SpaceUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpaceUserRepository extends JpaRepository<SpaceUser, Long> {
    boolean existsBySpaceIdAndUserId(Long spaceId, Long userId);

    Long countBySpaceCode(String spaceCode);

}

