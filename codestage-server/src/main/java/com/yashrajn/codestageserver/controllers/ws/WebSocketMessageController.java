package com.yashrajn.codestageserver.controllers.ws;

import com.yashrajn.codestageserver.models.ws.StompMessage;
import com.yashrajn.codestageserver.services.CodeChangeService;
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

    public WebSocketMessageController(CodeChangeService codeChangeService) {
        this.codeChangeService = codeChangeService;
    }

    @MessageMapping("/{sessionId}/notes")
    @SendTo("/topic/{sessionId}/notes")
    public String sendMessage(@Payload String message) {
        return message;
    }

    @MessageMapping("/{sessionId}/mouse")
    @SendTo("/topic/{sessionId}/mouse")
    public StompMessage<Double[]> sendMouseMessage(@Payload StompMessage<Double[]> message) {
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
        log.info("Code change sent to topic: {}", sessionId);
        return code;
    }

}
