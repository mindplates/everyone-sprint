package com.mindplates.everyonesprint.biz.user.controller;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.biz.user.vo.response.UserResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/{spaceCode}/users")
@AllArgsConstructor
public class SpaceUserController {

    final private UserService userService;

    @GetMapping("")
    public List<UserResponse> selectUsers(@PathVariable String spaceCode, @RequestParam("word") String word) {
        List<User> users = userService.selectSpaceUserList(spaceCode, word + "%", word + "%");
        return users.stream().map(UserResponse::new).collect(Collectors.toList());
    }

}
