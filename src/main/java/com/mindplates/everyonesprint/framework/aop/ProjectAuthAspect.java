package com.mindplates.everyonesprint.framework.aop;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.biz.project.service.ProjectService;
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
public class ProjectAuthAspect {

    final private SpaceService spaceService;

    final private ProjectService projectService;

    private HttpServletRequest request;


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

    private void checkIsSpaceMember(String spaceCode) throws Throwable {
        UserSession userSession = SessionUtil.getUserInfo(request);
        Space space = spaceService.selectSpaceInfo(spaceCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (space.getUsers().stream().noneMatch(spaceUser -> spaceUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    private void checkIsProjectMember(String spaceCode, Long projectId, RoleCode roleCode) throws Throwable {
        UserSession userSession = SessionUtil.getUserInfo(request);
        Project project = projectService.selectProjectInfo(spaceCode, projectId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (project.getUsers().stream().noneMatch(projectUser -> projectUser.getUser().getId().equals(userSession.getId()) && (roleCode == null || (roleCode != null && projectUser.getRole().equals(roleCode))))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @Before("(createOperator() || selectOperator()) && args(spaceCode, ..)")
    public void checkIsSpaceMember(JoinPoint joinPoint, String spaceCode) throws Throwable {
        this.checkIsSpaceMember(spaceCode);
    }

    @Before("udOperator() && args(spaceCode, projectId, ..)")
    public void checkIsProjectAdminUser(JoinPoint joinPoint, String spaceCode, long projectId) throws Throwable {
        this.checkIsSpaceMember(spaceCode);
        this.checkIsProjectMember(spaceCode, projectId, RoleCode.ADMIN);
    }

    @Before("selectOperator() && args(spaceCode, projectId, ..)")
    public void checkIsProjectUser(JoinPoint joinPoint, String spaceCode, long projectId) throws Throwable {
        this.checkIsSpaceMember(spaceCode);
        this.checkIsProjectMember(spaceCode, projectId, null);
    }
}
