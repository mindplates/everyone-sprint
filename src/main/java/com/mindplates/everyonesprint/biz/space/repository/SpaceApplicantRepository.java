package com.mindplates.everyonesprint.biz.space.repository;


import com.mindplates.everyonesprint.biz.space.entity.SpaceApplicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SpaceApplicantRepository extends JpaRepository<SpaceApplicant, Long> {

    Optional<SpaceApplicant> findBySpaceCodeAndUserId(String spaceCode, Long userId);

    @Modifying
    @Query(" DELETE FROM SpaceApplicant sa " +
            "WHERE sa.space.id in (SELECT s.id FROM Space s WHERE s.code = :spaceCode)" +
            "  AND sa.user.id = :userId")
    void deleteBySpaceCodeAndUserId(@Param("spaceCode") String spaceCode, @Param("userId") Long userId);
}

