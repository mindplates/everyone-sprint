package com.mindplates.everyonesprint.common.util;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Component
public class SessionUtil {

    @Value("${everyone_sprint.locale.default}")
    private String defaultLanguage;

    public SessionUtil() {

    }

    public static UserSession getUserInfo(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            return (UserSession) session.getAttribute("userSession");
        } else {
            return null;
        }

    }

    public static UserSession getUserInfo(SimpMessageHeaderAccessor headerAccessor) {

        Map<String, Object> attributes = headerAccessor.getSessionAttributes();

        if (attributes == null) {
            throw new ServiceException("session.error.expired");
        }

        return (UserSession) attributes.get("USER_INFO");

    }

    public static String getUserIP(SimpMessageHeaderAccessor headerAccessor) {

        Map<String, Object> attributes = headerAccessor.getSessionAttributes();
        if (attributes != null) {
            return (String) attributes.get("USER_IP");
        }

        return "";
    }

    public static Long getUserId(SimpMessageHeaderAccessor headerAccessor) {

        Map<String, Object> attributes = headerAccessor.getSessionAttributes();

        if (attributes == null) {
            throw new ServiceException("session.error.expired");
        }

        UserSession userInfo = (UserSession) attributes.get("USER_INFO");

        if (userInfo != null) {
            return userInfo.getId();
        }

        return null;

    }

    public Long getUserId(HttpServletRequest request) {
        Long id = null;
        HttpSession session = request.getSession(false);
        if (session != null) {
            UserSession userSession = (UserSession) session.getAttribute("userSession");
            if (userSession != null) {
                id = userSession.getId();
            }
        }

        return id;
    }

    public boolean isLogin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            return Optional.ofNullable((UserSession) session.getAttribute("userSession")).isPresent();

        } else {
            return false;
        }
    }

    public boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            UserSession userSession = (UserSession) session.getAttribute("userSession");
            return userSession.getRoleCode() == RoleCode.SUPER_MAN;
        }

        return false;
    }


    public void login(HttpServletRequest request, User user) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        session = request.getSession(true);

        UserSession info = UserSession.builder()
                .id(user.getId())
                .alias(user.getAlias())
                .name(user.getName())
                .isNameOpened(user.getIsNameOpened())
                .email(user.getEmail())
                .roleCode(user.getActiveRoleCode())
                .locale(new Locale(user.getLanguage(), user.getCountry()))
                .build();

        session.setAttribute("userSession", info);

    }

    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

    }

}
