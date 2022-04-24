package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;

import javax.persistence.*;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "sprint_user")
public class SprintUser extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "role", length = ColumnsDef.CODE)
    @Enumerated(EnumType.STRING)
    private RoleCode role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "FK_SPRINT_USER__USER"))
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sprint_id", foreignKey = @ForeignKey(name = "FK_SPRINT_USER__SPRINT"))
    private Sprint sprint;
}
