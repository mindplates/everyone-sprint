package com.mindplates.everyonesprint.common.service;

import com.mindplates.everyonesprint.biz.meeting.repository.ParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InitService {
    final private ParticipantRepository participantRepository;

    public InitService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
        this.init();
    }

    public void init() {
        participantRepository.deleteAll();
    }
}
