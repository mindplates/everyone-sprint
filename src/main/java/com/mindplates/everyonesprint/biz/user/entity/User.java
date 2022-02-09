package com.mindplates.everyonesprint.biz.user.entity;

import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import javax.persistence.*;

@Entity
@Builder
@Table(name = "user")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class User extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "name")
    private String name;

    @Column(name = "is_name_opened")
    private Boolean isNameOpened;

    @Length(min = 2, max = 100)
    @Column(name = "alias", nullable = false)
    private String alias;

    @Column(name = "tel")
    private String tel;

    @Column(name = "is_tel_opened")
    private Boolean isTelOpened;

    @Column(name = "image_type")
    private String imageType;

    @Column(columnDefinition = "text", name = "image_data")
    private String imageData;

    @Length(min = 2, max = 100)
    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "salt", nullable = false)
    private String salt;

    @Column(name = "activate_yn", nullable = false)
    private Boolean activateYn;

    @Column(name = "use_yn", nullable = false)
    private Boolean useYn;

    @Column(name = "language")
    private String language;

    @Column(name = "country")
    private String country;

    @Column(name = "activation_token")
    private String activationToken;

    @Column(name = "activate_mail_send_result")
    private Boolean activateMailSendResult;

    @Column(name = "recovery_token")
    private String recoveryToken;

    @Column(name = "recovery_mail_send_result")
    private Boolean recoveryMailSendResult;

    @Column(name = "role_code", columnDefinition = "VARCHAR(15)")
    @Enumerated(EnumType.STRING)
    private RoleCode roleCode;

    @Column(name = "active_role_code", columnDefinition = "VARCHAR(15)")
    @Enumerated(EnumType.STRING)
    private RoleCode activeRoleCode;

    @Column(name = "auto_login")
    private Boolean autoLogin;

    @Column(name = "loginToken")
    private String loginToken;

    @Column(name = "timezone")
    private String timezone;

}
