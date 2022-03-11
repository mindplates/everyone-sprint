package com.mindplates.everyonesprint.common.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum MeetingTypeCode {

    SMALLTALK("SMALLTALK"),
    MEETING("MEETING"),
    SCRUM("SCRUM");
    private String code;

}
