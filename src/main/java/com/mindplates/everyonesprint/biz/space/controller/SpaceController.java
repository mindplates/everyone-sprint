package com.mindplates.everyonesprint.biz.space.controller;

import com.mindplates.everyonesprint.biz.space.entity.Space;
import com.mindplates.everyonesprint.biz.space.service.SpaceService;
import com.mindplates.everyonesprint.biz.space.vo.request.SpaceRequest;
import com.mindplates.everyonesprint.biz.space.vo.response.SpaceListResponse;
import com.mindplates.everyonesprint.biz.space.vo.response.SpaceResponse;
import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.UserSession;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/spaces")
public class SpaceController {

    final private SpaceService spaceService;

    public SpaceController(SpaceService spaceService) {
        this.spaceService = spaceService;
    }

    @Operation(description = "스페이스 목록 조회")
    @GetMapping("")
    public List<SpaceListResponse> selectUserSpaceList(@RequestParam("type") String type, @RequestParam("text") String text, @ApiIgnore UserSession userSession) {
        List<Space> spaces;
        if ("my".equals(type)) {
            spaces = spaceService.selectUserSpaceList(userSession, text);
        } else {
            spaces = spaceService.selectSpaceList(text);
        }

        return spaces.stream().map((space -> new SpaceListResponse(space, userSession))).collect(Collectors.toList());
    }

    @Operation(description = "스페이스 생성")
    @PostMapping("")
    public SpaceResponse createSpaceInfo(@Valid @RequestBody SpaceRequest spaceRequest, @ApiIgnore UserSession userSession) {

        Space alreadySpace = spaceService.selectByCode(spaceRequest.getCode());
        if (alreadySpace != null) {
            throw new ServiceException("space.duplicated");
        }

        Space space = spaceRequest.buildEntity();
        return new SpaceResponse(spaceService.createSpaceInfo(space, userSession), userSession);
    }

    @Operation(description = "스페이스 수정")
    @PutMapping("/{id}")
    public SpaceResponse updateSpaceInfo(@PathVariable Long id, @Valid @RequestBody SpaceRequest spaceRequest, @ApiIgnore UserSession userSession) {

        if (!id.equals(spaceRequest.getId())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST);
        }

        Space alreadySpace = spaceService.selectByCode(spaceRequest.getId(), spaceRequest.getCode());
        if (alreadySpace != null) {
            throw new ServiceException("space.duplicated");
        }

        Space spaceInfo = spaceRequest.buildEntity();
        return new SpaceResponse(spaceService.updateSpaceInfo(spaceInfo, userSession), userSession);
    }

    @Operation(description = "스페이스 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteSpaceInfo(@PathVariable Long id) {
        Space space = spaceService.selectSpaceInfo(id).get();
        spaceService.deleteSpaceInfo(space);
        return new ResponseEntity(HttpStatus.OK);
    }


    @Operation(description = "스페이스 조회")
    @GetMapping("/{id}")
    public SpaceResponse selectSpaceInfo(@PathVariable Long id, @ApiIgnore UserSession userSession) {
        Space space = spaceService.selectSpaceInfo(id).get();
        return new SpaceResponse(space, userSession);
    }


}
