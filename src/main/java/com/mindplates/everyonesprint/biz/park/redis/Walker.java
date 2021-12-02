package com.mindplates.everyonesprint.biz.park.redis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@Getter
@AllArgsConstructor
@Builder
@RedisHash(value = "walker")
public class Walker {
    @Id
    private String id;
    private Double x;
    private Double y;
}
