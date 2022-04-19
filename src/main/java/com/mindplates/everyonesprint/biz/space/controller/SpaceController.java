package com.mindplates.everyonesprint.biz.space.controller;

import com.mindplates.everyonesprint.biz.common.vo.response.StatsInfoResponse;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.entity.SpaceApplicant;
import com.mindplates.everyonesprint.biz.space.entity.SpaceUser;
import com.mindplates.everyonesprint.biz.space.service.SpaceService;
import com.mindplates.everyonesprint.biz.space.vo.request.SpaceApplicantRequest;
import com.mindplates.everyonesprint.biz.space.vo.request.SpaceRequest;
import com.mindplates.everyonesprint.biz.space.vo.response.SpaceApplicantResponse;
import com.mindplates.everyonesprint.biz.space.vo.response.SpaceListResponse;
import com.mindplates.everyonesprint.biz.space.vo.response.SpaceResponse;
import com.mindplates.everyonesprint.biz.space.vo.response.UserAndSpaceResponse;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.biz.user.vo.response.MyInfoResponse;
import com.mindplates.everyonesprint.common.code.ApprovalStatusCode;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.annotation.DisableAuth;
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
@RequestMapping("/api/spaces")
public class SpaceController {

    final private SpaceService spaceService;
    final private SprintService sprintService;
    final private MeetingService meetingService;
    final private ProjectService projectService;
    final private UserService userService;


    public SpaceController(SpaceService spaceService, SprintService sprintService, MeetingService meetingService, ProjectService projectService, UserService userService) {
        this.spaceService = spaceService;
        this.sprintService = sprintService;
        this.meetingService = meetingService;
        this.projectService = projectService;
        this.userService = userService;
    }

    @GetMapping("/{spaceCode}/stats")
    @Operation(summary = "스페이스 데이터의 통계", description = "주요 데이터의 통계")
    public StatsInfoResponse selectStatsInfo(@PathVariable String spaceCode) {

        return StatsInfoResponse.builder()
                .sprintCount(sprintService.selectAllSprintCount(spaceCode))
                .meetingCount(meetingService.selectAllMeetingCount(spaceCode))
                .userCount(userService.selectAllUserCount(spaceCode))
                .projectCount(projectService.selectAllProjectCount(spaceCode))
                .build();
    }


    @Operation(description = "스페이스 목록 조회")
    @GetMapping("")
    public List<SpaceListResponse> selectUserSpaceList(@RequestParam("type") String type, @RequestParam("text") String text, @ApiIgnore UserSession userSession) {
        List<Space> spaces;
        if ("my".equals(type)) {
            spaces = spaceService.selectUserSpaceList(userSession, text);
        } else {
            spaces = spaceService.selectSpaceList(text);
        }

        return spaces.stream().map((space -> new SpaceListResponse(space, userSession))).collect(Collectors.toList());
    }

    @Operation(description = "스페이스 조회")
    @GetMapping("/{spaceCode}")
    @DisableAuth
    public SpaceResponse selectSpaceInfo(@PathVariable String spaceCode, @ApiIgnore UserSession userSession) {
        Optional<Space> space = spaceService.selectSpaceInfo(spaceCode);

        if (space.isPresent()) {
            boolean isMember = spaceService.selectIsSpaceMember(spaceCode, userSession);
            if (isMember) {
                return new SpaceResponse(space.get(), userSession);
            } else if (!space.get().getActivated()) {
                throw new ServiceException(HttpStatus.LOCKED);
            } else if (!space.get().getAllowSearch()) {
                throw new ServiceException(HttpStatus.LOCKED);
            } else {
                SpaceResponse response = new SpaceResponse(space.get(), userSession);
                response.setUserApplicantStatus(new SpaceApplicantResponse(spaceService.selectSpaceApplicantInfo(spaceCode, userSession.getId()).orElse(null)));
                response.getUsers().clear();
                return response;
            }

        }

        throw new ServiceException(HttpStatus.NOT_FOUND);
    }

