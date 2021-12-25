package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.time.LocalTime;
import java.util.List;

@Entity
@Builder
@Table(name = "sprint_daily_meeting")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class SprintDailyMeeting extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "use_question")
    private Boolean useQuestion;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "sprintDailyMeeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<SprintDailyMeetingQuestion> sprintDailyMeetingQuestions;


}
