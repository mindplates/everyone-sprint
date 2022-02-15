package com.mindplates.everyonesprint.biz.user.repository;


import com.mindplates.everyonesprint.biz.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByLoginToken(String token);

    List<User> findAllByUseYnTrueAndEmailLikeOrAliasLike(String email, String alias);

    Long countBy();
}

