package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;

import javax.persistence.*;

@Entity
@Builder
@Table(name = "sprint_daily_meeting_question")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SprintDailyMeetingQuestion extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "sprint_daily_meeting_id")
    private SprintDailyMeeting sprintDailyMeeting;

    @Column(name = "question", nullable = false)
    private String question;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;


}
