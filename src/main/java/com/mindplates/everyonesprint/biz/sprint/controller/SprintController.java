package com.mindplates.everyonesprint.biz.sprint.controller;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.biz.sprint.service.SprintService;
import com.mindplates.everyonesprint.biz.sprint.vo.request.SprintRequest;
import com.mindplates.everyonesprint.biz.sprint.vo.response.SprintListResponse;
import com.mindplates.everyonesprint.biz.sprint.vo.response.SprintResponse;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/sprints")
public class SprintController {
    @Autowired
    SprintService sprintService;

    @Autowired
    SessionUtil sessionUtil;

    @PostMapping("")
    public SprintResponse createSprint(@Valid @RequestBody SprintRequest sprintRequest, UserSession userSession) {

        Sprint alreadySprint = sprintService.selectByName(sprintRequest.getName());
        if (alreadySprint != null) {
            throw new ServiceException("sprint.duplicated");
        }

        Sprint sprint = sprintRequest.buildEntity();
        sprintService.createSprint(sprint, userSession);

        return new SprintResponse(sprint);
    }

    @GetMapping("")
    public List<SprintListResponse> selectUserSprintList(UserSession userSession) {
        List<Sprint> sprints = sprintService.selectUserSprintList(userSession);
        return sprints.stream().map(sprint -> new SprintListResponse(sprint)).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public SprintResponse selectSprintInfo(@PathVariable Long id, UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(id);
        if (!sprint.getUsers().stream().anyMatch(sprintUser -> sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
        return new SprintResponse(sprint);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteSprintInfo(@PathVariable Long id, UserSession userSession) {
        Sprint sprint = sprintService.selectSprintInfo(id);
        if (!sprint.getUsers().stream().anyMatch(sprintUser -> sprintUser.getRole().equals(RoleCode.ADMIN) && sprintUser.getUser().getId().equals(userSession.getId()))) {
            throw new ServiceException("common.not.authorized");
        }
        sprintService.deleteSprintInfo(id);
        return new ResponseEntity(HttpStatus.OK);
    }


}
