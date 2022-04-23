package com.mindplates.everyonesprint.framework.aop;

import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.service.SpaceService;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.AllArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

@Aspect
@Component
@AllArgsConstructor
public class SpaceAuthAspect {

    final private SpaceService spaceService;

    final private HttpServletRequest request;

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.space.controller..create*(..))")
    private void createOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.space.controller..update*(..))")
    private void updateOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.space.controller..delete*(..))")
    private void deleteOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.space.controller..select*(..))")
    private void selectOperator() {
    }

    @Pointcut("createOperator() || updateOperator() || deleteOperator()")
    private void cudOperator() {
    }

    @Before("!@annotation(com.mindplates.everyonesprint.framework.annotation.DisableAuth) && cudOperator() && args(spaceCode, ..)")
    public void checkIsSpaceAdminUser(JoinPoint joinPoint, String spaceCode) throws Throwable {

        UserSession userSession = SessionUtil.getUserInfo(request);
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (space.getUsers().stream().noneMatch(spaceUser -> spaceUser.getUser().getId().equals(userSession.getId()) && spaceUser.getRole().equals(RoleCode.ADMIN))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @Before("!@annotation(com.mindplates.everyonesprint.framework.annotation.DisableAuth) && selectOperator() && args(spaceCode, ..)")
    public void checkIsSpaceUser(JoinPoint joinPoint, String spaceCode) throws Throwable {
        UserSession userSession = SessionUtil.getUserInfo(request);
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (space.getUsers().stream().noneMatch(spaceUser -> spaceUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
    }
}
