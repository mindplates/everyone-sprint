package com.mindplates.everyonesprint.biz.project.service;

import com.mindplates.everyonesprint.biz.meeting.repository.MeetingUserRepository;
import com.mindplates.everyonesprint.biz.meeting.repository.RoomUserRepository;
import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.entity.ProjectApplicant;
import com.mindplates.everyonesprint.biz.project.entity.ProjectUser;
import com.mindplates.everyonesprint.biz.project.repository.ProjectApplicantRepository;
import com.mindplates.everyonesprint.biz.project.repository.ProjectRepository;
import com.mindplates.everyonesprint.biz.project.repository.ProjectUserRepository;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.repository.ScrumMeetingAnswerRepository;
import com.mindplates.everyonesprint.biz.sprint.repository.SprintUserRepository;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.config.CacheConfig;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class ProjectService {

    final private ProjectRepository projectRepository;

    final private SprintService sprintService;

    final private MeetingUserRepository meetingUserRepository;

    final private SprintUserRepository sprintUserRepository;

    final private RoomUserRepository roomUserRepository;

    final private ScrumMeetingAnswerRepository scrumMeetingAnswerRepository;

    final private ProjectApplicantRepository projectApplicantRepository;

    final private ProjectUserRepository projectUserRepository;

    @Cacheable(key = "{#spaceCode,#id}", value = CacheConfig.PROJECT)
    public Optional<Project> selectProjectInfo(String spaceCode, Long id) {
        return projectRepository.findBySpaceCodeAndId(spaceCode, id);
    }

    @CacheEvict(key = "{#spaceCode,#project.id}", value = CacheConfig.PROJECT)
    public Project createProjectInfo(String spaceCode, Project project, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        project.setCreationDate(now);
        project.setLastUpdateDate(now);
        project.setCreatedBy(userSession.getId());
        project.setLastUpdatedBy(userSession.getId());
        projectRepository.save(project);
        return project;
    }

    @CacheEvict(key = "{#spaceCode,#project.id}", value = CacheConfig.PROJECT)
    public Project updateProjectUserExit(String spaceCode, Project project, UserSession userSession) {
        ProjectUser currentUser = project.getUsers().stream().filter((projectUser -> projectUser.getUser().getId().equals(userSession.getId()))).findFirst().orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        currentUser.setCRUD("D");
        LocalDateTime now = LocalDateTime.now();
        project.setLastUpdateDate(now);
        project.setLastUpdatedBy(userSession.getId());
        this.updateProjectInfo(spaceCode, project, userSession);
        projectRepository.save(project);
        return project;
    }

    @CacheEvict(key = "{#spaceCode,#project.id}", value = CacheConfig.PROJECT)
    public Project updateProjectInfo(String spaceCode, Project project, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        project.setLastUpdateDate(now);
        project.setLastUpdatedBy(userSession.getId());

        ArrayList<Long> deleteUserIds = new ArrayList<>();
        project.getUsers().stream()
                .filter((projectUser -> projectUser.getCRUD() != null && projectUser.getCRUD().equals("D")))
                .forEach((projectUser -> deleteUserIds.add(projectUser.getUser().getId())));

        project.setUsers(project.getUsers().stream().filter(spaceUser -> spaceUser.getCRUD() == null || !spaceUser.getCRUD().equals("D")).collect(Collectors.toList()));

        deleteUserIds.forEach((userId -> {
            meetingUserRepository.deleteByProjectIdAndUserId(project.getId(), userId);
            projectApplicantRepository.deleteByProjectIdAndUserId(project.getId(), userId);
            sprintUserRepository.deleteByProjectIdAndUserId(project.getId(), userId);
            roomUserRepository.deleteByProjectIdAndUserId(project.getId(), userId);
            scrumMeetingAnswerRepository.deleteByProjectIdAndUserId(project.getId(), userId);
        }));

        projectRepository.save(project);
        return project;
    }

    @CacheEvict(key = "{#spaceCode,#project.id}", value = CacheConfig.PROJECT)
    public void deleteProjectInfo(String spaceCode, Project project) {
        for (Sprint sprint : project.getSprints()) {
            sprintService.deleteSprintInfo(spaceCode, project.getId(), sprint.getId());
        }
        projectRepository.delete(project);
    }

    public Project selectByName(String spaceCode, String name) {
        return projectRepository.findBySpaceCodeAndName(spaceCode, name).orElse(null);
    }

    public List<Project> selectUserProjectList(String spaceCode, UserSession userSession) {
        return projectRepository.findAllBySpaceCodeAndUsersUserId(spaceCode, userSession.getId());
    }

    public List<Project> selectSpaceProjectList(Long spaceId) {
        return projectRepository.findAllBySpaceId(spaceId);
    }

    public Long selectAllProjectCount() {
        return projectRepository.countBy();
    }

    public Long selectAllProjectCount(String spaceCode) {
        return projectRepository.countBySpaceCode(spaceCode);
    }

    public List<Project> selectProjectList(String spaceCode, String text) {
        return projectRepository.findAllBySpaceCodeAndNameLikeAndAllowSearchTrueAndActivatedTrue(spaceCode, "%" + text + "%");
    }

    public Optional<ProjectApplicant> selectProjectApplicantInfo(Long projectId, Long userId) {
        return projectApplicantRepository.findByProjectIdAndUserId(projectId, userId);
    }

    public Optional<ProjectApplicant> selectProjectApplicantInfo(Long applicantId) {
        return projectApplicantRepository.findById(applicantId);
    }

    public Optional<Project> selectProjectInfoByToken(String token) {
        return projectRepository.findByToken(token);
    }


    @CacheEvict(key = "{#spaceCode,#projectId}", value = CacheConfig.PROJECT)
    public ProjectUser createProjectUserInfo(String spaceCode, Long projectId, ProjectUser projectUser, UserSession userSession) {

        if (!projectUserRepository.existsByProjectIdAndUserId(projectId, projectUser.getUser().getId())) {
            LocalDateTime now = LocalDateTime.now();
            projectUser.setCreationDate(now);
            projectUser.setLastUpdateDate(now);
            projectUser.setCreatedBy(userSession.getId());
            projectUser.setLastUpdatedBy(userSession.getId());
            projectUserRepository.save(projectUser);
        }
        return projectUser;
    }

    @CacheEvict(key = "{#spaceCode,#projectId}", value = CacheConfig.PROJECT)
    public ProjectApplicant createProjectApplicantInfo(String spaceCode, Long projectId, ProjectApplicant projectApplicant, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        projectApplicant.setApprovalStatusCode(ApprovalStatusCode.REQUEST);
        projectApplicant.setCreationDate(now);
        projectApplicant.setLastUpdateDate(now);
        projectApplicant.setCreatedBy(userSession.getId());
        projectApplicant.setLastUpdatedBy(userSession.getId());
        projectApplicantRepository.save(projectApplicant);
        return projectApplicant;
    }

    @CacheEvict(key = "{#spaceCode,#projectId}", value = CacheConfig.PROJECT)
    public ProjectApplicant updateApplicantInfo(String spaceCode, Long projectId, ProjectApplicant projectApplicant, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        projectApplicant.setLastUpdateDate(now);
        projectApplicant.setLastUpdatedBy(userSession.getId());
        projectApplicantRepository.save(projectApplicant);
        return projectApplicant;
    }

    @CacheEvict(key = "{#spaceCode,#projectId}", value = CacheConfig.PROJECT)
    public ProjectApplicant updateApplicantReject(String spaceCode, Long projectId, ProjectApplicant projectApplicant, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        projectApplicant.setLastUpdateDate(now);
        projectApplicant.setLastUpdatedBy(userSession.getId());
        projectApplicant.setApprovalStatusCode(ApprovalStatusCode.REJECTED);
        projectApplicantRepository.save(projectApplicant);
        return projectApplicant;
    }

    @CacheEvict(key = "{#spaceCode,#projectId}", value = CacheConfig.PROJECT)
    public ProjectApplicant updateApplicantApprove(String spaceCode, Long projectId, ProjectApplicant projectApplicant, UserSession userSession) {

        LocalDateTime now = LocalDateTime.now();
        projectApplicant.setLastUpdateDate(now);
        projectApplicant.setLastUpdatedBy(userSession.getId());
        projectApplicant.setApprovalStatusCode(ApprovalStatusCode.APPROVAL);
        projectApplicantRepository.save(projectApplicant);

        boolean isMember = projectUserRepository.existsByProjectIdAndUserId(projectId, projectApplicant.getUser().getId());
        if (!isMember) {
            ProjectUser spaceUser = ProjectUser.builder()
                    .user(User.builder().id(projectApplicant.getUser().getId()).build())
                    .role(RoleCode.MEMBER)
                    .project(Project.builder().id(projectApplicant.getProject().getId()).build())
                    .build();

            projectUserRepository.save(spaceUser);
        }


        return projectApplicant;
    }

    @CacheEvict(key = "{#spaceCode,#projectId}", value = CacheConfig.PROJECT)
    public void deleteProjectApplicantInfo(String spaceCode, Long projectId, ProjectApplicant projectApplicant) {
        projectApplicantRepository.delete(projectApplicant);
    }

    public String getProjectUniqueToken() {

        String token = "";
        boolean exists = false;
        do {
            token = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10);
            exists = projectRepository.existsByToken(token);
        } while (exists);

        return token;
    }

    public boolean selectIsProjectMember(Long projectId, UserSession userSession) {
        return projectRepository.existsByIdAndUsersUserId(projectId, userSession.getId());
    }

}
