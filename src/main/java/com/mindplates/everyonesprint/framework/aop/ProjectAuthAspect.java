package com.mindplates.everyonesprint.framework.aop;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ProjectAuthAspect {

    final private ProjectService projectService;

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

    @Pointcut("createOperator() || updateOperator() || deleteOperator()")
    private void cudOperator() {
    }

    @Before("cudOperator() && args(projectId, .., userSession)")
    public void checkIsProjectAdminUser(JoinPoint joinPoint, long projectId, UserSession userSession) throws Throwable {

        Project project = projectService.selectProjectInfo(projectId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (project.getUsers().stream().noneMatch(projectUser -> projectUser.getUser().getId().equals(userSession.getId()) && projectUser.getRole().equals(RoleCode.ADMIN))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @Before("selectOperator() && args(projectId, .., userSession)")
    public void checkUserHasReadRoleAboutTopic(JoinPoint joinPoint, long projectId, UserSession userSession) throws Throwable {
        Project project = projectService.selectProjectInfo(projectId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (project.getUsers().stream().noneMatch(projectUser -> projectUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
    }
}
