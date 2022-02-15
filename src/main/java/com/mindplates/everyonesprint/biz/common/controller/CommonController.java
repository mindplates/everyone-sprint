package com.mindplates.everyonesprint.biz.common.controller;

import com.mindplates.everyonesprint.biz.common.vo.response.StatsInfoResponse;
import com.mindplates.everyonesprint.biz.common.vo.response.SystemInfo;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.framework.annotation.DisableLogin;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.boot.info.BuildProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/common")
public class CommonController {

    final private BuildProperties buildProperties;
    final private SprintService sprintService;
    final private MeetingService meetingService;
    final private UserService userService;

    public CommonController(BuildProperties buildProperties, SprintService sprintService, MeetingService meetingService, UserService userService) {
        this.buildProperties = buildProperties;
        this.sprintService = sprintService;
        this.meetingService = meetingService;
        this.userService = userService;
    }

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
                .build();
    }


}
