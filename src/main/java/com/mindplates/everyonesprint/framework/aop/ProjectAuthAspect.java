package com.mindplates.everyonesprint.framework.aop;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
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
public class ProjectAuthAspect {

    final private ProjectService projectService;

    @Autowired
    private HttpServletRequest request;

    public ProjectAuthAspect(ProjectService projectService) {
        this.projectService = projectService;
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.project.controller..create*(..))")
    private void createOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.project.controller..update*(..))")
    private void updateOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.project.controller..delete*(..))")
    private void deleteOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.project.controller..select*(..))")
    private void selectOperator() {
    }

    @Pointcut("updateOperator() || deleteOperator()")
    private void udOperator() {
    }

    // TODO 프로젝트 생성 시 스페이스 멤버인지 확인

    @Before("udOperator() && args(projectId, ..)")
    public void checkIsProjectAdminUser(JoinPoint joinPoint, long projectId) throws Throwable {

        UserSession userSession = SessionUtil.getUserInfo(request);
        Project project = projectService.selectProjectInfo(projectId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (project.getUsers().stream().noneMatch(projectUser -> projectUser.getUser().getId().equals(userSession.getId()) && projectUser.getRole().equals(RoleCode.ADMIN))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @Before("selectOperator() && args(projectId, ..)")
    public void checkIsProjectUser(JoinPoint joinPoint, long projectId) throws Throwable {
        UserSession userSession = SessionUtil.getUserInfo(request);
        Project project = projectService.selectProjectInfo(projectId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (project.getUsers().stream().noneMatch(projectUser -> projectUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
    }
}
