package com.mindplates.everyonesprint.biz.park.service;

import com.mindplates.everyonesprint.biz.park.redis.Walker;
import com.mindplates.everyonesprint.biz.park.repository.WalkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WalkerService {

    @Autowired
    private WalkerRepository walkerRepository;

    public void save(Walker walker) {
        walkerRepository.save(walker);
    }

    public Iterable<Walker> findAll() {
        return walkerRepository.findAll();
    }

    public void deleteById(String id) {
        walkerRepository.deleteById(id);
    }


}
