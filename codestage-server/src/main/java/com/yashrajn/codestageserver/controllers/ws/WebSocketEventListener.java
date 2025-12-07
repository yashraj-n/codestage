package com.yashrajn.codestageserver.controllers.ws;

import com.yashrajn.codestageserver.models.ws.StompMessage;
import com.yashrajn.codestageserver.models.ws.StompMessageType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Objects;

@Component
@Slf4j
public class WebSocketEventListener {
    private final SimpMessageSendingOperations messagingTemplate;

    WebSocketEventListener(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
      log.debug("Received a disconnect event {}", event);
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        log.debug("User Principal: {}", accessor.getUser());
    }


}
