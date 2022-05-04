package com.mindplates.everyonesprint.biz.space.service;

import com.mindplates.everyonesprint.biz.meeting.repository.MeetingUserRepository;
import com.mindplates.everyonesprint.biz.meeting.repository.RoomUserRepository;
import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.repository.ProjectUserRepository;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.entity.SpaceApplicant;
import com.mindplates.everyonesprint.biz.space.entity.SpaceUser;
import com.mindplates.everyonesprint.biz.space.repository.SpaceApplicantRepository;
import com.mindplates.everyonesprint.biz.space.repository.SpaceRepository;
import com.mindplates.everyonesprint.biz.space.repository.SpaceUserRepository;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.repository.ScrumMeetingAnswerRepository;
import com.mindplates.everyonesprint.biz.sprint.repository.SprintUserRepository;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import com.mindplates.everyonesprint.common.code.RoleCode;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class SpaceService {

    final private SpaceRepository spaceRepository;

    final private SpaceApplicantRepository spaceApplicantRepository;

    final private SpaceUserRepository spaceUserRepository;

    final private ProjectService projectService;

    final private SprintService sprintService;

    final private MeetingUserRepository meetingUserRepository;

    final private ProjectUserRepository projectUserRepository;

    final private SprintUserRepository sprintUserRepository;

    final private RoomUserRepository roomUserRepository;

    final private ScrumMeetingAnswerRepository scrumMeetingAnswerRepository;


    public Space selectByCode(Long spaceId, String code) {
        return spaceRepository.findByIdNotAndCode(spaceId, code).orElse(null);
    }

    @CacheEvict(key = "#space.code", value = CacheConfig.SPACE)
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

    @CacheEvict(key = "#space.code", value = CacheConfig.SPACE)
    public Space updateSpaceInfo(Space space, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        space.setCode(space.getCode().toUpperCase());
        space.setLastUpdateDate(now);
        space.setLastUpdatedBy(userSession.getId());

        ArrayList<Long> deleteUserIds = new ArrayList<>();
        space.getUsers().stream()
                .filter((spaceUser -> spaceUser.getCRUD().equals("D")))
                .forEach((spaceUser -> deleteUserIds.add(spaceUser.getUser().getId())));

        space.setUsers(space.getUsers().stream().filter((spaceUser -> !spaceUser.getCRUD().equals("D"))).collect(Collectors.toList()));

        deleteUserIds.forEach((userId -> {
            meetingUserRepository.deleteBySpaceCodeAndUserId(space.getCode(), userId);
            sprintUserRepository.deleteBySpaceCodeAndUserId(space.getCode(), userId);
            projectUserRepository.deleteBySpaceCodeAndUserId(space.getCode(), userId);
            roomUserRepository.deleteBySpaceCodeAndUserId(space.getCode(), userId);
            scrumMeetingAnswerRepository.deleteBySpaceCodeAndUserId(space.getCode(), userId);
        }));

        spaceRepository.save(space);

        return space;
    }

    @CacheEvict(key = "#space.code", value = CacheConfig.SPACE)
    public void deleteSpaceInfo(Space space) {

        List<Project> spaceProjects = projectService.selectSpaceProjectList(space.getId());

        for (Project project : spaceProjects) {
            for (Sprint sprint : project.getSprints()) {
                sprintService.deleteSprintInfo(sprint.getId());
            }
            projectService.deleteProjectInfo(space.getCode(), project);
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

    @Cacheable(key = "#spaceCode", value = CacheConfig.SPACE)
    public Optional<Space> selectSpaceInfo(String spaceCode) {
        return spaceRepository.findByCode(spaceCode);
    }

    public boolean selectIsSpaceMember(String spaceCode, UserSession userSession) {
        return spaceRepository.existsByCodeAndUsersUserId(spaceCode, userSession.getId());
    }

    @CacheEvict(key = "#spaceCode", value = CacheConfig.SPACE)
    public SpaceApplicant createSpaceApplicantInfo(String spaceCode, SpaceApplicant spaceApplicant, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        spaceApplicant.setApprovalStatusCode(ApprovalStatusCode.REQUEST);
        spaceApplicant.setCreationDate(now);
        spaceApplicant.setLastUpdateDate(now);
        spaceApplicant.setCreatedBy(userSession.getId());
        spaceApplicant.setLastUpdatedBy(userSession.getId());
        spaceApplicantRepository.save(spaceApplicant);
        return spaceApplicant;
    }

    @CacheEvict(key = "#spaceCode", value = CacheConfig.SPACE)
    public SpaceApplicant updateApplicantReject(String spaceCode, SpaceApplicant spaceApplicant, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        spaceApplicant.setLastUpdateDate(now);
        spaceApplicant.setLastUpdatedBy(userSession.getId());
        spaceApplicant.setApprovalStatusCode(ApprovalStatusCode.REJECTED);
        spaceApplicantRepository.save(spaceApplicant);
        return spaceApplicant;
    }

    @CacheEvict(key = "#spaceCode", value = CacheConfig.SPACE)
    public SpaceApplicant updateApplicantInfo(String spaceCode, SpaceApplicant spaceApplicant, UserSession userSession) {
        LocalDateTime now = LocalDateTime.now();
        spaceApplicant.setLastUpdateDate(now);
        spaceApplicant.setLastUpdatedBy(userSession.getId());
        spaceApplicantRepository.save(spaceApplicant);
        return spaceApplicant;
    }

    @CacheEvict(key = "#spaceCode", value = CacheConfig.SPACE)
    public SpaceApplicant updateApplicantApprove(String spaceCode, SpaceApplicant spaceApplicant, UserSession userSession) {

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

    @CacheEvict(key = "#spaceCode", value = CacheConfig.SPACE)
    public SpaceUser createSpaceUserInfo(String spaceCode, SpaceUser spaceUser, UserSession userSession) {
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

    public Optional<SpaceApplicant> selectSpaceApplicantInfo(String spaceCode, Long userId) {
        return spaceApplicantRepository.findBySpaceCodeAndUserId(spaceCode, userId);
    }

    public Optional<SpaceApplicant> selectSpaceApplicantInfo(Long id) {
        return spaceApplicantRepository.findById(id);
    }

    @CacheEvict(key = "#spaceCode", value = CacheConfig.SPACE)
    public void deleteSpaceApplicantInfo(String spaceCode, SpaceApplicant spaceApplicant) {
        spaceApplicantRepository.delete(spaceApplicant);
    }

    public String getSpaceUniqueToken() {

        String token = "";
        boolean exists = false;
        do {
            token = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10);
            exists = spaceRepository.existsByToken(token);
        } while (exists);

        return token;
    }


}
