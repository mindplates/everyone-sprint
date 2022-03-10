package com.mindplates.everyonesprint.biz.sprint.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalTime;

@Entity

@Table(name = "small_talk_meeting_plan")
@EqualsAndHashCode
@Getter
@Setter
@NoArgsConstructor
public class SmallTalkMeetingPlan extends AbstractMeetingPlan {
    @Column(name = "limit_user_count", nullable = false)
    private Integer limitUserCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", foreignKey = @ForeignKey(name = "FK_SMALL_TALK_MEETING_PLAN__SPRINT"))
    private Sprint sprint;

    @Builder
    public SmallTalkMeetingPlan(Long id, Sprint sprint, String name, LocalTime startTime, LocalTime endTime, Boolean onHoliday, String days, String CRUD, Integer limitUserCount) {
        super(id, name, startTime, endTime, onHoliday, days, CRUD);
        this.sprint = sprint;
        this.limitUserCount = limitUserCount;
    }

    public Sprint getSprint() {
        return this.sprint;
    }
}
