package com.mindplates.everyonesprint.biz.space.service;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.repository.SpaceRepository;
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
public class SpaceService {

    final private SpaceRepository spaceRepository;

    final private ProjectService projectService;

    final private SprintService sprintService;

    public SpaceService(SpaceRepository spaceRepository, ProjectService projectService, SprintService sprintService) {
        this.spaceRepository = spaceRepository;
        this.projectService = projectService;
        this.sprintService = sprintService;
    }

    public Space selectByName(String name) {
        return spaceRepository.findByName(name).orElse(null);
    }

    public Space selectByCode(String code) {
        return spaceRepository.findByCode(code).orElse(null);
    }

    public Space selectByCode(Long spaceId, String code) {
        return spaceRepository.findByIdNotAndCode(spaceId, code).orElse(null);
    }

    public Space createSpaceInfo(Space space, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        space.setCode(space.getCode().toUpperCase());
        space.setCreationDate(now);
        space.setLastUpdateDate(now);
        space.setCreatedBy(userSession.getId());
        space.setLastUpdatedBy(userSession.getId());
        spaceRepository.save(space);
        return space;
    }

    public Space updateSpaceInfo(Space space, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        space.setCode(space.getCode().toUpperCase());
        space.setLastUpdateDate(now);
        space.setLastUpdatedBy(userSession.getId());
        spaceRepository.save(space);
        return space;
    }


    public void deleteSpaceInfo(Space space) {

        List<Project> spaceProjects = projectService.selectSpaceProjectList(space.getId());

        for (Project project : spaceProjects) {
            for (Sprint sprint : project.getSprints()) {
                sprintService.deleteSprintInfo(sprint.getId());
            }
            projectService.deleteProjectInfo(project);
        }
        spaceRepository.delete(space);
    }

    public List<Space> selectUserSpaceList(UserSession userSession, String text) {
        return spaceRepository.findAllByUsersUserIdAndNameLike(userSession.getId(), "%" + text + "%");
    }

    public List<Space> selectSpaceList(String text) {
        return spaceRepository.findAllByNameLikeAndAllowSearchTrueAndActivatedTrue("%" + text + "%");
    }

    public Optional<Space> selectSpaceInfo(Long id) {
        return spaceRepository.findById(id);
    }


    public Long selectAllSpaceCount() {
        return spaceRepository.countBy();
    }


}
