package com.mindplates.everyonesprint.biz.project.controller;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
import com.mindplates.everyonesprint.biz.project.vo.request.ProjectRequest;
import com.mindplates.everyonesprint.biz.project.vo.response.ProjectListResponse;
import com.mindplates.everyonesprint.biz.project.vo.response.ProjectResponse;
import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.service.SpaceService;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.biz.user.vo.response.UserResponse;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import io.swagger.v3.oas.annotations.Operation;
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
public class ProjectController {

    final private ProjectService projectService;

    final private SpaceService spaceService;

    final private UserService userService;

    public ProjectController(ProjectService projectService, SpaceService spaceService, UserService userService) {
        this.projectService = projectService;
        this.spaceService = spaceService;
        this.userService = userService;
    }

    @Operation(description = "사용자의 프로젝트 목록 조회")
    @GetMapping("")
    public List<ProjectListResponse> selectUserProjectList(@PathVariable String spaceCode, @ApiIgnore UserSession userSession) {
        List<Project> projects = projectService.selectUserProjectList(spaceCode, userSession);
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

        return new ProjectResponse(projectService.createProjectInfo(project, userSession), userSession);
    }

    @Operation(description = "프로젝트 수정")
    @PutMapping("/{id}")
    public ProjectResponse updateProjectInfo(@PathVariable String spaceCode, @PathVariable Long id, @Valid @RequestBody ProjectRequest projectRequest, @ApiIgnore UserSession userSession) {

        if (!id.equals(projectRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Project projectInfo = projectRequest.buildEntity();
        Optional<Space> space = spaceService.selectSpaceInfo(spaceCode);
        if (space.isPresent()) {
            projectInfo.setSpace(space.get());
        } else {
            throw new ServiceException(HttpStatus.NOT_FOUND);
        }

        return new ProjectResponse(projectService.updateProjectInfo(projectInfo, userSession), userSession);
    }

    @Operation(description = "프로젝트 사용자 조회")
    @GetMapping("/{id}/users")
    public List<UserResponse> selectUsers(@PathVariable String spaceCode, @PathVariable Long id, @RequestParam("word") String word) {
        List<User> users = userService.selectProjectUserList(id, word + "%", word + "%");
        return users.stream().map(UserResponse::new).collect(Collectors.toList());
    }

    @Operation(description = "프로젝트 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteProjectInfo(@PathVariable String spaceCode, @PathVariable Long id) {
        Project project = projectService.selectProjectInfo(spaceCode, id).get();
        projectService.deleteProjectInfo(project);
        return new ResponseEntity(HttpStatus.OK);
    }


    @Operation(description = "프로젝트 조회")
    @GetMapping("/{id}")
    public ProjectResponse selectProjectInfo(@PathVariable String spaceCode, @PathVariable Long id, @ApiIgnore UserSession userSession) {
        Project project = projectService.selectProjectInfo(spaceCode, id).get();
        return new ProjectResponse(project, userSession);
    }


}
