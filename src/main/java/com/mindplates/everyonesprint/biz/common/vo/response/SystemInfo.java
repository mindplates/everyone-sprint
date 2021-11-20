package com.mindplates.everyonesprint.biz.common.vo.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class SystemInfo {
    private String name;
    private String version;
}
