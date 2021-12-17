package com.mindplates.everyonesprint.biz.meeting.service;

import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ParticipantService {

    @Autowired
    ParticipantRepository participantRepository;


    public void save(Participant walker) {
        participantRepository.save(walker);
    }

    public Iterable<Participant> findAll() {
        return participantRepository.findAll();
    }

    public Iterable<Participant> findAll(Participant participant) {
        return participantRepository.findAll(Example.of(participant));
    }

    public Participant findById(Long id) {
        return participantRepository.findById(String.valueOf(id)).orElse(null);
    }

    public void deleteById(String id) {
        participantRepository.deleteById(id);
    }


}
