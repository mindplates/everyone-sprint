package com.mindplates.everyonesprint.biz.project.service;

import com.mindplates.everyonesprint.biz.meeting.repository.MeetingUserRepository;
import com.mindplates.everyonesprint.biz.meeting.repository.RoomUserRepository;
import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.repository.ProjectRepository;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.repository.ScrumMeetingAnswerRepository;
import com.mindplates.everyonesprint.biz.sprint.repository.SprintUserRepository;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.config.CacheConfig;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    public Project updateProjectInfo(String spaceCode, Project project, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        project.setLastUpdateDate(now);
        project.setLastUpdatedBy(userSession.getId());

        ArrayList<Long> deleteUserIds = new ArrayList<>();
        project.getUsers().stream()
                .filter((projectUser -> projectUser.getCRUD().equals("D")))
                .forEach((projectUser -> deleteUserIds.add(projectUser.getUser().getId())));

        project.setUsers(project.getUsers().stream().filter((spaceUser -> !spaceUser.getCRUD().equals("D"))).collect(Collectors.toList()));

        deleteUserIds.forEach((userId -> {
            meetingUserRepository.deleteByProjectIdAndUserId(project.getId(), userId);
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
            sprintService.deleteSprintInfo(sprint.getId());
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


}
