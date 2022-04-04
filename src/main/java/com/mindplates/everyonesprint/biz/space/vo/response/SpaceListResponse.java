package com.mindplates.everyonesprint.biz.space.vo.response;

import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SpaceListResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;

    private Boolean isMember;
    private Boolean isAdmin;

    public SpaceListResponse(Space space, UserSession userSession) {
        this(space, userSession.getId());
    }

    public SpaceListResponse(Space space, Long userId) {
        this.id = space.getId();
        this.name = space.getName();
        this.code = space.getCode();
        this.description = space.getDescription();
        this.allowSearch = space.getAllowSearch();
        this.allowAutoJoin = space.getAllowAutoJoin();
        this.activated = space.getActivated();
        this.isMember = space.getUsers().stream().anyMatch((projectUser -> projectUser.getUser().getId().equals(userId)));
        this.isAdmin = space.getUsers().stream().anyMatch((projectUser -> projectUser.getRole().equals(RoleCode.ADMIN) && projectUser.getUser().getId().equals(userId)));
    }


}
