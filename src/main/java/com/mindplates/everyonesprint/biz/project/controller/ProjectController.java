package com.mindplates.everyonesprint.biz.project.controller;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.entity.ProjectApplicant;
import com.mindplates.everyonesprint.biz.project.entity.ProjectUser;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
import com.mindplates.everyonesprint.biz.project.vo.request.ProjectApplicantRequest;
import com.mindplates.everyonesprint.biz.project.vo.request.ProjectRequest;
import com.mindplates.everyonesprint.biz.project.vo.response.ProjectApplicantResponse;
import com.mindplates.everyonesprint.biz.project.vo.response.ProjectListResponse;
import com.mindplates.everyonesprint.biz.project.vo.response.ProjectResponse;
import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.service.SpaceService;
import com.mindplates.everyonesprint.biz.space.vo.request.SpaceApplicantRequest;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.biz.user.vo.response.UserResponse;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.annotation.DisableAuth;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/{spaceCode}/projects")
@AllArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    private final SpaceService spaceService;

    private final UserService userService;

    @Operation(description = "사용자의 프로젝트 목록 조회")
    @GetMapping("/my")
    public List<ProjectListResponse> selectUserProjectList(@PathVariable String spaceCode, @ApiIgnore UserSession userSession) {
        List<Project> projects = projectService.selectUserProjectList(spaceCode, userSession);
        return projects.stream().map((project -> new ProjectListResponse(project, userSession))).collect(Collectors.toList());
    }

    @Operation(description = "프로젝트 검색")
    @GetMapping("")
    public List<ProjectListResponse> selectSpaceProjectSpaceList(@PathVariable String spaceCode, @RequestParam("text") String text, @ApiIgnore UserSession userSession) {
        List<Project> projects = projectService.selectProjectList(spaceCode, text);
        return projects.stream().map((project -> new ProjectListResponse(project, userSession))).collect(Collectors.toList());
    }

    @Operation(description = "프로젝트 생성")
    @PostMapping("")
    public ProjectResponse createProjectInfo(@PathVariable String spaceCode, @Valid @RequestBody ProjectRequest projectRequest, @ApiIgnore UserSession userSession) {

        Project alreadyProject = projectService.selectByName(spaceCode, projectRequest.getName());
        if (alreadyProject != null) {
            throw new ServiceException("project.duplicated");
        }

        Project project = projectRequest.buildEntity();
        Optional<Space> space = spaceService.selectSpaceInfo(spaceCode);
        if (space.isPresent()) {
            project.setSpace(space.get());
        } else {
            throw new ServiceException(HttpStatus.NOT_FOUND);
        }

        return new ProjectResponse(projectService.createProjectInfo(spaceCode, project, userSession), userSession);
    }

    @Operation(description = "프로젝트 수정")
    @PutMapping("/{id}")
    public ProjectResponse updateProjectInfo(@PathVariable String spaceCode, @PathVariable Long id, @Valid @RequestBody ProjectRequest projectRequest, @ApiIgnore UserSession userSession) {

        if (!id.equals(projectRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Optional<Project> projectInfo = projectService.selectProjectInfo(spaceCode, id);

        if (!projectInfo.isPresent()) {
            throw new ServiceException(HttpStatus.NOT_FOUND);
        }

        Project nextProjectInfo = projectRequest.buildEntity();
        nextProjectInfo.setSpace(projectInfo.get().getSpace());

        return new ProjectResponse(projectService.updateProjectInfo(spaceCode, nextProjectInfo, userSession), userSession);
    }

    @Operation(description = "프로젝트 탈퇴")
    @DeleteMapping("/{id}/users/my")
    @DisableAuth
    public ProjectResponse updateProjectUserExit(@PathVariable String spaceCode, @PathVariable Long id, @ApiIgnore UserSession userSession) {
        Project projectInfo = projectService.selectProjectInfo(spaceCode, id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        return new ProjectResponse(projectService.updateProjectUserExit(spaceCode, projectInfo, userSession), userSession);
    }

    @Operation(description = "프로젝트 사용자 조회")
    @GetMapping("/{id}/users")
    public List<UserResponse> selectUsers(@PathVariable String spaceCode, @PathVariable Long id, @RequestParam("word") String word) {
        List<User> users = userService.selectProjectUserList(id, word + "%", word + "%");
        return users.stream().map(UserResponse::new).collect(Collectors.toList());
    }

    @Operation(description = "프로젝트 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProjectInfo(@PathVariable String spaceCode, @PathVariable Long id) {
        Project project = projectService.selectProjectInfo(spaceCode, id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        projectService.deleteProjectInfo(spaceCode, project);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "프로젝트 조회")
    @GetMapping("/{id}")
    @DisableAuth
    public ProjectResponse selectProjectInfo(@PathVariable String spaceCode, @PathVariable Long id, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        boolean isSpaceMember = spaceService.selectIsSpaceMember(spaceCode, userSession);

        if (!isSpaceMember) {
            throw new ServiceException("common.not.authorized");
        }

        Project project = projectService.selectProjectInfo(spaceCode, id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        boolean isProjectMember = project.getUsers().stream().anyMatch((projectUser -> projectUser.getUser().getId().equals(userSession.getId())));

        if (isProjectMember) {
            return new ProjectResponse(project, userSession);
        } else if (!project.getActivated()) {
            throw new ServiceException(HttpStatus.LOCKED);
        } else if (!project.getAllowSearch()) {
            throw new ServiceException(HttpStatus.LOCKED);
        } else {
            ProjectResponse response = new ProjectResponse(project, userSession);
            response.setUserApplicantStatus(new ProjectApplicantResponse(projectService.selectProjectApplicantInfo(project.getId(), userSession.getId()).orElse(null)));
            response.getUsers().clear();
            response.getSprints().clear();
            return response;
        }


    }

    @Operation(description = "토큰으로 프로젝트 조회")
    @GetMapping("/tokens/{token}")
    @DisableAuth
    public ProjectResponse selectProjectInfo(@PathVariable String spaceCode, @PathVariable String token, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        boolean isSpaceMember = spaceService.selectIsSpaceMember(spaceCode, userSession);

        if (!isSpaceMember) {
            throw new ServiceException("common.not.authorized");
        }

        Project project = projectService.selectProjectInfoByToken(token).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        boolean isProjectMember = project.getUsers().stream().anyMatch((projectUser -> projectUser.getUser().getId().equals(userSession.getId())));

        if (isProjectMember) {
            return new ProjectResponse(project, userSession);
        } else if (!project.getActivated()) {
            throw new ServiceException(HttpStatus.LOCKED);
        } else {
            ProjectResponse response = new ProjectResponse(project, userSession);
            response.setUserApplicantStatus(new ProjectApplicantResponse(projectService.selectProjectApplicantInfo(project.getId(), userSession.getId()).orElse(null)));
            response.getUsers().clear();
            response.getSprints().clear();
            return response;
        }
    }

    @Operation(description = "프로젝트 참여 승인/거절")
    @PutMapping("/{id}/applicants/{applicantId}/{operation}")
    public ResponseEntity<?> updateSpaceApplicantInfo(@PathVariable String spaceCode, @PathVariable Long id, @PathVariable Long applicantId, @PathVariable String operation, @ApiIgnore UserSession userSession) {
        Project project = projectService.selectProjectInfo(spaceCode, id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        ProjectApplicant projectApplicant = projectService.selectProjectApplicantInfo(applicantId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (!projectApplicant.getApprovalStatusCode().equals(ApprovalStatusCode.REQUEST)) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        if ("reject".equals(operation)) {
            projectService.updateApplicantReject(spaceCode, id, projectApplicant, userSession);
        } else if ("approve".equals(operation)) {
            projectService.updateApplicantApprove(spaceCode, id, projectApplicant, userSession);
        } else {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "프로젝트 참여 요청")
    @PostMapping("/{id}/join")
    @DisableAuth
    public ResponseEntity<?> createProjectApplicantInfo(@PathVariable String spaceCode, @PathVariable Long id, @RequestParam(value = "token", required = false) String token, @Valid @RequestBody ProjectApplicantRequest projectApplicantRequest, @ApiIgnore UserSession userSession) {

        boolean isSpaceMember = spaceService.selectIsSpaceMember(spaceCode, userSession);
        if (!isSpaceMember) {
            throw new ServiceException("space.not.authorized");
        }

        Project project = projectService.selectProjectInfo(spaceCode, id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        boolean isProjectMember = project.getUsers().stream().anyMatch((projectUser -> projectUser.getUser().getId().equals(userSession.getId())));


        if (isProjectMember) {
            throw new ServiceException(HttpStatus.BAD_REQUEST, "project.already.member");
        } else if (!project.getActivated()) {
            throw new ServiceException(HttpStatus.LOCKED);
        } else if (!project.getAllowSearch()) {
            // 검색이 금지된 경우, 토큰 값이 일치하는 경우에만, 가입 또는 가입 요청 정보 입력
            if (token != null && token.length() > 1) {
                Project tokenProject = projectService.selectProjectInfoByToken(token).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
                if (tokenProject.getAllowAutoJoin()) {
                    ProjectUser projectUser = ProjectUser.builder()
                            .user(User.builder().id(projectApplicantRequest.getUserId()).build())
                            .role(RoleCode.MEMBER)
                            .project(project)
                            .build();
                    projectService.createProjectUserInfo(spaceCode, tokenProject.getId(), projectUser, userSession);
                    return new ResponseEntity<>(HttpStatus.OK);
                } else {
                    Optional<ProjectApplicant> existApplicant = projectService.selectProjectApplicantInfo(project.getId(), projectApplicantRequest.getUserId());
                    if (existApplicant.isPresent()) {
                        existApplicant.get().setApprovalStatusCode(ApprovalStatusCode.REQUEST);
                        projectService.updateApplicantInfo(spaceCode, project.getId(), existApplicant.get(), userSession);
                    } else {
                        ProjectApplicant projectApplicant = projectApplicantRequest.buildEntity(project);
                        projectService.createProjectApplicantInfo(spaceCode, project.getId(), projectApplicant, userSession);
                    }
                    return new ResponseEntity<>(HttpStatus.CREATED);
                }

            }
            throw new ServiceException(HttpStatus.LOCKED);
        } else if (project.getAllowAutoJoin()) {
            ProjectUser projectUser = ProjectUser.builder()
                    .user(User.builder().id(projectApplicantRequest.getUserId()).build())
                    .role(RoleCode.MEMBER)
                    .project(project)
                    .build();
            projectService.createProjectUserInfo(spaceCode, project.getId(), projectUser, userSession);
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            Optional<ProjectApplicant> existApplicant = projectService.selectProjectApplicantInfo(project.getId(), projectApplicantRequest.getUserId());
            if (existApplicant.isPresent()) {
                existApplicant.get().setApprovalStatusCode(ApprovalStatusCode.REQUEST);
                projectService.updateApplicantInfo(spaceCode, project.getId(), existApplicant.get(), userSession);
            } else {
                ProjectApplicant projectApplicant = projectApplicantRequest.buildEntity(project);
                projectService.createProjectApplicantInfo(spaceCode, project.getId(), projectApplicant, userSession);
            }

            return new ResponseEntity<>(HttpStatus.CREATED);
        }
    }

    @Operation(description = "프로젝트 참여 요청 취소")
    @DeleteMapping("/{id}/join")
    @DisableAuth
    public ResponseEntity<?> deleteProjectApplicantInfo(@PathVariable String spaceCode, @PathVariable Long id, @Valid @RequestBody SpaceApplicantRequest spaceApplicantRequest, @ApiIgnore UserSession userSession) {
        ProjectApplicant projectApplicant = projectService.selectProjectApplicantInfo(id, userSession.getId()).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        projectService.deleteProjectApplicantInfo(spaceCode, id, projectApplicant);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "프로젝트 토큰 조회")
    @GetMapping("/token")
    @DisableAuth
    public String selectToken() {
        return projectService.getProjectUniqueToken();
    }

    @Operation(description = "토큰으로 프로젝트 조회")
    @GetMapping("/token/{token}")
    @DisableAuth
    public ProjectResponse selectProjectInfoByToken(@PathVariable String token, @ApiIgnore UserSession userSession) {
        Project project = projectService.selectProjectInfoByToken(token).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        boolean isMember = projectService.selectIsProjectMember(project.getId(), userSession);
        if (isMember) {
            return new ProjectResponse(project, userSession);
        } else if (!project.getActivated()) {
            throw new ServiceException(HttpStatus.LOCKED);
        } else {
            ProjectResponse response = new ProjectResponse(project, userSession);
            response.setUserApplicantStatus(new ProjectApplicantResponse(projectService.selectProjectApplicantInfo(project.getId(), userSession.getId()).orElse(null)));
            response.getUsers().clear();
            return response;
        }
    }


}
