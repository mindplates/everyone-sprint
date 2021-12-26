package com.mindplates.everyonesprint.biz.user.vo.response;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MyInfoResponse {
    private Long id;
    private String email;
    private String name;
    private Boolean isNameOpened;
    private String alias;
    private String tel;
    private Boolean isTelOpened;
    private String imageType;
    private String imageData;
    private String language;
    private String country;
    private Boolean autoLogin;
    private String loginToken;
    private RoleCode activeRoleCode;
    private String timezone;

    public MyInfoResponse(User user) {
        if (user != null) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.name = user.getName();
            this.isNameOpened = user.getIsNameOpened();
            this.alias = user.getAlias();
            this.tel = user.getTel();
            this.isTelOpened = user.getIsTelOpened();
            this.imageType = user.getImageType();
            this.imageData = user.getImageData();
            this.language = user.getLanguage();
            this.country = user.getCountry();
            this.autoLogin = user.getAutoLogin();
            this.loginToken = user.getLoginToken();
            this.activeRoleCode = user.getActiveRoleCode();
            this.timezone = user.getTimezone();
        }

    }
}