    @Operation(description = "스페이스 참여 승인/거절")
    @PutMapping("/{spaceCode}/applicants/{applicantId}/{operation}")
    public ResponseEntity updateSpaceApplicantInfo(@PathVariable String spaceCode, @PathVariable Long applicantId, @PathVariable String operation, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfo(spaceCode).get();
        SpaceApplicant spaceApplicant = spaceService.selectSpaceApplicantInfo(applicantId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (!spaceApplicant.getApprovalStatusCode().equals(ApprovalStatusCode.REQUEST)) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        if (!spaceApplicant.getSpace().getId().equals(space.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        if ("reject".equals(operation)) {
            spaceService.updateApplicantReject(spaceApplicant, userSession);
        } else if ("approve".equals(operation)) {
            spaceService.updateApplicantApprove(spaceApplicant, userSession);
        } else {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity(HttpStatus.OK);
    }

    @Operation(description = "스페이스 참여 요청")
    @PostMapping("/{spaceCode}/join")
    @DisableAuth
    public ResponseEntity createSpaceApplicantInfo(@PathVariable String spaceCode, @Valid @RequestBody SpaceApplicantRequest spaceApplicantRequest, @ApiIgnore UserSession userSession) {
        Optional<Space> space = spaceService.selectSpaceInfo(spaceCode);

        if (space.isPresent()) {
            boolean isMember = spaceService.selectIsSpaceMember(spaceCode, userSession);
            if (isMember) {
                throw new ServiceException(HttpStatus.BAD_REQUEST, "space.already.member");
            } else if (!space.get().getActivated()) {
                throw new ServiceException(HttpStatus.LOCKED);
            } else if (!space.get().getAllowSearch()) {
                throw new ServiceException(HttpStatus.LOCKED);
            } else if (space.get().getAllowAutoJoin()) {
                SpaceUser spaceUser = SpaceUser.builder()
                        .user(User.builder().id(spaceApplicantRequest.getUserId()).build())
                        .role(RoleCode.MEMBER)
                        .space(space.get())
                        .build();
                spaceService.createSpaceUserInfo(spaceUser, userSession);
                return new ResponseEntity(HttpStatus.OK);
            } else {
                Optional<SpaceApplicant> existApplicant = spaceService.selectIsSpaceMember(spaceCode, spaceApplicantRequest.getUserId());
                if (existApplicant.isPresent()) {
                    existApplicant.get().setApprovalStatusCode(ApprovalStatusCode.REQUEST);
                    spaceService.updateApplicantInfo(existApplicant.get(), userSession);
                } else {
                    SpaceApplicant spaceApplicant = spaceApplicantRequest.buildEntity(space.get());
                    spaceService.createSpaceApplicantInfo(spaceApplicant, userSession);
                }

                return new ResponseEntity(HttpStatus.CREATED);
            }
        }

        throw new ServiceException(HttpStatus.NOT_FOUND);
    }

    @Operation(description = "스페이스 참여 요청 취소")
    @DeleteMapping("/{spaceCode}/join")
    @DisableAuth
    public ResponseEntity deleteSpaceApplicantInfo(@PathVariable String spaceCode, @Valid @RequestBody SpaceApplicantRequest spaceApplicantRequest, @ApiIgnore UserSession userSession) {
        Optional<SpaceApplicant> spaceApplicant = spaceService.selectSpaceApplicantInfo(spaceCode, userSession.getId());

        if (spaceApplicant.isPresent()) {
            spaceService.deleteSpaceApplicantInfo(spaceApplicant.get());
            return new ResponseEntity(HttpStatus.OK);
        }

        throw new ServiceException(HttpStatus.NOT_FOUND);
    }

    @Operation(description = "스페이스 생성")
    @PostMapping("")
    @DisableAuth
    public UserAndSpaceResponse createSpaceInfo(@Valid @RequestBody SpaceRequest spaceRequest, @ApiIgnore UserSession userSession) {

        Optional<Space> alreadySpace = spaceService.selectSpaceInfo(spaceRequest.getCode());
        if (alreadySpace.isPresent()) {
            throw new ServiceException("space.duplicated");
        }

        Space space = spaceRequest.buildEntity();
        SpaceResponse spaceResponse = new SpaceResponse(spaceService.createSpaceInfo(space, userSession), userSession);
        List<Space> spaces = spaceService.selectUserActivatedSpaceList(userSession.getId());
        User user = userService.selectUser(userSession.getId());
        MyInfoResponse userResponse = new MyInfoResponse(user, spaces);
        UserAndSpaceResponse userAndSpaceResponse = UserAndSpaceResponse.builder().space(spaceResponse).user(userResponse).build();
        return userAndSpaceResponse;
    }

    @Operation(description = "스페이스 수정")
    @PutMapping("/{spaceCode}")
    public UserAndSpaceResponse updateSpaceInfo(@PathVariable String spaceCode, @Valid @RequestBody SpaceRequest spaceRequest, @ApiIgnore UserSession userSession) {

        if (!spaceCode.equals(spaceRequest.getCode())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Space alreadySpace = spaceService.selectByCode(spaceRequest.getId(), spaceRequest.getCode());
        if (alreadySpace != null) {
            throw new ServiceException("space.duplicated");
        }

        Space space = spaceRequest.buildEntity();
        SpaceResponse spaceResponse = new SpaceResponse(spaceService.updateSpaceInfo(space, userSession), userSession);
        List<Space> spaces = spaceService.selectUserActivatedSpaceList(userSession.getId());
        User user = userService.selectUser(userSession.getId());
        MyInfoResponse userResponse = new MyInfoResponse(user, spaces);
        UserAndSpaceResponse userAndSpaceResponse = UserAndSpaceResponse.builder().space(spaceResponse).user(userResponse).build();
        return userAndSpaceResponse;
    }

    @Operation(description = "스페이스 삭제")
    @DeleteMapping("/{spaceCode}")
    public UserAndSpaceResponse deleteSpaceInfo(@PathVariable String spaceCode, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfo(spaceCode).get();
        spaceService.deleteSpaceInfo(space);

        List<Space> spaces = spaceService.selectUserActivatedSpaceList(userSession.getId());
        User user = userService.selectUser(userSession.getId());
        MyInfoResponse userResponse = new MyInfoResponse(user, spaces);
        UserAndSpaceResponse userAndSpaceResponse = UserAndSpaceResponse.builder().user(userResponse).build();
        return userAndSpaceResponse;
    }


}
