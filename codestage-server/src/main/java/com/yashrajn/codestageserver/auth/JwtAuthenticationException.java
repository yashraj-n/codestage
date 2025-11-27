package com.yashrajn.codestageserver.auth;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.AuthenticationException;

public class JwtAuthenticationException extends AuthenticationException {
    public JwtAuthenticationException(@Nullable String msg) {
        super(msg);
    }
}
