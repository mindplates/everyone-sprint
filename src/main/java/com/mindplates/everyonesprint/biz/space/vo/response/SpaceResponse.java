package com.mindplates.everyonesprint.biz.space.vo.response;

import com.mindplates.everyonesprint.biz.common.vo.response.SimpleUserResponse;
import com.mindplates.everyonesprint.biz.project.vo.response.ProjectListResponse;
import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SpaceResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Boolean allowSearch;
    private Boolean allowAutoJoin;
    private Boolean activated;
    private List<ProjectListResponse> projects;
    private List<SimpleUserResponse> users;
    private List<SpaceApplicantResponse> applicants;
    private Boolean isMember;
    private Boolean isAdmin;
    private LocalDateTime creationDate;
    private SpaceApplicantResponse userApplicantStatus;
    private String token;

    public SpaceResponse(Space space, UserSession userSession) {
        this(space, userSession.getId());
    }

    public SpaceResponse(Space space, Long userId) {
        this.id = space.getId();
        this.name = space.getName();
        this.code = space.getCode();
        this.description = space.getDescription();
        this.allowSearch = space.getAllowSearch();
        this.allowAutoJoin = space.getAllowAutoJoin();
        this.activated = space.getActivated();
        this.isMember = space.getUsers().stream().anyMatch((projectUser -> projectUser.getUser().getId().equals(userId)));
        this.isAdmin = space.getUsers().stream().anyMatch((projectUser -> projectUser.getRole().equals(RoleCode.ADMIN) && projectUser.getUser().getId().equals(userId)));
        this.token = space.getToken();

        this.creationDate = space.getCreationDate();
        this.users = space.getUsers().stream().map(
                (spaceUser) -> SimpleUserResponse.builder()
                        .id(spaceUser.getId())
                        .userId(spaceUser.getUser().getId())
                        .role(spaceUser.getRole())
                        .email(spaceUser.getUser().getEmail())
                        .name(spaceUser.getUser().getName())
                        .alias(spaceUser.getUser().getAlias())
                        .imageType(spaceUser.getUser().getImageType())
                        .imageData(spaceUser.getUser().getImageData())
                        .build()).collect(Collectors.toList());

        if (this.isAdmin && space.getApplicants() != null) {
            this.applicants = space.getApplicants().stream().filter((spaceApplicant -> spaceApplicant.getApprovalStatusCode().equals(ApprovalStatusCode.REQUEST))).map(SpaceApplicantResponse::new).collect(Collectors.toList());
        }


    }


}
