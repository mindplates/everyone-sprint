package com.mindplates.everyonesprint.biz.meeting.entity;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "room_user")
public class RoomUser extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name="FK_ROOM_USER__USER"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", foreignKey = @ForeignKey(name="FK_ROOM_USER__ROOM"))
    private Room room;

    @Column(name = "first_join_date")
    private LocalDateTime firstJoinDate;

    @Column(name = "last_out_date")
    private LocalDateTime lastOutDate;

    @Column(name = "join_duration_seconds")
    private Long joinDurationSeconds;

    @Column(name = "talked_seconds")
    private Long talkedSeconds;

    @Column(name = "talked_count")
    private Long talkedCount;
}
