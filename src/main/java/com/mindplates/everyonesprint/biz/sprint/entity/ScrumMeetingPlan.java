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
@Table(name = "scrum_meeting_plan")
@EqualsAndHashCode
@Getter
@Setter
public class ScrumMeetingPlan extends AbstractMeetingPlan {


    @Column(name = "use_question")
    private Boolean useQuestion;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "scrumMeetingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<ScrumMeetingQuestion> scrumMeetingQuestions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", foreignKey = @ForeignKey(name = "FK_SCRUM_MEETING_PLAN__SPRINT"))
    private Sprint sprint;

    public ScrumMeetingPlan() {

    }

    @Builder
    public ScrumMeetingPlan(Long id, Sprint sprint, String name, LocalTime startTime, LocalTime endTime, Boolean onHoliday, String days, String CRUD, Boolean useQuestion, List<ScrumMeetingQuestion> scrumMeetingQuestions) {
        super(id, name, startTime, endTime, onHoliday, days, CRUD);
        this.sprint = sprint;
        this.useQuestion = useQuestion;
        this.scrumMeetingQuestions = scrumMeetingQuestions;
    }

    public Sprint getSprint() {
        return this.sprint;
    }


}
