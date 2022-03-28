package com.mindplates.everyonesprint.biz.space.repository;


import com.mindplates.everyonesprint.biz.space.entity.SpaceApplicant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpaceApplicantRepository extends JpaRepository<SpaceApplicant, Long> {

    Optional<SpaceApplicant> findBySpaceIdAndUserId(Long spaceId, Long userId);


}

