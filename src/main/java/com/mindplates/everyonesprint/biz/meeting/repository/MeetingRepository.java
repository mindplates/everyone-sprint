package com.mindplates.everyonesprint.biz.meeting.repository;


import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    Long countByCode(String code);

    List<Meeting> findAllByUsersUserId(Long userId);


}

