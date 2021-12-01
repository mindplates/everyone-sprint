package com.mindplates.everyonesprint.biz.user.controller;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.biz.user.vo.request.LoginRequest;
import com.mindplates.everyonesprint.biz.user.vo.request.UserRequest;
import com.mindplates.everyonesprint.biz.user.vo.response.MyInfoResponse;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.annotation.DisableLogin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.security.NoSuchAlgorithmException;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserService userService;

    @Autowired
    SessionUtil sessionUtil;

    @DisableLogin
    @PostMapping("")
    public MyInfoResponse createUser(@Valid @RequestBody UserRequest userRequest, HttpServletRequest request, HttpServletResponse response) {

        User alreadyRegisteredEmailUser = userService.selectUserByEmail(userRequest.getEmail());
        if (alreadyRegisteredEmailUser != null) {
            throw new ServiceException("", "user.duplicated");
        }

        User user = userRequest.buildEntity();
        userService.createUser(user);
        sessionUtil.login(request, user);

        return new MyInfoResponse(user);
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

    @DisableLogin
    @PostMapping("/login")
    public MyInfoResponse login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) throws NoSuchAlgorithmException {

        User user = userService.login(loginRequest.getEmail(), loginRequest.getPassword(), loginRequest.getAutoLogin());
        if (user != null) {
            sessionUtil.login(request, user);
        }

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

}
