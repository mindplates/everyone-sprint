package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Builder
@Table(name = "sprint_daily_meeting_answer")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SprintDailyMeetingAnswer extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "sprint_daily_meeting_question_id")
    private SprintDailyMeetingQuestion sprintDailyMeetingQuestion;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "text", name = "answer")
    private String answer;
}
