package com.mindplates.everyonesprint.framework.aop;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

@Aspect
@Component
public class SprintAuthAspect {

    final private SprintService sprintService;

    @Autowired
    private HttpServletRequest request;

    public SprintAuthAspect(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.sprint.controller..create*(..))")
    private void createOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.sprint.controller..update*(..))")
    private void updateOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.sprint.controller..delete*(..))")
    private void deleteOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.sprint.controller..select*(..))")
    private void selectOperator() {
    }

    @Pointcut("createOperator() || updateOperator() || deleteOperator()")
    private void cudOperator() {
    }

    @Before("cudOperator() && args(sprintId, ..)")
    public void checkIsSprintAdminUser(JoinPoint joinPoint, long sprintId) throws Throwable {
        UserSession userSession = SessionUtil.getUserInfo(request);
        Sprint sprint = sprintService.selectSprintInfo(sprintId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()) && sprintUser.getRole().equals(RoleCode.ADMIN))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @Before("selectOperator() && args(sprintId, ..)")
    public void checkIsSprintUser(JoinPoint joinPoint, long sprintId) throws Throwable {

        UserSession userSession = SessionUtil.getUserInfo(request);

        Sprint sprint = sprintService.selectSprintInfo(sprintId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
    }
}
