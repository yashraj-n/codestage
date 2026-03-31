package com.yashrajn.codestageserver.controllers.ws;

import com.yashrajn.codestageserver.models.dto.Judge0Request;
import com.yashrajn.codestageserver.models.dto.Judge0Response;
import com.yashrajn.codestageserver.models.entity.WorkspaceEventType;
import com.yashrajn.codestageserver.models.ws.EndSessionEvent;
import com.yashrajn.codestageserver.models.ws.WsWorkspaceEvent;
import com.yashrajn.codestageserver.services.WorkspaceService;
import com.yashrajn.codestageserver.services.CodeExecutionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import tools.jackson.databind.ObjectMapper;

@Controller
@Slf4j
public class WebSocketMessageController {

    private final WorkspaceService workspaceService;
    private final CodeExecutionService codeExecutionService;

    public WebSocketMessageController(WorkspaceService codeChangeService, CodeExecutionService codeExecutionService) {
        this.workspaceService = codeChangeService;
        this.codeExecutionService = codeExecutionService;
    }

    @MessageMapping("/{sessionId}/notes")
    @SendTo("/topic/{sessionId}/notes")
    public String sendMessage(@Payload String message) {
        return message;
    }

    @MessageMapping("/{sessionId}/mouse")
    @SendTo("/topic/{sessionId}/mouse")
    public Double[] sendMouseMessage(@Payload Double[] message) {
        return message;
    }

    @MessageMapping("/{sessionId}/language-switch")
    @SendTo("/topic/{sessionId}/language-switch")
    public String languageSwitch(@Payload String lang) {
        return lang;
    }

    @MessageMapping("/{sessionId}/code-change")
    @SendTo("/topic/{sessionId}/code-change")
    public String codeChange(@Payload String code, @DestinationVariable String sessionId) {
        workspaceService.createWorkspaceEventWithBuffer(sessionId, code, WorkspaceEventType.CODE_CHANGE);
        return code;
    }

    @MessageMapping("/{sessionId}/execute-code")
    @SendTo("/topic/{sessionId}/execute-code")
    public Judge0Response codeExecute(@Payload Judge0Request code, @DestinationVariable String sessionId) {
        Judge0Response response =  codeExecutionService.executeCode(code);
        workspaceService.createWorkspaceEvent(sessionId, new ObjectMapper().writeValueAsString(response), WorkspaceEventType.EXECUTE_CODE);
        return response;
    }

    @MessageMapping("/{sessionId}/caret-move")
    @SendTo("/topic/{sessionId}/caret-move")
    public Integer[] caretMove(@Payload Integer[] message) {
        return message;
    }

    @MessageMapping("/{sessionId}/draw-diff")
    @SendTo("/topic/{sessionId}/draw-diff")
    public String drawDiff(@Payload String message) {
        return message;
    }

    @MessageMapping("/{sessionId}/events")
    @SendTo("/topic/{sessionId}/events")
    public WsWorkspaceEvent events(@Payload WsWorkspaceEvent message, @DestinationVariable String sessionId) {
        workspaceService.createWorkspaceEvent(sessionId, message.getDetails(), message.getType());
        return message;
    }

    @MessageMapping("/{sessionId}/webrtc-signal")
    @SendTo("/topic/{sessionId}/webrtc-signal")
    public String webrtcSignal(@Payload String message) {
        return message;
    }

    @MessageMapping("/{sessionId}/end-session")
    @SendTo("/topic/{sessionId}/end-session")
    public EndSessionEvent endSession(@Payload EndSessionEvent message, @DestinationVariable String sessionId) {
        workspaceService.endSession(sessionId, message);
        return message;
    }


}
