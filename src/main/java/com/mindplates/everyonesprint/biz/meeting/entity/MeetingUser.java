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
@Table(name = "meeting_user")
public class MeetingUser extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @Column(name = "first_join_date")
    private LocalDateTime firstJoinDate;

    @Column(name = "last_out_date")
    private LocalDateTime lastOutDate;

    @Column(name = "join_duration_seconds")
    private Integer joinDurationSeconds;

    @Column(name = "talked_seconds")
    private Integer talkedSeconds;
}
