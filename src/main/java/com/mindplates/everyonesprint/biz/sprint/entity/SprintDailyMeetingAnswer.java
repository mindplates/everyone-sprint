package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_daily_meeting_question_id", foreignKey = @ForeignKey(name="FK_SPRINT_DAILY_MEETING_QUESTION__SPRINT_DAILY_MEETING"))
    private SprintDailyMeetingQuestion sprintDailyMeetingQuestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", foreignKey = @ForeignKey(name="FK_SPRINT_DAILY_MEETING_ANSWER__SPRINT"))
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name="FK_SPRINT_DAILY_MEETING_ANSWER__USER"))
    private User user;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "answer", length = ColumnsDef.TEXT)
    private String answer;
}
