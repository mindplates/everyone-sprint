package com.mindplates.everyonesprint.common.vo;

import com.mindplates.everyonesprint.common.code.RoleCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Locale;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSession implements Serializable {
    private Long id;
    private String email;
    private String alias;
    private String name;
    private Boolean isNameOpened;
    private RoleCode roleCode;
    private Locale locale;
}
