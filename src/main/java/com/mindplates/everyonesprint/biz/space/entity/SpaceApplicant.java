package com.mindplates.everyonesprint.biz.space.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;

import javax.persistence.*;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "space_applicant")
public class SpaceApplicant extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "FK_USER__SPACE_REQUEST"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", foreignKey = @ForeignKey(name = "FK_SPACE__USER_REQUEST"))
    private Space space;

    @Column(name = "approval_status_code", length = ColumnsDef.CODE)
    @Enumerated(EnumType.STRING)
    private ApprovalStatusCode approvalStatusCode;
}
