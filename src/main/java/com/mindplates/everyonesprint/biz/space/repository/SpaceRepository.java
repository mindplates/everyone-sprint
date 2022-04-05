package com.mindplates.everyonesprint.biz.space.repository;


import com.mindplates.everyonesprint.biz.space.entity.Space;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpaceRepository extends JpaRepository<Space, Long> {
    Optional<Space> findByName(String name);

    Optional<Space> findByCode(String code);

    Optional<Space> findByIdNotAndCode(Long spaceId, String code);

    List<Space> findAllByUsersUserIdAndNameLike(Long userId, String text);

    List<Space> findAllByUsersUserIdAndActivatedTrue(Long userId);

    List<Space> findAllByNameLikeAndAllowSearchTrueAndActivatedTrue(String text);

    Long countBy();

    boolean existsByIdAndUsersUserId(Long spaceId, Long userId);

}

