package com.yashrajn.codestageserver.auth;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.yashrajn.codestageserver.config.SecurityConfig;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Component
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        for (String publicEndpoint : SecurityConfig.AUTHENTICATION_WHITELIST) {
            if (pathMatcher.match(publicEndpoint, path)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Authorization header must be provided\"}");
            return;
        }

        String token = header.substring(7);
        JwtAdmin user;

        try {
            user = jwtService.validateUserJwtToken(token);
        } catch (JWTVerificationException err) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Invalid or Expired JWT token");
        }

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Invalid or Expired JWT token");
        }

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null, List.of());

        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        log.info("Setting Auth for url {} with user {}", request.getRequestURI(), user);
        SecurityContextHolder.getContext().setAuthentication(auth);
        chain.doFilter(request, response);
    }
}
