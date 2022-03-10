package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;

import javax.persistence.*;

@Entity
@Builder
@Table(name = "scrum_meeting_question")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ScrumMeetingQuestion extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "scrum_meeting_plan_id", foreignKey = @ForeignKey(name = "FK_SCRUM_MEETING_QUESTION__SCRUM_MEETING_PLAN"))
    private ScrumMeetingPlan scrumMeetingPlan;

    @Column(name = "question", nullable = false, length = ColumnsDef.TEXT)
    private String question;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;


}
