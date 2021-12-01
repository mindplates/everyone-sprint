package com.mindplates.everyonesprint.biz.user.vo.request;

import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class LoginRequest {

    @Length(min = 2, max = 100)
    private String email;
    @Length(min = 2, max = 100)
    private String password;
    private Boolean autoLogin;

}
