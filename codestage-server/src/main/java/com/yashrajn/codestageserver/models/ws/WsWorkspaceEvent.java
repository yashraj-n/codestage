package com.yashrajn.codestageserver.models.ws;

import com.yashrajn.codestageserver.models.entity.WorkspaceEventType;
import lombok.Data;

@Data
public class WsWorkspaceEvent {
    private WorkspaceEventType type;
    private String details;
    private String timestamp;
}
