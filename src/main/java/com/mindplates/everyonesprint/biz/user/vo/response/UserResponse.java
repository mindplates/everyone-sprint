package com.mindplates.everyonesprint.biz.user.vo.response;

import com.mindplates.everyonesprint.biz.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
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

    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        if (user.getIsNameOpened()) {
            this.name = user.getName();
        }
        this.alias = user.getAlias();
        if (user.getIsTelOpened()) {
            this.tel = user.getTel();
        }
        this.imageType = user.getImageType();
        this.imageData = user.getImageData();
        this.language = user.getLanguage();
        this.country = user.getCountry();
    }
}
