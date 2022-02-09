package com.mindplates.everyonesprint.biz.user.controller;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.biz.user.vo.request.LoginRequest;
import com.mindplates.everyonesprint.biz.user.vo.request.UserRequest;
import com.mindplates.everyonesprint.biz.user.vo.response.MyInfoResponse;
import com.mindplates.everyonesprint.biz.user.vo.response.UserResponse;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.annotation.DisableLogin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserController {

    final private UserService userService;
    final private SessionUtil sessionUtil;

    public UserController(UserService userService, SessionUtil sessionUtil) {
        this.userService = userService;
        this.sessionUtil = sessionUtil;
    }

    @DisableLogin
    @PostMapping("")
    public MyInfoResponse createUser(@Valid @RequestBody UserRequest userRequest, HttpServletRequest request, HttpServletResponse response) {

        User alreadyRegisteredEmailUser = userService.selectUserByEmail(userRequest.getEmail());
        if (alreadyRegisteredEmailUser != null) {
            throw new ServiceException("user.duplicated");
        }

        User user = userRequest.buildEntity();
        User result = userService.createUser(user);
        sessionUtil.login(request, result);

        return new MyInfoResponse(result);
    }

    @DisableLogin
    @GetMapping("/my-info")
    public MyInfoResponse selectMyInfo(UserSession userSession) {

        if (userSession != null) {
            User user = userService.selectUser(userSession.getId());
            return new MyInfoResponse(user);
        } else {
            return new MyInfoResponse();
        }
    }

    @PutMapping("/my-info/language")
    public ResponseEntity updateUserLanguage(@Valid @RequestBody UserRequest userRequest, UserSession userSession) {
        userService.updateUserLanguage(userSession.getId(), userRequest.getLanguage());
        return new ResponseEntity(HttpStatus.OK);
    }

    @PutMapping("/my-info/country")
    public ResponseEntity updateUserCountry(@Valid @RequestBody UserRequest userRequest, UserSession userSession) {
        userService.updateUserCountry(userSession.getId(), userRequest.getCountry());
        return new ResponseEntity(HttpStatus.OK);
    }

    @DisableLogin
    @PostMapping("/login")
    public MyInfoResponse login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {

        User user = userService.login(loginRequest.getEmail(), loginRequest.getPassword(), loginRequest.getAutoLogin());
        if (user == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST, "common.login.fail");
        }

        sessionUtil.login(request, user);
        return new MyInfoResponse(user);

    }

    @DisableLogin
    @DeleteMapping("/logout")
    public void logout(HttpServletRequest request) {

        if (sessionUtil.isLogin(request)) {
            Long userId = sessionUtil.getUserId(request);
            User user = userService.selectUser(userId);
            user.setAutoLogin(false);
            user.setLoginToken(null);
            userService.updateUser(user);
        }

        sessionUtil.logout(request);
    }

    @GetMapping("")
    public List<UserResponse> selectUsers(@RequestParam("word") String word) {
        List<User> users = userService.selectUserList(word + "%", word + "%");
        return users.stream().map(UserResponse::new).collect(Collectors.toList());
    }

}
