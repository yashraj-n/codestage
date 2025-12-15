package com.yashrajn.codestageserver.models.dto;

import com.yashrajn.codestageserver.models.entity.Assessment;
import com.yashrajn.codestageserver.models.entity.WorkspaceEvent;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventsResponse {
    private WorkspaceEvent[] events;
    private Assessment assessment;
}
