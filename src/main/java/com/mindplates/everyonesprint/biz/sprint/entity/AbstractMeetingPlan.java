package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalTime;

@MappedSuperclass
@EntityListeners(value = {AuditingEntityListener.class})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public abstract class AbstractMeetingPlan extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(name = "name", nullable = false, length = ColumnsDef.NAME)
    private String name;
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    @Column(name = "on_holiday")
    private Boolean onHoliday;
    @Column(name = "days", length = ColumnsDef.DAYS)
    private String days;
    @Transient
    private String CRUD;

    public abstract Sprint getSprint();

}
