package com.yashrajn.codestageserver.controllers.ws;

import com.yashrajn.codestageserver.models.dto.Judge0Request;
import com.yashrajn.codestageserver.models.dto.Judge0Response;
import com.yashrajn.codestageserver.services.CodeChangeService;
import com.yashrajn.codestageserver.services.CodeExecutionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class WebSocketMessageController {

    private final CodeChangeService codeChangeService;
    private final CodeExecutionService codeExecutionService;

    public WebSocketMessageController(CodeChangeService codeChangeService, CodeExecutionService codeExecutionService) {
        this.codeChangeService = codeChangeService;
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
    public String languageSwitch(
            @Payload String lang
    ) {
        return lang;
    }

    @MessageMapping("/{sessionId}/code-change")
    @SendTo("/topic/{sessionId}/code-change")
    public String codeChange(@Payload String code, @DestinationVariable String sessionId) {
        codeChangeService.createCodeChange(sessionId, code);
        return code;
    }

    @MessageMapping("/{sessionId}/execute-code")
    @SendTo("/topic/{sessionId}/execute-code")
    public Judge0Response codeExecute(@Payload Judge0Request code) {
       return codeExecutionService.executeCode(code);
    }

    @MessageMapping("/{sessionId}/caret-move")
    @SendTo("/topic/{sessionId}/caret-move")
    public Integer[] caretMove(@Payload Integer[] message) {
        return message;
    }

    @MessageMapping("/{sessionId}/draw-diff")
    @SendTo("/topic/{sessionId}/draw-diff")
    public String caretMove(@Payload String message) {
        return message;
    }

}
