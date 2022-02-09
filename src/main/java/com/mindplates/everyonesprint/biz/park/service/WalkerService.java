package com.mindplates.everyonesprint.biz.park.service;

import com.mindplates.everyonesprint.biz.park.redis.Walker;
import com.mindplates.everyonesprint.biz.park.repository.WalkerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WalkerService {

    final private WalkerRepository walkerRepository;

    public WalkerService(WalkerRepository walkerRepository) {
        this.walkerRepository = walkerRepository;
    }

    public void save(Walker walker) {
        walkerRepository.save(walker);
    }

    public Iterable<Walker> findAll() {
        return walkerRepository.findAll();
    }

    public Walker findById(Long id) {
        return walkerRepository.findById(String.valueOf(id)).orElse(null);
    }

    public void deleteById(String id) {
        walkerRepository.deleteById(id);
    }


}
