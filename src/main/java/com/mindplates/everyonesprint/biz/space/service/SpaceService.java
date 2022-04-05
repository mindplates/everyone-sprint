package com.mindplates.everyonesprint.biz.space.service;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.entity.SpaceApplicant;
import com.mindplates.everyonesprint.biz.space.entity.SpaceUser;
import com.mindplates.everyonesprint.biz.space.repository.SpaceApplicantRepository;
import com.mindplates.everyonesprint.biz.space.repository.SpaceRepository;
import com.mindplates.everyonesprint.biz.space.repository.SpaceUserRepository;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import com.mindplates.everyonesprint.common.code.RoleCode;
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

    final private SpaceApplicantRepository spaceApplicantRepository;

    final private SpaceUserRepository spaceUserRepository;

    final private ProjectService projectService;

    final private SprintService sprintService;

    public SpaceService(SpaceRepository spaceRepository, ProjectService projectService, SprintService sprintService, SpaceApplicantRepository spaceApplicantRepository, SpaceUserRepository spaceUserRepository) {
        this.spaceRepository = spaceRepository;
        this.projectService = projectService;
        this.sprintService = sprintService;
        this.spaceApplicantRepository = spaceApplicantRepository;
        this.spaceUserRepository = spaceUserRepository;
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

    public List<Space> selectUserActivatedSpaceList(Long userId) {
        return spaceRepository.findAllByUsersUserIdAndActivatedTrue(userId);
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

    public boolean selectIsSpaceMember(Long spaceId, UserSession userSession) {
        return spaceRepository.existsByIdAndUsersUserId(spaceId, userSession.getId());
    }

    public Optional<SpaceApplicant> selectIsSpaceMember(Long spaceId, Long userId) {
        return spaceApplicantRepository.findBySpaceIdAndUserId(spaceId, userId);
    }

    public SpaceApplicant createSpaceApplicantInfo(SpaceApplicant spaceApplicant, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        spaceApplicant.setApprovalStatusCode(ApprovalStatusCode.REQUEST);
        spaceApplicant.setCreationDate(now);
        spaceApplicant.setLastUpdateDate(now);
        spaceApplicant.setCreatedBy(userSession.getId());
        spaceApplicant.setLastUpdatedBy(userSession.getId());
        spaceApplicantRepository.save(spaceApplicant);
        return spaceApplicant;
    }

    public SpaceApplicant updateApplicantReject(SpaceApplicant spaceApplicant, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        spaceApplicant.setLastUpdateDate(now);
        spaceApplicant.setLastUpdatedBy(userSession.getId());
        spaceApplicant.setApprovalStatusCode(ApprovalStatusCode.REJECTED);
        spaceApplicantRepository.save(spaceApplicant);
        return spaceApplicant;
    }

    public SpaceApplicant updateApplicantInfo(SpaceApplicant spaceApplicant, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        spaceApplicant.setLastUpdateDate(now);
        spaceApplicant.setLastUpdatedBy(userSession.getId());
        spaceApplicantRepository.save(spaceApplicant);
        return spaceApplicant;
    }

    public SpaceApplicant updateApplicantApprove(SpaceApplicant spaceApplicant, UserSession userSession) {

        LocalDateTime now = LocalDateTime.now();
        spaceApplicant.setLastUpdateDate(now);
        spaceApplicant.setLastUpdatedBy(userSession.getId());
        spaceApplicant.setApprovalStatusCode(ApprovalStatusCode.APPROVAL);
        spaceApplicantRepository.save(spaceApplicant);

        boolean isMember = spaceUserRepository.existsBySpaceIdAndUserId(spaceApplicant.getSpace().getId(), spaceApplicant.getUser().getId());
        if (!isMember) {
            SpaceUser spaceUser = SpaceUser.builder()
                    .user(User.builder().id(spaceApplicant.getUser().getId()).build())
                    .role(RoleCode.MEMBER)
                    .space(Space.builder().id(spaceApplicant.getSpace().getId()).build())
                    .build();

            spaceUserRepository.save(spaceUser);
        }


        return spaceApplicant;
    }


    public SpaceUser createSpaceUserInfo(SpaceUser spaceUser, UserSession userSession) {
        if (!spaceUserRepository.existsBySpaceIdAndUserId(spaceUser.getSpace().getId(), spaceUser.getUser().getId())) {
            LocalDateTime now = LocalDateTime.now();
            spaceUser.setCreationDate(now);
            spaceUser.setLastUpdateDate(now);
            spaceUser.setCreatedBy(userSession.getId());
            spaceUser.setLastUpdatedBy(userSession.getId());
            spaceUserRepository.save(spaceUser);
        }
        return spaceUser;
    }

    public Optional<SpaceApplicant> selectSpaceApplicantInfo(Long spaceId, Long userId) {
        return spaceApplicantRepository.findBySpaceIdAndUserId(spaceId, userId);
    }

    public Optional<SpaceApplicant> selectSpaceApplicantInfo(Long id) {
        return spaceApplicantRepository.findById(id);
    }


    public void deleteSpaceApplicantInfo(SpaceApplicant spaceApplicant) {
        spaceApplicantRepository.delete(spaceApplicant);
    }


}
