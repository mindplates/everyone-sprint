package com.mindplates.everyonesprint.biz.meeting.vo.response;

import com.mindplates.everyonesprint.biz.common.vo.response.SimpleUserResponse;
import com.mindplates.everyonesprint.biz.meeting.entity.Room;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long id;
    private String code;
    private MeetingResponse meeting;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer limitUserCount;
    private List<SimpleUserResponse> users;


    public RoomResponse(Room room) {
        this.id = room.getId();
        this.code = room.getCode();
        this.meeting = new MeetingResponse(room.getMeeting());
        this.startDate = room.getStartDate();
        this.endDate = room.getEndDate();
        this.limitUserCount = room.getLimitUserCount();
        this.users = room.getUsers().stream().map(
                (roomUser) -> SimpleUserResponse.builder()
                        .id(roomUser.getId())
                        .userId(roomUser.getUser().getId())
                        .email(roomUser.getUser().getEmail())
                        .name(roomUser.getUser().getName())
                        .alias(roomUser.getUser().getAlias())
                        .imageType(roomUser.getUser().getImageType())
                        .imageData(roomUser.getUser().getImageData())
                        .build()).collect(Collectors.toList());


    }


}
