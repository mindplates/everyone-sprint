package com.mindplates.everyonesprint.biz.meeting.redis;

import com.mindplates.everyonesprint.biz.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
@RedisHash(value = "participant")
@Setter
public class Participant {
    @Id
    private String key;
    @Indexed
    private String id;
    @Indexed
    private String code;
    private String email;
    private String name;
    private String alias;
    private String imageType;
    private String imageData;
    private Boolean connected;
    private LocalDateTime joinTime;
    private LocalDateTime leaveTime;
    private String ip;
    @Indexed
    private String socketId;

    public Participant() {

    }

    public Participant(String code, User user, String ip, String socketId) {
        if (user != null) {
            this.key = code + user.getId();
            this.id = String.valueOf(user.getId());
            this.code = code;
            this.email = user.getEmail();
            this.name = user.getIsNameOpened() ? user.getName() : "";
            this.alias = user.getAlias();
            this.imageType = user.getImageType();
            this.imageData = user.getImageData();
            this.connected = true;
            this.joinTime = LocalDateTime.now();
            this.ip = ip;
            this.socketId = socketId;
        }
    }
}
