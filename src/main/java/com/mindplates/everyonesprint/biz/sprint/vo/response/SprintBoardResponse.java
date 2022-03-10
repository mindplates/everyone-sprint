package com.mindplates.everyonesprint.biz.sprint.vo.response;


import com.mindplates.everyonesprint.biz.meeting.vo.response.MeetingResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SprintBoardResponse {
    private List<MeetingResponse> scrumMeetings;
    private List<MeetingResponse> meetings;
    private List<ScrumMeetingAnswerResponse> scrumMeetingPlanAnswers;


}
