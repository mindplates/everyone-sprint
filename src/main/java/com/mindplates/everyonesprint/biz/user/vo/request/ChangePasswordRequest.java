package com.mindplates.everyonesprint.biz.user.vo.request;

import com.mindplates.everyonesprint.biz.user.entity.User;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String currentPassword;
    private String changePassword1;
    private String changePassword2;

    public User merge(User user) {
        user.setPassword(this.changePassword1);
        return user;
    }

}
