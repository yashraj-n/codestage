package com.yashrajn.codestageserver.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
public class JwtSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;

    @Value("${client.url}")
    private String clientUrl;

    JwtSuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2AuthenticationToken auth = (OAuth2AuthenticationToken) authentication;

        if (auth.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No user details found in the token");
        }

        Map<String, Object> attributes = auth.getPrincipal().getAttributes();

        String token = jwtService.generateUserJwtToken(authentication.getName(), new JwtAdmin(
                auth.getName(),
                attributes.get("name").toString(),
                attributes.get("email").toString(),
                attributes.get("picture").toString()
        ));
        response.sendRedirect(clientUrl + "/auth/redirect?token=" + token);
    }
}
