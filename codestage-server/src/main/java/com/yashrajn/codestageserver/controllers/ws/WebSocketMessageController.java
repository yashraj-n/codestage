package com.yashrajn.codestageserver.controllers.ws;

import com.yashrajn.codestageserver.models.ws.StompMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;

@Controller
@Slf4j
public class WebSocketMessageController {
    @MessageMapping("/{sessionId}")
    @SendTo("/topic/messages/{sessionId}")
    public StompMessage<String> sendMessage(@Payload StompMessage<String> message, @DestinationVariable String sessionId, SimpMessageHeaderAccessor headerAccessor) {
        log.info("Header Accessor: {}", headerAccessor);
        log.info("Received message: {}", message);
        log.info("Sending message to session: {}", sessionId);
        return message;
    }

    @MessageMapping("/{sessionId}/mouse")
    @SendTo("/topic/messages/{sessionId}")
    public StompMessage<Double[]> sendMouseMessage(@Payload StompMessage<Double[]> message, @DestinationVariable String sessionId, SimpMessageHeaderAccessor headerAccessor) {
        log.info("Received mouse message: {}", message);
        return message;
    }

}
