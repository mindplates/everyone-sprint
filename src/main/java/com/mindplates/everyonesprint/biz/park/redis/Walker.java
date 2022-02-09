package com.mindplates.everyonesprint.biz.park.redis;

import com.mindplates.everyonesprint.biz.user.entity.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@RedisHash(value = "walker")
@Setter
public class Walker {
    @Id
    private String id;
    private String email;
    private String name;
    private String alias;
    private String imageType;
    private String imageData;

    private Double x;
    private Double y;

    public Walker(User user) {
        if (user != null) {
            this.id = String.valueOf(user.getId());
            this.email = user.getEmail();
            this.name = user.getIsNameOpened() ? user.getName() : "";
            this.alias = user.getAlias();
            this.imageType = user.getImageType();
            this.imageData = user.getImageData();
        }
    }
}
