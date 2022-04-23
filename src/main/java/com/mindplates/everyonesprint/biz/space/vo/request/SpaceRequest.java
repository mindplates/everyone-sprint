package com.mindplates.everyonesprint.biz.space.vo.request;

import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.entity.SpaceUser;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class SpaceRequest {

    private Long id;
    @NotNull
    @Size(min = 1)
    private String name;
    @NotNull
    @Size(min = 1, max = 20)
    private String code;
    private String description;
    @NotNull
    private Boolean allowSearch;
    @NotNull
    private Boolean allowAutoJoin;
    @NotNull
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

    /*
    public Space merge(Space base) {
        Space space = base;
        space.setName(name);
        space.setCode(code);
        space.setDescription(description);
        space.setAllowSearch(allowSearch);
        space.setAllowAutoJoin(allowAutoJoin);
        space.setActivated(activated);
        space.setUsers(users.stream().map(
                (spaceUser) -> SpaceUser.builder()
                        .id(spaceUser.getId())
                        .user(com.mindplates.everyonesprint.biz.user.entity.User.builder().id(spaceUser.getUserId()).build())
                        .role(spaceUser.getRole())
                        .CRUD(spaceUser.getCRUD())
                        .space(space).build()).collect(Collectors.toList()));

        return space;
    }

     */


}
