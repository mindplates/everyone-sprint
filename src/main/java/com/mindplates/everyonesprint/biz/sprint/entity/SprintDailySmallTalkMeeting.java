package com.mindplates.everyonesprint.biz.sprint.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalTime;

@Entity

@Table(name = "sprint_daily_small_talk_meeting")
@EqualsAndHashCode
@Getter
@Setter
@NoArgsConstructor
public class SprintDailySmallTalkMeeting extends AbstractDailyMeeting {
    @Column(name = "limit_user_count", nullable = false)
    private Integer limitUserCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", foreignKey = @ForeignKey(name = "FK_SPRINT_DAILY_SMALL_TALK_MEETING__SPRINT"))
    private Sprint sprint;

    @Builder
    public SprintDailySmallTalkMeeting(Long id, Sprint sprint, String name, LocalTime startTime, LocalTime endTime, Boolean onHoliday, String days, String CRUD, Integer limitUserCount) {
        super(id, name, startTime, endTime, onHoliday, days, CRUD);
        this.sprint = sprint;
        this.limitUserCount = limitUserCount;
    }

    public Sprint getSprint() {
        return this.sprint;
    }
}
