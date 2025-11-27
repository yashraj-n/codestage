package com.yashrajn.codestageserver.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class JwtSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;

    @Value("${client.redirect.url}")
    private String clientRedirectUrl;

    JwtSuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        String token = jwtService.generateJwtToken(authentication.getName());
        response.sendRedirect(clientRedirectUrl + "?token=" + token);
    }
}
