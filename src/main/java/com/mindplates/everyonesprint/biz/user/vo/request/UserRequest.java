package com.mindplates.everyonesprint.biz.user.vo.request;

import com.mindplates.everyonesprint.biz.user.entity.User;
import lombok.Data;

@Data
public class UserRequest {

    private Long id;
    private String email;
    private String name;
    private Boolean isNameOpened;
    private String alias;
    private String tel;
    private Boolean isTelOpened;
    private String imageType;
    private String imageData;
    private String password;
    private String language;
    private String country;
    private Boolean autoLogin;
    private String timezone;

    public User buildEntity() {
        return User.builder()
                .id(id)
                .email(email)
                .name(name)
                .isNameOpened(isNameOpened)
                .alias(alias)
                .tel(tel)
                .isTelOpened(isTelOpened)
                .imageType(imageType)
                .imageData(imageData)
                .password(password)
                .language(language)
                .country(country)
                .autoLogin(autoLogin)
                .timezone(timezone)
                .build();
    }

    public User merge(User user) {
        user.setName(this.name);
        user.setIsNameOpened(this.isNameOpened);
        user.setAlias(this.alias);
        user.setTel(this.tel);
        user.setIsTelOpened(this.isTelOpened);
        user.setImageType(this.imageType);
        user.setImageData(this.imageData);
        user.setLanguage(this.language);
        user.setCountry(this.country);
        user.setAutoLogin(this.autoLogin);
        user.setTimezone(this.timezone);
        return user;
    }

}
