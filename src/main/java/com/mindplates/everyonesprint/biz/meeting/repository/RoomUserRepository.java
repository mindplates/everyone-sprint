package com.mindplates.everyonesprint.biz.meeting.repository;


import com.mindplates.everyonesprint.biz.meeting.entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
}

