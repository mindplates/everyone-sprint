package com.mindplates.everyonesprint.common.service;

import com.mindplates.everyonesprint.biz.meeting.repository.ParticipantRepository;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InitService {
    final private ParticipantRepository participantRepository;

    final private CacheManager cacheManager;

    public InitService(ParticipantRepository participantRepository, CacheManager cacheManager) {
        this.participantRepository = participantRepository;
        this.cacheManager = cacheManager;
        this.init();
    }

    public void init() {
        for (String name : cacheManager.getCacheNames()) {
            cacheManager.getCache(name).clear();
        }
        participantRepository.deleteAll();
    }
}
