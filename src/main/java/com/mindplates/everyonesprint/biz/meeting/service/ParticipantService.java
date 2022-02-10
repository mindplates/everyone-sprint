package com.mindplates.everyonesprint.biz.meeting.service;

import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.repository.ParticipantRepository;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.stream.StreamSupport;

@Service
@Transactional
public class ParticipantService {

    final private ParticipantRepository participantRepository;

    public ParticipantService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    public void save(Participant walker) {
        participantRepository.save(walker);
    }

    public Iterable<Participant> findAll(Participant participant) {
        return participantRepository.findAll(Example.of(participant));
    }

    public Optional<Participant> findOne(Participant participant) {
        return participantRepository.findOne(Example.of(participant));
    }

    public Participant findById(String key) {
        return participantRepository.findById(key).orElse(null);
    }

    public void deleteById(String id) {
        participantRepository.deleteById(id);
    }

    public Long countByCodeAndConnectedTrue(String code) {
        Participant participant = Participant.builder().code(code).build();
        participant.setConnected(true);
        return StreamSupport.stream(participantRepository.findAll(Example.of(participant)).spliterator(), false).count();
    }
}
