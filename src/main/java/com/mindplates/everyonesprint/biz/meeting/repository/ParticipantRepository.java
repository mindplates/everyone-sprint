package com.mindplates.everyonesprint.biz.meeting.repository;


import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.QueryByExampleExecutor;

public interface ParticipantRepository extends CrudRepository<Participant, String>, QueryByExampleExecutor<Participant> {


}
