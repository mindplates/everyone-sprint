package com.mindplates.everyonesprint.common.util;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Locale;
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

    public static Long getUserId(HttpServletRequest request) {
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
            return Optional.<UserSession>ofNullable((UserSession) session.getAttribute("userSession")).isPresent();

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
        this.login(request, user, true);
    }

    public void login(HttpServletRequest request, User user, Boolean register) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        session = request.getSession(true);

        UserSession info = UserSession.builder()
                .id(user.getId())
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
