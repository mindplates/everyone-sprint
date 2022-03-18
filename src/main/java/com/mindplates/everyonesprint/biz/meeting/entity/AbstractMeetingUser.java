package com.mindplates.everyonesprint.biz.meeting.entity;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDateTime;

@MappedSuperclass
@EntityListeners(value = {AuditingEntityListener.class})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public abstract class AbstractMeetingUser extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @Column(name = "first_join_date")
    private LocalDateTime firstJoinDate;

    @Column(name = "last_join_date")
    private LocalDateTime lastJoinDate;

    @Column(name = "last_out_date")
    private LocalDateTime lastOutDate;

    @Column(name = "join_duration_seconds")
    private Long joinDurationSeconds;

    @Column(name = "talked_seconds")
    private Long talkedSeconds;

    @Column(name = "talked_count")
    private Long talkedCount;


}
