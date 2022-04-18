package com.mindplates.everyonesprint.biz.space.repository;


import com.mindplates.everyonesprint.biz.space.entity.SpaceUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpaceUserRepository extends JpaRepository<SpaceUser, Long> {
    boolean existsBySpaceIdAndUserId(Long spaceId, Long userId);

    List<SpaceUser> findAllByUserUseYnTrueAndSpaceCodeAndUserEmailLikeOrUserUseYnTrueAndSpaceCodeAndUserAliasLike(String spaceCode, String email, String spaceCode2,String alias);

    Long countBySpaceCode(String spaceCode);

}

