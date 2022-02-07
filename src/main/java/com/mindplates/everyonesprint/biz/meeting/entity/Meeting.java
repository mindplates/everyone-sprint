package com.mindplates.everyonesprint.biz.meeting.entity;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.entity.SprintDailyMeeting;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

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
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "real_start_date")
    private LocalDateTime realStartDate;

    @Column(name = "real_end_date")
    private LocalDateTime realEndDate;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<MeetingUser> users;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_daily_meeting_id")
    private SprintDailyMeeting sprintDailyMeeting;

    @Column(name = "current_max_order")
    private Integer currentMaxOrder;

    @Column(name = "daily_scrum_started")
    private Boolean dailyScrumStarted;

}
