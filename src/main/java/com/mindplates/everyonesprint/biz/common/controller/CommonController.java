package com.mindplates.everyonesprint.biz.common.controller;

import com.mindplates.everyonesprint.biz.common.vo.response.SystemInfo;
import com.mindplates.everyonesprint.framework.annotation.DisableLogin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/common")
public class CommonController {

    @Autowired
    private BuildProperties buildProperties;

    @DisableLogin
    @GetMapping("/system/info")
    public SystemInfo selectSystemInfo() {
        return SystemInfo.builder().version(buildProperties.getVersion()).build();
    }


}
