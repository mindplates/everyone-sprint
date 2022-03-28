package com.mindplates.everyonesprint.biz.project.service;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.repository.ProjectRepository;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectService {

    final private ProjectRepository projectRepository;

    final private SprintService sprintService;

    public ProjectService(ProjectRepository projectRepository, SprintService sprintService) {
        this.projectRepository = projectRepository;
        this.sprintService = sprintService;
    }

    public Project selectByName(String name) {
        return projectRepository.findByName(name).orElse(null);
    }

    public Project createProjectInfo(Project project, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        project.setCreationDate(now);
        project.setLastUpdateDate(now);
        project.setCreatedBy(userSession.getId());
        project.setLastUpdatedBy(userSession.getId());
        projectRepository.save(project);
        return project;
    }

    public Project updateProjectInfo(Project project, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        project.setLastUpdateDate(now);
        project.setLastUpdatedBy(userSession.getId());
        projectRepository.save(project);
        return project;
    }


    public void deleteProjectInfo(Project project) {
        for (Sprint sprint : project.getSprints()) {
            sprintService.deleteSprintInfo(sprint.getId());
        }
        projectRepository.delete(project);
    }

    public List<Project> selectUserProjectList(UserSession userSession) {
        return projectRepository.findAllByUsersUserId(userSession.getId());
    }

    public List<Project> selectSpaceProjectList(Long spaceId) {
        return projectRepository.findAllBySpaceId(spaceId);
    }

    public Optional<Project> selectProjectInfo(Long id) {
        return projectRepository.findById(id);
    }


    public Long selectAllProjectCount() {
        return projectRepository.countBy();
    }


}
