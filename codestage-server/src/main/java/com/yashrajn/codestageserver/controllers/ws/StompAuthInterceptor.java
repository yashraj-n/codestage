package com.yashrajn.codestageserver.controllers.ws;

import com.yashrajn.codestageserver.auth.JwtCandidate;
import com.yashrajn.codestageserver.auth.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StompAuthInterceptor implements ChannelInterceptor {
    private final JwtService jwtService;

    public StompAuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token == null)
                throw new AccessDeniedException("No token provided");

            JwtCandidate user = jwtService.validateCandidateJwtToken(token);

            accessor.setUser(user);
            return message;
        }


        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand()) || StompCommand.SEND.equals(accessor.getCommand())) {

            JwtCandidate user = (JwtCandidate) accessor.getUser();
            if (user == null)
                throw new AccessDeniedException("Not authenticated");

            String destination = accessor.getDestination();
            if (destination == null)
                throw new AccessDeniedException("Missing destination");

            String sessionId = destination.split("/")[2];

            if (!user.getSessionId().equals(sessionId)) {
                throw new AccessDeniedException("Not authorized to access this session");
            }
        }
        return message;
    }

}
