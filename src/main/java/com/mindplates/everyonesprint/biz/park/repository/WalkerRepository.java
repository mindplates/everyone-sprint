package com.mindplates.everyonesprint.biz.park.repository;


import com.mindplates.everyonesprint.biz.park.redis.Walker;
import org.springframework.data.repository.CrudRepository;

public interface WalkerRepository extends CrudRepository<Walker, String> {
}
