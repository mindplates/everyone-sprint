package com.mindplates.everyonesprint.biz.meeting.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
import com.mindplates.everyonesprint.biz.sprint.entity.ScrumMeetingPlan;
import com.mindplates.everyonesprint.biz.sprint.entity.SmallTalkMeetingPlan;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.common.code.MeetingTypeCode;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Entity
@Builder
@Table(name = "meeting")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Meeting extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", foreignKey = @ForeignKey(name = "FK_MEETING__SPRINT"))
    private Sprint sprint;

    @Column(name = "name", nullable = false, length = ColumnsDef.NAME)
    private String name;

    @Column(name = "code", nullable = false, length = ColumnsDef.CODE)
    private String code;

    @Column(name = "started", nullable = false)
    private Boolean started;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "real_start_date")
    private LocalDateTime realStartDate;

    @Column(name = "last_real_start_date")
    private LocalDateTime lastRealStartDate;

    @Column(name = "real_end_date")
    private LocalDateTime realEndDate;

    @Column(name = "duration_seconds")
    private Long durationSeconds;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<MeetingUser> users;

    @Column(name = "type", nullable = false, length = ColumnsDef.CODE)
    private MeetingTypeCode type;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "scrum_meeting_plan_id", foreignKey = @ForeignKey(name = "FK_MEETING__SPRINT_DAILY_MEETING"))
    private ScrumMeetingPlan scrumMeetingPlan;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "sprint_daily_small_talk_meeting_id", foreignKey = @ForeignKey(name = "FK_MEETING__SPRINT_DAILY_SMALL_TALK_MEETING"))
    private SmallTalkMeetingPlan smallTalkMeetingPlan;

    @Column(name = "current_max_order")
    private Integer currentMaxOrder;

    @Column(name = "daily_scrum_started")
    private Boolean dailyScrumStarted;

    @Column(name = "limit_user_count")
    private Integer limitUserCount;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<Room> rooms;

    public Optional<Room> getRoom(String roomCode) {
        return this.getRooms().stream().filter((r -> r.getCode().equals(roomCode))).findFirst();
    }


}
