package com.mindplates.everyonesprint.framework.interceptor;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.framework.annotation.DisableLogin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
public class LoginCheckInterceptor extends HandlerInterceptorAdapter {

    private final SessionUtil sessionUtil;

    private final MessageSourceAccessor messageSourceAccessor;

    private final String activeProfile;

    private final UserService userService;

    public LoginCheckInterceptor(UserService userService, SessionUtil sessionUtil, MessageSourceAccessor messageSourceAccessor, String activeProfile) {
        this.userService = userService;
        this.sessionUtil = sessionUtil;
        this.messageSourceAccessor = messageSourceAccessor;
        this.activeProfile = activeProfile;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        if (!sessionUtil.isLogin(request)) {
            String token = request.getHeader("Token");
            if (token != null) {
                User user = userService.selectUserByLoginToken(token);
                if (user != null) {
                    sessionUtil.login(request, user);
                }
            }
        }

        DisableLogin disableLogin = null;

        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        if (handler instanceof HandlerMethod) {
            disableLogin = ((HandlerMethod) handler).getMethodAnnotation(DisableLogin.class);
        }

        if (disableLogin != null) {
            return true;
        }

        if (!sessionUtil.isLogin(request)) {
            throw new ServiceException("user.session.expired");
        }

        return true;
    }

}
