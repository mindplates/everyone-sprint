package com.mindplates.everyonesprint.framework.aop;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.service.MeetingService;
import com.mindplates.everyonesprint.biz.meeting.vo.request.MeetingRequest;
import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.common.code.MeetingTypeCode;
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
public class MeetingAuthAspect {

    final private SprintService sprintService;
    final private MeetingService meetingService;
    final private HttpServletRequest request;

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.meeting.controller..create*(..))")
    private void createOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.meeting.controller..update*(..))")
    private void updateOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.meeting.controller..delete*(..))")
    private void deleteOperator() {
    }

    @Pointcut("execution(* com.mindplates.everyonesprint.biz.meeting.controller..select*(..))")
    private void selectOperator() {
    }

    @Pointcut("createOperator() || updateOperator() || deleteOperator()")
    private void cudOperator() {
    }

    @Before("!@annotation(com.mindplates.everyonesprint.framework.annotation.DisableMeetingAuth) && (cudOperator() || selectOperator()) && args(spaceCode, meetingCode, ..)")
    public void checkMeetAuth(JoinPoint joinPoint, String spaceCode, String meetingCode) throws Throwable {
        UserSession userSession = SessionUtil.getUserInfo(request);

        Meeting meeting = meetingService.selectMeetingInfo(meetingCode).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        if (meeting.getType().equals(MeetingTypeCode.SMALLTALK)) {
            if (meeting.getSprint().getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
                throw new ServiceException("common.not.authorized");
            }
        } else {
            if (meeting.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
                throw new ServiceException(HttpStatus.FORBIDDEN, "common.no.member");
            }
        }
    }

    @Before("!@annotation(com.mindplates.everyonesprint.framework.annotation.DisableMeetingAuth) && (cudOperator() || selectOperator()) && args(meetingId, ..) && !@annotation(com.mindplates.everyonesprint.framework.annotation.CheckSprintAuth)")
    public void checkMeetingAuth(JoinPoint joinPoint, Long meetingId) throws Throwable {
        UserSession userSession = SessionUtil.getUserInfo(request);

        Meeting meeting = meetingService.selectMeetingInfo(meetingId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (meeting.getSprint().getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
    }

    @Before("(cudOperator() || selectOperator()) && args(sprintId, ..) && @annotation(com.mindplates.everyonesprint.framework.annotation.CheckSprintAuth)")
    public void checkSprintAuth(JoinPoint joinPoint, Long sprintId) throws Throwable {
        UserSession userSession = SessionUtil.getUserInfo(request);

        if (sprintId != null) {
            Sprint sprint = sprintService.selectSprintInfo(sprintId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
            if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
                throw new ServiceException("common.not.authorized");
            }
        }

    }

    @Before("createOperator() && args(meetingReqeust, ..) && @annotation(com.mindplates.everyonesprint.framework.annotation.CheckSprintAuth)")
    public void checkSprintAuth(JoinPoint joinPoint, MeetingRequest meetingReqeust) throws Throwable {
        UserSession userSession = SessionUtil.getUserInfo(request);

        Sprint sprint = sprintService.selectSprintInfo(meetingReqeust.getSprintId()).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        if (sprint.getUsers().stream().noneMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }


    }


}
