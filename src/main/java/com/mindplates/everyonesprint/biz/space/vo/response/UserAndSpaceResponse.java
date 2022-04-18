package com.mindplates.everyonesprint.biz.space.vo.response;

import com.mindplates.everyonesprint.biz.user.vo.response.MyInfoResponse;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserAndSpaceResponse {

    private SpaceResponse space;
    private MyInfoResponse user;


}
