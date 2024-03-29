package com.mindplates.everyonesprint.biz.park.controller;

import com.mindplates.everyonesprint.biz.park.redis.Walker;
import com.mindplates.everyonesprint.biz.park.service.WalkerService;
import com.mindplates.everyonesprint.framework.annotation.DisableLogin;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/park/walkers")
@AllArgsConstructor
public class WalkerController {

    final private WalkerService walkerService;

    @DisableLogin
    @GetMapping("/all")
    public Iterable<Walker> selectMyInfo() {
        return walkerService.findAll();
    }


}
