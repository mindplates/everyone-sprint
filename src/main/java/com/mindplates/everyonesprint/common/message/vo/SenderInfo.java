package com.mindplates.everyonesprint.common.message.vo;

import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SenderInfo {

    private Long id;
    private String email;
    private String alias;
    private String name;

    public SenderInfo(UserSession userSession) {
        if (userSession != null) {
            this.id = userSession.getId();
            this.email = userSession.getEmail();
            this.alias = userSession.getAlias();
            if (userSession.getIsNameOpened()) {
                this.name = userSession.getName();
            }
        }
    }


}
