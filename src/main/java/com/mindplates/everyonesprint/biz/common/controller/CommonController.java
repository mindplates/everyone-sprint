package com.mindplates.everyonesprint.biz.common.controller;

import com.mindplates.everyonesprint.biz.common.vo.response.StatsInfoResponse;
import com.mindplates.everyonesprint.biz.common.vo.response.SystemInfo;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.framework.annotation.DisableLogin;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import org.springframework.boot.info.BuildProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/common")
@AllArgsConstructor
public class CommonController {

    final private BuildProperties buildProperties;
    final private SprintService sprintService;
    final private MeetingService meetingService;
    final private UserService userService;
    final private ProjectService projectService;

    @DisableLogin
    @GetMapping("/system/info")
    @Operation(summary = "API 버전 조회", description = "API 버전 조회")
    public SystemInfo selectSystemInfo() {
        return SystemInfo.builder().version(buildProperties.getVersion()).name(buildProperties.getName()).build();
    }

    @DisableLogin
    @GetMapping("/stats")
    @Operation(summary = "주요 데이터의 통계", description = "주요 데이터의 통계")
    public StatsInfoResponse selectStatsInfo() {
        return StatsInfoResponse.builder()
                .sprintCount(sprintService.selectAllSprintCount())
                .meetingCount(meetingService.selectAllMeetingCount())
                .userCount(userService.selectAllUserCount())
                .projectCount(projectService.selectAllProjectCount())
                .build();
    }

    @DisableLogin
    @GetMapping("/error")
    @Operation(summary = "에러 로깅 테스트", description = "에러 로깅 테스트")
    public StatsInfoResponse selectError() {
        Space space = Space.builder().build();
        if (space.getCode().equals("ERROR")) {
            //
        }

        return StatsInfoResponse.builder()
                .sprintCount(sprintService.selectAllSprintCount())
                .meetingCount(meetingService.selectAllMeetingCount())
                .userCount(userService.selectAllUserCount())
                .projectCount(projectService.selectAllProjectCount())
                .build();
    }


}
