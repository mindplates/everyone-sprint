package com.mindplates.everyonesprint.biz.user.controller;

import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.service.SpaceService;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.biz.user.vo.request.ChangePasswordRequest;
import com.mindplates.everyonesprint.biz.user.vo.request.LoginRequest;
import com.mindplates.everyonesprint.biz.user.vo.request.UserRequest;
import com.mindplates.everyonesprint.biz.user.vo.response.MyInfoResponse;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.annotation.DisableLogin;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    final private UserService userService;
    final private SessionUtil sessionUtil;
    final private SpaceService spaceService;

    @Operation(description = "사용자 추가")
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
        List<Space> spaces = spaceService.selectUserActivatedSpaceList(sessionUtil.getUserId(request));

        return new MyInfoResponse(result, spaces);
    }

    @Operation(description = "내 정보 변경")
    @PutMapping("/my-info")
    public MyInfoResponse updateUser(@Valid @RequestBody UserRequest userRequest, HttpServletRequest request, HttpServletResponse response, UserSession userSession) {

        User user = userService.selectUser(userSession.getId());
        if (user == null) {
            throw new ServiceException("BAD_REQUEST");
        }

        User userInfo = userRequest.merge(user);
        User result = userService.updateUser(userInfo);
        List<Space> spaces = spaceService.selectUserActivatedSpaceList(sessionUtil.getUserId(request));

        return new MyInfoResponse(result, spaces);
    }

    @Operation(description = "내 비밀번호 변경")
    @PutMapping("/my-info/password")
    public ResponseEntity<?> updateUserPassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest, HttpServletRequest request, HttpServletResponse response, UserSession userSession) {

        User user = userService.selectUser(userSession.getId());

        if (!changePasswordRequest.getChangePassword1().equals(changePasswordRequest.getChangePassword2())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST, "common.password.not.equal");
        }

        if (userService.isValidPassword(user, changePasswordRequest.getCurrentPassword())) {
            User userInfo = changePasswordRequest.merge(user);
            userService.updatePassword(userInfo);
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            throw new ServiceException("common.password.not.correct");
        }
    }

    @Operation(description = "내 정보 조회")
    @DisableLogin
    @GetMapping("/my-info")
    public MyInfoResponse selectMyInfo(UserSession userSession) {

        if (userSession != null) {
            User user = userService.selectUser(userSession.getId());
            List<Space> spaces = spaceService.selectUserActivatedSpaceList(userSession.getId());
            return new MyInfoResponse(user, spaces);
        } else {
            return new MyInfoResponse();
        }
    }

    @Operation(description = "내 언어 변경")
    @PutMapping("/my-info/language")
    public ResponseEntity<?> updateUserLanguage(@Valid @RequestBody UserRequest userRequest, UserSession userSession) {
        userService.updateUserLanguage(userSession.getId(), userRequest.getLanguage());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "내 지역 변경")
    @PutMapping("/my-info/country")
    public ResponseEntity<?> updateUserCountry(@Valid @RequestBody UserRequest userRequest, UserSession userSession) {
        userService.updateUserCountry(userSession.getId(), userRequest.getCountry());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "로그인")
    @DisableLogin
    @PostMapping("/login")
    public MyInfoResponse login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {

        User user = userService.login(loginRequest.getEmail(), loginRequest.getPassword(), loginRequest.getAutoLogin());
        if (user == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST, "common.login.fail");
        }

        sessionUtil.login(request, user);
        List<Space> spaces = spaceService.selectUserActivatedSpaceList(user.getId());
        return new MyInfoResponse(user, spaces);
    }

    @Operation(description = "로그아웃")
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
