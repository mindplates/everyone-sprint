package com.mindplates.everyonesprint.biz.meeting.repository;


import com.mindplates.everyonesprint.biz.meeting.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {

    Long countByMeetingIdAndCode(Long meetingId, String code);

}

