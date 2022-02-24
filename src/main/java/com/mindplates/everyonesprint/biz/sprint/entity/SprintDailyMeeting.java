package com.mindplates.everyonesprint.biz.sprint.entity;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "sprint_daily_meeting")
@EqualsAndHashCode
@Getter
@Setter
public class SprintDailyMeeting extends AbstractDailyMeeting {


    @Column(name = "use_question")
    private Boolean useQuestion;
    @OneToMany(fetch = FetchType.EAGER, mappedBy = "sprintDailyMeeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<SprintDailyMeetingQuestion> sprintDailyMeetingQuestions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", foreignKey = @ForeignKey(name = "FK_SPRINT_DAILY_MEETING__SPRINT"))
    private Sprint sprint;

    public Sprint getSprint() {
        return this.sprint;
    }

    public SprintDailyMeeting() {

    }

    @Builder
    public SprintDailyMeeting(Long id, Sprint sprint, String name, LocalTime startTime, LocalTime endTime, Boolean onHoliday, String days, String CRUD, Boolean useQuestion, List<SprintDailyMeetingQuestion> sprintDailyMeetingQuestions) {
        super(id, name, startTime, endTime, onHoliday, days, CRUD);
        this.sprint = sprint;
        this.useQuestion = useQuestion;
        this.sprintDailyMeetingQuestions = sprintDailyMeetingQuestions;
    }


}
