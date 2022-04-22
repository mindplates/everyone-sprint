package com.mindplates.everyonesprint.biz.space.vo.request;

import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.entity.SpaceUser;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class SpaceRequest {

    private Long id;
    private String name;
    private String code;
    private String description;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private List<SpaceUserRequest> users;

    public Space buildEntity() {

        Space space = Space.builder()
                .id(id)
                .name(name)
                .code(code)
                .description(description)
                .allowSearch(allowSearch)
                .allowAutoJoin(allowAutoJoin)
                .activated(activated)
                .build();

        List<SpaceUser> spaceUsers = users.stream().map(
                (spaceUser) -> SpaceUser.builder()
                        .id(spaceUser.getId())
                        .user(com.mindplates.everyonesprint.biz.user.entity.User.builder().id(spaceUser.getUserId()).build())
                        .role(spaceUser.getRole())
                        .CRUD(spaceUser.getCRUD())
                        .space(space).build()).collect(Collectors.toList());

        space.setUsers(spaceUsers);

        return space;
    }


}
