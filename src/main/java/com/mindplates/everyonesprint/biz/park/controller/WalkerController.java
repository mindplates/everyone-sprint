package com.mindplates.everyonesprint.biz.park.controller;

import com.mindplates.everyonesprint.biz.park.redis.Walker;
import com.mindplates.everyonesprint.biz.park.service.WalkerService;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.framework.annotation.DisableLogin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/park/walkers")
public class WalkerController {
    @Autowired
    WalkerService walkerService;

    @Autowired
    SessionUtil sessionUtil;

    @DisableLogin
    @GetMapping("/all")
    public Iterable<Walker> selectMyInfo() {
        Iterable<Walker> all = walkerService.findAll();
        return all;
    }


}
