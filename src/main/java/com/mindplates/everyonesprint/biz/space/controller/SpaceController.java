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
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
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
@RequestMapping("/api/spaces")
@AllArgsConstructor
public class SpaceController {

    final private SpaceService spaceService;
    final private SprintService sprintService;
    final private MeetingService meetingService;
    final private ProjectService projectService;
    final private UserService userService;

    @Operation(description = "스페이스 생성")
    @PostMapping("")
    @DisableAuth
    public ResponseEntity<?> createSpaceInfo(@Valid @RequestBody SpaceRequest spaceRequest, @ApiIgnore UserSession userSession) {

        Optional<Space> alreadySpace = spaceService.selectSpaceInfo(spaceRequest.getCode());
        if (alreadySpace.isPresent()) {
            throw new ServiceException("space.duplicated");
        }

        Space space = spaceRequest.buildEntity();
        spaceService.createSpaceInfo(space, userSession);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "스페이스 수정")
    @PutMapping("/{spaceCode}")
    public ResponseEntity<?> updateSpaceInfo(@PathVariable String spaceCode, @Valid @RequestBody SpaceRequest spaceRequest, @ApiIgnore UserSession userSession) {

        if (!spaceCode.equals(spaceRequest.getCode())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Space alreadySpace = spaceService.selectByCode(spaceRequest.getId(), spaceRequest.getCode());
        if (alreadySpace != null) {
            throw new ServiceException("space.duplicated");
        }

        Space space = spaceRequest.buildEntity();
        spaceService.updateSpaceInfo(space, userSession);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "스페이스 삭제")
    @DeleteMapping("/{spaceCode}")
    public ResponseEntity<?> deleteSpaceInfo(@PathVariable String spaceCode, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        spaceService.deleteSpaceInfo(space);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "사용자 스페이스 나가기")
    @PutMapping("/{spaceCode}/exit")
    @DisableAuth
    public ResponseEntity<?> updateUserSpaceExit(@PathVariable String spaceCode, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        spaceService.updateUserSpaceExit(space, userSession);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(summary = "스페이스 데이터의 통계", description = "주요 데이터의 통계")
    @GetMapping("/{spaceCode}/stats")
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
    @DisableAuth
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
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        boolean isMember = spaceService.selectIsSpaceMember(spaceCode, userSession);
        if (isMember) {
            return new SpaceResponse(space, userSession);
        } else if (!space.getActivated()) {
            throw new ServiceException(HttpStatus.LOCKED);
        } else if (!space.getAllowSearch()) {
            throw new ServiceException(HttpStatus.LOCKED);
        } else {
            SpaceResponse response = new SpaceResponse(space, userSession);
            response.setUserApplicantStatus(new SpaceApplicantResponse(spaceService.selectSpaceApplicantInfo(spaceCode, userSession.getId()).orElse(null)));
            response.getUsers().clear();
            return response;
        }
    }

    @Operation(description = "스페이스 참여 승인/거절")
    @PutMapping("/{spaceCode}/applicants/{applicantId}/{operation}")
    public ResponseEntity<?> updateSpaceApplicantInfo(@PathVariable String spaceCode, @PathVariable Long applicantId, @PathVariable String operation, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        SpaceApplicant spaceApplicant = spaceService.selectSpaceApplicantInfo(applicantId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (!spaceApplicant.getApprovalStatusCode().equals(ApprovalStatusCode.REQUEST)) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        if (!spaceApplicant.getSpace().getId().equals(space.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        if ("reject".equals(operation)) {
            spaceService.updateApplicantReject(spaceCode, spaceApplicant, userSession);
        } else if ("approve".equals(operation)) {
            spaceService.updateApplicantApprove(spaceCode, spaceApplicant, userSession);
        } else {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "스페이스 참여 요청")
    @PostMapping("/{spaceCode}/join")
    @DisableAuth
    public ResponseEntity<?> createSpaceApplicantInfo(@PathVariable String spaceCode, @RequestParam(value = "token", required = false) String token, @Valid @RequestBody SpaceApplicantRequest spaceApplicantRequest, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));


        boolean isMember = spaceService.selectIsSpaceMember(spaceCode, userSession);
        if (isMember) {
            throw new ServiceException(HttpStatus.BAD_REQUEST, "space.already.member");
        } else if (!space.getActivated()) {
            throw new ServiceException(HttpStatus.LOCKED);
        } else if (!space.getAllowSearch()) {
            // 검색이 금지된 경우, 토큰 값이 일치하는 경우에만, 가입 또는 가입 요청 정보 입력
            if (token != null && token.length() > 1) {
                Space tokenSpace = spaceService.selectSpaceInfoByToken(token).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
                if (tokenSpace.getCode().equals(space.getCode())) {
                    if (tokenSpace.getAllowAutoJoin()) {
                        SpaceUser spaceUser = SpaceUser.builder()
                                .user(User.builder().id(spaceApplicantRequest.getUserId()).build())
                                .role(RoleCode.MEMBER)
                                .space(space)
                                .build();
                        spaceService.createSpaceUserInfo(spaceCode, spaceUser, userSession);
                        return new ResponseEntity<>(HttpStatus.OK);
                    } else {
                        Optional<SpaceApplicant> existApplicant = spaceService.selectSpaceApplicantInfo(spaceCode, spaceApplicantRequest.getUserId());
                        if (existApplicant.isPresent()) {
                            existApplicant.get().setApprovalStatusCode(ApprovalStatusCode.REQUEST);
                            spaceService.updateApplicantInfo(spaceCode, existApplicant.get(), userSession);
                        } else {
                            SpaceApplicant spaceApplicant = spaceApplicantRequest.buildEntity(space);
                            spaceService.createSpaceApplicantInfo(spaceCode, spaceApplicant, userSession);
                        }
                        return new ResponseEntity<>(HttpStatus.CREATED);
                    }
                }
            }
            throw new ServiceException(HttpStatus.LOCKED);
        } else if (space.getAllowAutoJoin()) {
            SpaceUser spaceUser = SpaceUser.builder()
                    .user(User.builder().id(spaceApplicantRequest.getUserId()).build())
                    .role(RoleCode.MEMBER)
                    .space(space)
                    .build();
            spaceService.createSpaceUserInfo(spaceCode, spaceUser, userSession);
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            Optional<SpaceApplicant> existApplicant = spaceService.selectSpaceApplicantInfo(spaceCode, spaceApplicantRequest.getUserId());
            if (existApplicant.isPresent()) {
                existApplicant.get().setApprovalStatusCode(ApprovalStatusCode.REQUEST);
                spaceService.updateApplicantInfo(spaceCode, existApplicant.get(), userSession);
            } else {
                SpaceApplicant spaceApplicant = spaceApplicantRequest.buildEntity(space);
                spaceService.createSpaceApplicantInfo(spaceCode, spaceApplicant, userSession);
            }

            return new ResponseEntity<>(HttpStatus.CREATED);
        }
    }

    @Operation(description = "스페이스 참여 요청 취소")
    @DeleteMapping("/{spaceCode}/join")
    @DisableAuth
    public ResponseEntity<?> deleteSpaceApplicantInfo(@PathVariable String
                                                              spaceCode, @Valid @RequestBody SpaceApplicantRequest spaceApplicantRequest, @ApiIgnore UserSession userSession) {
        SpaceApplicant spaceApplicant = spaceService.selectSpaceApplicantInfo(spaceCode, userSession.getId()).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        spaceService.deleteSpaceApplicantInfo(spaceCode, spaceApplicant);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "스페이스 토큰 조회")
    @GetMapping("/token")
    @DisableAuth
    public String selectToken(@ApiIgnore UserSession userSession) {
        return spaceService.getSpaceUniqueToken();
    }

    @Operation(description = "토큰으로 스페이스 조회")
    @GetMapping("/token/{token}")
    @DisableAuth
    public SpaceResponse selectSpaceInfoByToken(@PathVariable String token, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfoByToken(token).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        boolean isMember = spaceService.selectIsSpaceMember(space.getCode(), userSession);
        if (isMember) {
            return new SpaceResponse(space, userSession);
        } else if (!space.getActivated()) {
            throw new ServiceException(HttpStatus.LOCKED);
        } else {
            SpaceResponse response = new SpaceResponse(space, userSession);
            response.setUserApplicantStatus(new SpaceApplicantResponse(spaceService.selectSpaceApplicantInfo(space.getCode(), userSession.getId()).orElse(null)));
            response.getUsers().clear();
            return response;
        }
    }


}
