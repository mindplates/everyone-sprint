package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Builder
@Table(name = "sprint_daily_meeting_question")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class SprintDailyMeetingQuestion extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_daily_meeting_id")
    private SprintDailyMeeting sprintDailyMeeting;

    @Column(name = "question", nullable = false)
    private String question;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;


}
