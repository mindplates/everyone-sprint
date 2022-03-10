package com.mindplates.everyonesprint.biz.meeting.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "room")
public class Room extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "code", nullable = false, length = ColumnsDef.CODE)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", foreignKey = @ForeignKey(name = "FK_ROOM__MEETING"))
    private Meeting meeting;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "limit_user_count")
    private Integer limitUserCount;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<RoomUser> users;

    @Column(name = "duration_seconds")
    private Long durationSeconds;

}
