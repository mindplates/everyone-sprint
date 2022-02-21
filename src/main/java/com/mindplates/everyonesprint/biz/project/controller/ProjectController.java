package com.mindplates.everyonesprint.biz.project.controller;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
import com.mindplates.everyonesprint.biz.project.vo.request.ProjectRequest;
import com.mindplates.everyonesprint.biz.project.vo.response.ProjectListResponse;
import com.mindplates.everyonesprint.biz.project.vo.response.ProjectResponse;
import com.mindplates.everyonesprint.common.code.RoleCode;
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
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    final private ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    private void checkIsAdminUser(UserSession userSession, Project project) {
        if (project.getUsers().stream().noneMatch(projectUser -> projectUser.getUser().getId().equals(userSession.getId()) && projectUser.getRole().equals(RoleCode.ADMIN))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @Operation(description = "사용자의 프로젝트 목록 조회")
    @GetMapping("")
    public List<ProjectListResponse> selectUserProjectList(@ApiIgnore UserSession userSession) {
        List<Project> projects = projectService.selectUserPrjectList(userSession);
        return projects.stream().map((project -> new ProjectListResponse(project, userSession))).collect(Collectors.toList());
    }

    @Operation(description = "프로젝트 생성")
    @PostMapping("")
    public ProjectResponse createProjectInfo(@Valid @RequestBody ProjectRequest projectRequest, @ApiIgnore UserSession userSession) {

        Project alreadyProject = projectService.selectByName(projectRequest.getName());
        if (alreadyProject != null) {
            throw new ServiceException("project.duplicated");
        }

        Project project = projectRequest.buildEntity();
        return new ProjectResponse(projectService.createProjectInfo(project, userSession), userSession);
    }

    @Operation(description = "프로젝트 수정")
    @PutMapping("/{id}")
    public ProjectResponse updateProjectInfo(@PathVariable Long id, @Valid @RequestBody ProjectRequest projectRequest, @ApiIgnore UserSession userSession) {

        if (!id.equals(projectRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Project project = projectService.selectProjectInfo(id);
        checkIsAdminUser(userSession, project);
        Project projectInfo = projectRequest.buildEntity();
        return new ProjectResponse(projectService.updateProjectInfo(projectInfo, userSession), userSession);
    }

    @Operation(description = "프로젝트 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteProjectInfo(@PathVariable Long id, @ApiIgnore UserSession userSession) {
        Project project = projectService.selectProjectInfo(id);
        checkIsAdminUser(userSession, project);
        projectService.deleteProjectInfo(project);
        return new ResponseEntity(HttpStatus.OK);
    }


    @Operation(description = "프로젝트 조회")
    @GetMapping("/{id}")
    public ProjectResponse selectProjectInfo(@PathVariable Long id, @ApiIgnore UserSession userSession) {
        Project project = projectService.selectProjectInfo(id);
        if (project.getUsers().stream().noneMatch(projectUser -> projectUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
        return new ProjectResponse(project, userSession);
    }


}
